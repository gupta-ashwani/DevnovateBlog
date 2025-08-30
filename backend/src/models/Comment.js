const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: [true, "Comment content is required"],
      trim: true,
      minlength: [1, "Comment cannot be empty"],
      maxlength: [1000, "Comment cannot exceed 1000 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    likes: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    isEdited: {
      type: Boolean,
      default: false,
    },
    editedAt: {
      type: Date,
    },
    isHidden: {
      type: Boolean,
      default: false,
    },
    isReported: {
      type: Boolean,
      default: false,
    },
    reports: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          enum: ["spam", "inappropriate", "harassment", "other"],
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for like count
commentSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for reply count
commentSchema.virtual("replyCount", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
  count: true,
});

// Method to toggle like
commentSchema.methods.toggleLike = function (userId) {
  const existingLikeIndex = this.likes.findIndex(
    (like) => like.user.toString() === userId.toString()
  );

  if (existingLikeIndex > -1) {
    this.likes.splice(existingLikeIndex, 1);
    return { liked: false, likeCount: this.likes.length };
  } else {
    this.likes.push({ user: userId });
    return { liked: true, likeCount: this.likes.length };
  }
};

// Pre-save middleware to update blog comment count
commentSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const Blog = mongoose.model("Blog");
      await Blog.findByIdAndUpdate(this.blog, {
        $inc: { "metrics.comments": 1 },
      });
    } catch (error) {
      console.error("Error updating blog comment count:", error);
    }
  }
  next();
});

// Pre-remove middleware to update blog comment count
commentSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const Blog = mongoose.model("Blog");
      await Blog.findByIdAndUpdate(this.blog, {
        $inc: { "metrics.comments": -1 },
      });
    } catch (error) {
      console.error("Error updating blog comment count:", error);
    }
    next();
  }
);

// Static method to get comments for a blog
commentSchema.statics.getCommentsForBlog = function (blogId, options = {}) {
  const { page = 1, limit = 20, sort = { createdAt: -1 } } = options;
  const skip = (page - 1) * limit;

  return this.find({
    blog: blogId,
    parentComment: null,
    isHidden: false,
  })
    .populate("author", "username firstName lastName avatar")
    .populate({
      path: "replies",
      populate: {
        path: "author",
        select: "username firstName lastName avatar",
      },
    })
    .sort(sort)
    .skip(skip)
    .limit(limit);
};

// Virtual populate for replies
commentSchema.virtual("replies", {
  ref: "Comment",
  localField: "_id",
  foreignField: "parentComment",
});

// Indexes for better query performance
commentSchema.index({ blog: 1, createdAt: -1 });
commentSchema.index({ author: 1 });
commentSchema.index({ parentComment: 1 });

module.exports = mongoose.model("Comment", commentSchema);
