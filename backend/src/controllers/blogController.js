const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/error");

// @desc    Get all blogs (public)
// @route   GET /api/blogs
// @access  Public
const getAllBlogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    tag,
    author,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const query = { status: "approved" };

  // Apply filters
  if (tag) query.tags = { $in: [tag] };
  if (author) query.author = author;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
      { tags: { $in: [new RegExp(search, "i")] } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const blogs = await Blog.find(query)
    .populate("author", "username firstName lastName avatar")
    .select("-content") // Exclude full content for list view
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Blog.countDocuments(query);

  res.json({
    status: "success",
    data: {
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Get trending blogs
// @route   GET /api/blogs/trending
// @access  Public
const getTrendingBlogs = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const trendingBlogs = await Blog.getTrending(parseInt(limit));

  res.json({
    status: "success",
    data: {
      blogs: trendingBlogs,
    },
  });
});

// @desc    Get latest blogs
// @route   GET /api/blogs/latest
// @access  Public
const getLatestBlogs = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const latestBlogs = await Blog.find({ status: "approved" })
    .populate("author", "username firstName lastName avatar")
    .select("-content")
    .sort({ publishedAt: -1, createdAt: -1 })
    .limit(parseInt(limit));

  res.json({
    status: "success",
    data: {
      blogs: latestBlogs,
    },
  });
});

// @desc    Get featured blogs
// @route   GET /api/blogs/featured
// @access  Public
const getFeaturedBlogs = asyncHandler(async (req, res) => {
  const { limit = 5 } = req.query;

  const featuredBlogs = await Blog.find({
    status: "approved",
    isFeatured: true,
  })
    .populate("author", "username firstName lastName avatar")
    .select("-content")
    .sort({ createdAt: -1 })
    .limit(parseInt(limit));

  res.json({
    status: "success",
    data: {
      blogs: featuredBlogs,
    },
  });
});

// @desc    Get single blog by slug
// @route   GET /api/blogs/:slug
// @access  Public
const getBlogBySlug = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const blog = await Blog.findOne({ slug, status: "approved" }).populate(
    "author",
    "username firstName lastName avatar bio socialLinks"
  );

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  // Session-based view tracking to prevent rapid increment
  const sessionKey = `view_${blog._id}_${req.ip}`;
  const userAgent = req.get("User-Agent") || "";
  const sessionId = req.sessionID || `${req.ip}_${userAgent.substring(0, 50)}`;
  const viewKey = `${sessionKey}_${sessionId}`;

  // Check if this session has already viewed this blog recently (within 1 hour)
  if (!req.session.viewedBlogs) {
    req.session.viewedBlogs = {};
  }

  const lastViewTime = req.session.viewedBlogs[viewKey];
  const now = Date.now();
  const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

  // Only increment view if not viewed in the last hour
  if (!lastViewTime || now - lastViewTime > oneHour) {
    // Increment view count (fire and forget)
    blog
      .incrementViews()
      .catch((err) => console.error("Error incrementing views:", err));

    // Mark this blog as viewed in this session
    req.session.viewedBlogs[viewKey] = now;
  }

  // Check if current user liked this blog
  let isLiked = false;
  if (req.user) {
    const like = await Like.findOne({
      user: req.user._id,
      blog: blog._id,
    });
    isLiked = !!like;
  }

  res.json({
    status: "success",
    data: {
      blog: {
        ...blog.toObject(),
        isLiked,
      },
    },
  });
});

