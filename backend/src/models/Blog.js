const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      minlength: [3, "Title must be at least 3 characters long"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    slug: {
      type: String,
      lowercase: true,
      trim: true,
    },
    content: {
      type: String,
      required: [true, "Blog content is required"],
      minlength: [50, "Content must be at least 50 characters long"],
    },
    excerpt: {
      type: String,
      maxlength: [300, "Excerpt cannot exceed 300 characters"],
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    featuredImage: {
      type: String,
      default: "",
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true,
      },
    ],
    status: {
      type: String,
      enum: ["draft", "pending", "approved", "rejected", "hidden"],
      default: "draft",
    },
    publishedAt: {
      type: Date,
    },
    // Engagement metrics
    metrics: {
      views: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      comments: { type: Number, default: 0 },
      shares: { type: Number, default: 0 },
    },
    // SEO fields
    seo: {
      metaTitle: { type: String, maxlength: 60 },
      metaDescription: { type: String, maxlength: 160 },
      keywords: [{ type: String }],
    },
    // Reading time in minutes
    readingTime: {
      type: Number,
      default: 1,
    },
    // Trending score calculation
    trendingScore: {
      type: Number,
      default: 0,
    },
    // Admin fields
    adminNotes: {
      type: String,
      default: "",
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviewedAt: {
      type: Date,
    },
    // Content settings
    isCommentEnabled: {
      type: Boolean,
      default: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    isPinned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual for formatted publish date
blogSchema.virtual("formattedPublishDate").get(function () {
  if (this.publishedAt) {
    return this.publishedAt.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }
  return null;
});

// Pre-save middleware to generate slug and calculate reading time
blogSchema.pre("save", async function (next) {
  if (this.isModified("title")) {
    let baseSlug = this.title
      .toLowerCase()
      .replace(/[^a-zA-Z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .substring(0, 50);

    // Handle duplicate slugs only for approved blogs
    let slug = baseSlug;
    let counter = 1;

    // Only check for duplicates if this blog is approved or becoming approved
    if (
      this.status === "approved" &&
      (this.isNew || this.isModified("title") || this.isModified("status"))
    ) {
      while (true) {
        const existingBlog = await this.constructor.findOne({
          slug: slug,
          status: "approved",
          _id: { $ne: this._id },
        });

        if (!existingBlog) {
          break;
        }

        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    this.slug = slug;
  }

  if (this.isModified("content")) {
    // Calculate reading time (average 200 words per minute)
    const wordCount = this.content.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);

    // Generate excerpt if not provided
    if (!this.excerpt) {
      this.excerpt =
        this.content
          .replace(/[#*`]/g, "") // Remove markdown formatting
          .substring(0, 150) + "...";
    }
  }

  // Calculate trending score
  this.calculateTrendingScore();

  next();
});

// Method to calculate trending score
blogSchema.methods.calculateTrendingScore = function () {
  const now = new Date();
  const publishDate = this.publishedAt || this.createdAt;
  const daysSincePublish = (now - publishDate) / (1000 * 60 * 60 * 24);

  // Decay factor - newer posts get higher scores
  const decayFactor = Math.exp(-0.1 * daysSincePublish);

  // Engagement score
  const engagementScore =
    this.metrics.likes * 2 +
    this.metrics.comments * 3 +
    this.metrics.views * 0.1 +
    this.metrics.shares * 5;

  this.trendingScore = engagementScore * decayFactor;
};

// Method to increment view count
blogSchema.methods.incrementViews = function () {
  this.metrics.views += 1;
  this.calculateTrendingScore();
  return this.save();
};

// Static method to get trending blogs
blogSchema.statics.getTrending = function (limit = 10) {
  return this.find({ status: "approved" })
    .sort({ trendingScore: -1, createdAt: -1 })
    .limit(limit)
    .populate("author", "username firstName lastName avatar")
    .select("-content");
};

// Static method to search blogs
blogSchema.statics.searchBlogs = function (query, options = {}) {
  const searchQuery = {
    status: "approved",
    $or: [
      { title: { $regex: query, $options: "i" } },
      { content: { $regex: query, $options: "i" } },
      { tags: { $in: [new RegExp(query, "i")] } },
    ],
  };

  return this.find(searchQuery)
    .sort(options.sort || { createdAt: -1 })
    .limit(options.limit || 20)
    .populate("author", "username firstName lastName avatar")
    .select(options.select || "-content");
};

// Indexes for better query performance
blogSchema.index({ slug: 1 });
blogSchema.index({ author: 1 });
blogSchema.index({ status: 1 });
blogSchema.index({ publishedAt: -1 });
blogSchema.index({ trendingScore: -1 });
blogSchema.index({ tags: 1 });
blogSchema.index({ title: "text", content: "text" });

// Partial unique index: slug must be unique only for approved blogs
blogSchema.index(
  { slug: 1 },
  {
    unique: true,
    partialFilterExpression: { status: "approved" },
  }
);

module.exports = mongoose.model("Blog", blogSchema);
