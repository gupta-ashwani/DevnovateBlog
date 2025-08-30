const mongoose = require("mongoose");

const likeSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    type: {
      type: String,
      enum: ["like", "love", "insightful", "helpful"],
      default: "like",
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one like per user per blog
likeSchema.index({ user: 1, blog: 1 }, { unique: true });

// Pre-save middleware to update blog like count
likeSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const Blog = mongoose.model("Blog");
      await Blog.findByIdAndUpdate(this.blog, {
        $inc: { "metrics.likes": 1 },
      });
    } catch (error) {
      console.error("Error updating blog like count:", error);
    }
  }
  next();
});

// Pre-remove middleware to update blog like count
likeSchema.pre(
  "deleteOne",
  { document: true, query: false },
  async function (next) {
    try {
      const Blog = mongoose.model("Blog");
      await Blog.findByIdAndUpdate(this.blog, {
        $inc: { "metrics.likes": -1 },
      });
    } catch (error) {
      console.error("Error updating blog like count:", error);
    }
    next();
  }
);

module.exports = mongoose.model("Like", likeSchema);