// @desc    Get single blog by ID
// @route   GET /api/blogs/id/:id
// @access  Private
const getBlogById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id).populate(
    "author",
    "username firstName lastName avatar bio socialLinks"
  );

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  // Check if user has permission to view this blog
  if (blog.status !== "approved") {
    // Only author or admin can view non-approved blogs
    if (
      !req.user ||
      (blog.author._id.toString() !== req.user._id.toString() &&
        req.user.role !== "admin")
    ) {
      return res.status(403).json({
        status: "error",
        message: "Not authorized to view this blog",
      });
    }
  }

  // Check if current user liked this blog (only for approved blogs)
  let isLiked = false;
  if (req.user && blog.status === "approved") {
    const like = await Like.findOne({
      user: req.user._id,
      blog: blog._id,
    });
    isLiked = !!like;
  }

  res.json({
    status: "success",
    data: {
      blog: {
        ...blog.toObject(),
        isLiked,
      },
    },
  });
});

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private
const createBlog = asyncHandler(async (req, res) => {
  const blogData = {
    ...req.body,
    author: req.user._id,
  };

  // Set publish date if status is approved (admin only)
  if (blogData.status === "approved" && req.user.role === "admin") {
    blogData.publishedAt = new Date();
  }

  // Regular users can only create drafts or submit for pending
  if (req.user.role !== "admin") {
    blogData.status = blogData.status === "pending" ? "pending" : "draft";
  }

  const blog = await Blog.create(blogData);
  await blog.populate("author", "username firstName lastName avatar");

  // Update user stats
  await User.findByIdAndUpdate(req.user._id, {
    $inc: { "stats.totalBlogs": 1 },
  });

  res.status(201).json({
    status: "success",
    message: "Blog created successfully",
    data: {
      blog,
    },
  });
});

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Owner or Admin)
const updateBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  // Check ownership or admin role
  if (
    blog.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      status: "error",
      message: "Not authorized to update this blog",
    });
  }

  // Restrict status updates for non-admin users
  if (req.user.role !== "admin") {
    // Allow users to submit drafts for review (draft -> pending)
    // But don't allow other status changes
    if (req.body.status && req.body.status !== "pending") {
      delete req.body.status;
    }
    delete req.body.isFeatured;
    delete req.body.isPinned;
  }

  // Set publish date if status changed to approved
  if (req.body.status === "approved" && blog.status !== "approved") {
    req.body.publishedAt = new Date();
  }

  const updatedBlog = await Blog.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate("author", "username firstName lastName avatar");

  res.json({
    status: "success",
    message: "Blog updated successfully",
    data: {
      blog: updatedBlog,
    },
  });
});

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Owner or Admin)
const deleteBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  // Check ownership or admin role
  if (
    blog.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      status: "error",
      message: "Not authorized to delete this blog",
    });
  }

  // Delete associated comments and likes
  await Comment.deleteMany({ blog: id });
  await Like.deleteMany({ blog: id });

  await Blog.findByIdAndDelete(id);

  // Update user stats
  await User.findByIdAndUpdate(blog.author, {
    $inc: { "stats.totalBlogs": -1 },
  });

  res.json({
    status: "success",
    message: "Blog deleted successfully",
  });
});

// @desc    Get user's own blogs
// @route   GET /api/blogs/my-blogs
// @access  Private
const getMyBlogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const query = { author: req.user._id };

  if (status) query.status = status;

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const blogs = await Blog.find(query)
    .select("-content")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Blog.countDocuments(query);

  res.json({
    status: "success",
    data: {
      blogs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalBlogs: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Toggle blog like
// @route   POST /api/blogs/:id/like
// @access  Private
const toggleBlogLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  if (blog.status !== "approved") {
    return res.status(400).json({
      status: "error",
      message: "Cannot like unpublished blog",
    });
  }

  const existingLike = await Like.findOne({
    user: req.user._id,
    blog: id,
  });

  if (existingLike) {
    // Unlike
    await existingLike.deleteOne();

    res.json({
      status: "success",
      message: "Blog unliked",
      data: {
        liked: false,
        likeCount: blog.metrics.likes - 1,
      },
    });
  } else {
    // Like
    await Like.create({
      user: req.user._id,
      blog: id,
    });

    res.json({
      status: "success",
      message: "Blog liked",
      data: {
        liked: true,
        likeCount: blog.metrics.likes + 1,
      },
    });
  }
});

// @desc    Search blogs
// @route   GET /api/blogs/search
// @access  Public
const searchBlogs = asyncHandler(async (req, res) => {
  const { q, limit = 20 } = req.query;

  if (!q) {
    return res.status(400).json({
      status: "error",
      message: "Search query is required",
    });
  }

  const blogs = await Blog.searchBlogs(q, { limit: parseInt(limit) });

  res.json({
    status: "success",
    data: {
      blogs,
      searchQuery: q,
    },
  });
});

module.exports = {
  getAllBlogs,
  getTrendingBlogs,
  getLatestBlogs,
  getFeaturedBlogs,
  getBlogBySlug,
  getBlogById,
  createBlog,
  updateBlog,
  deleteBlog,
  getMyBlogs,
  toggleBlogLike,
  searchBlogs,
};
