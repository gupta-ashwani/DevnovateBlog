const Blog = require("../models/Blog");
const User = require("../models/User");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const { asyncHandler } = require("../middleware/error");

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin only)
const getDashboardStats = asyncHandler(async (req, res) => {
  const [
    totalUsers,
    totalBlogs,
    totalComments,
    totalLikes,
    pendingBlogs,
    publishedBlogs,
    recentUsers,
    recentBlogs,
    topAuthors,
  ] = await Promise.all([
    User.countDocuments(),
    Blog.countDocuments(),
    Comment.countDocuments(),
    Like.countDocuments(),
    Blog.countDocuments({ status: "pending" }),
    Blog.countDocuments({ status: "approved" }),
    User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("username email firstName lastName createdAt"),
    Blog.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("author", "username firstName lastName")
      .select("title status createdAt"),
    Blog.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$author",
          blogCount: { $sum: 1 },
          totalViews: { $sum: "$metrics.views" },
        },
      },
      { $sort: { blogCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "author",
        },
      },
      { $unwind: "$author" },
      {
        $project: {
          "author.username": 1,
          "author.firstName": 1,
          "author.lastName": 1,
          blogCount: 1,
          totalViews: 1,
        },
      },
    ]),
  ]);

  // Blog stats by month (last 6 months)
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const blogsByMonth = await Blog.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": 1, "_id.month": 1 } },
  ]);

  res.json({
    status: "success",
    data: {
      overview: {
        totalUsers,
        totalBlogs,
        totalComments,
        totalLikes,
        pendingBlogs,
        publishedBlogs,
      },
      recentActivity: {
        recentUsers,
        recentBlogs,
      },
      topAuthors,
      blogsByMonth,
    },
  });
});

// @desc    Get pending blogs for review
// @route   GET /api/admin/blogs/pending
// @access  Private (Admin only)
const getPendingBlogs = asyncHandler(async (req, res) => {
  const pendingBlogs = await Blog.find({ status: "pending" })
    .populate("author", "username firstName lastName email")
    .sort({ createdAt: -1 })
    .limit(50); // Limit to 50 pending blogs

  res.json({
    status: "success",
    data: {
      blogs: pendingBlogs,
    },
  });
});

// @desc    Get recent users
// @route   GET /api/admin/users/recent
// @access  Private (Admin only)
const getRecentUsers = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const recentUsers = await User.find()
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .select("-password")
    .populate({
      path: "stats",
      select: "totalBlogs totalViews totalLikes followersCount",
    });

  res.json({
    status: "success",
    data: {
      users: recentUsers,
    },
  });
});

// @desc    Get all users for admin
// @route   GET /api/admin/users
// @access  Private (Admin only)
const getAllUsers = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    search,
    role,
    isActive,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {};

  // Apply filters
  if (search) {
    query.$or = [
      { username: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
    ];
  }
  if (role) query.role = role;
  if (isActive !== undefined) query.isActive = isActive === "true";

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const users = await User.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select("-password");

  const total = await User.countDocuments(query);

  res.json({
    status: "success",
    data: {
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalUsers: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Get all blogs for admin
// @route   GET /api/admin/blogs
// @access  Private (Admin only)
const getAllBlogsAdmin = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 20,
    status,
    author,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (page - 1) * limit;
  const query = {};

  // Apply filters
  if (status) query.status = status;
  if (author) query.author = author;
  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { content: { $regex: search, $options: "i" } },
    ];
  }

  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "desc" ? -1 : 1;

  const blogs = await Blog.find(query)
    .populate("author", "username firstName lastName email")
    .populate("reviewedBy", "username firstName lastName")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .select("-content"); // Exclude content for list view

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

// @desc    Approve or reject blog
// @route   PUT /api/admin/blogs/:id/review
// @access  Private (Admin only)
const reviewBlog = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, adminNotes } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      status: "error",
      message: "Status must be either approved or rejected",
    });
  }

  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  // Update blog status and review details
  blog.status = status;
  blog.reviewedBy = req.user._id;
  blog.reviewedAt = new Date();
  blog.adminNotes = adminNotes || "";

  // Set publish date if approved
  if (status === "approved") {
    blog.publishedAt = new Date();
  }

  await blog.save();
  await blog.populate("author", "username firstName lastName email");

  // TODO: Send email notification to author
  // await sendBlogStatusNotification(blog);

  res.json({
    status: "success",
    message: `Blog ${status} successfully`,
    data: {
      blog,
    },
  });
});

// @desc    Toggle blog featured status
// @route   PUT /api/admin/blogs/:id/featured
// @access  Private (Admin only)
const toggleBlogFeatured = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  blog.isFeatured = !blog.isFeatured;
  await blog.save();

  res.json({
    status: "success",
    message: `Blog ${blog.isFeatured ? "featured" : "unfeatured"} successfully`,
    data: {
      blog: {
        _id: blog._id,
        title: blog.title,
        isFeatured: blog.isFeatured,
      },
    },
  });
});

// @desc    Hide/Show blog
// @route   PUT /api/admin/blogs/:id/visibility
// @access  Private (Admin only)
const toggleBlogVisibility = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  // Toggle between approved and hidden
  blog.status = blog.status === "hidden" ? "approved" : "hidden";
  await blog.save();

  res.json({
    status: "success",
    message: `Blog ${
      blog.status === "hidden" ? "hidden" : "shown"
    } successfully`,
    data: {
      blog: {
        _id: blog._id,
        title: blog.title,
        status: blog.status,
      },
    },
  });
});

// @desc    Delete blog (admin)
// @route   DELETE /api/admin/blogs/:id
// @access  Private (Admin only)
const deleteBlogAdmin = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const blog = await Blog.findById(id);

  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
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

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/status
// @access  Private (Admin only)
const toggleUserStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    return res.status(400).json({
      status: "error",
      message: "Cannot change your own status",
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  user.isActive = !user.isActive;
  await user.save();

  res.json({
    status: "success",
    message: `User ${user.isActive ? "activated" : "deactivated"} successfully`,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
      },
    },
  });
});

// @desc    Change user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin only)
const changeUserRole = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { role } = req.body;

  if (!["user", "admin"].includes(role)) {
    return res.status(400).json({
      status: "error",
      message: "Role must be either user or admin",
    });
  }

  if (id === req.user._id.toString()) {
    return res.status(400).json({
      status: "error",
      message: "Cannot change your own role",
    });
  }

  const user = await User.findById(id);

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  user.role = role;
  await user.save();

  res.json({
    status: "success",
    message: `User role changed to ${role} successfully`,
    data: {
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    },
  });
});

// @desc    Get reported comments
// @route   GET /api/admin/comments/reported
// @access  Private (Admin only)
const getReportedComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const reportedComments = await Comment.find({ isReported: true })
    .populate("author", "username firstName lastName email")
    .populate("blog", "title slug")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Comment.countDocuments({ isReported: true });

  res.json({
    status: "success",
    data: {
      comments: reportedComments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Moderate comment (hide/show)
// @route   PUT /api/admin/comments/:id/moderate
// @access  Private (Admin only)
const moderateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { action } = req.body; // 'hide' or 'show'

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      status: "error",
      message: "Comment not found",
    });
  }

  if (action === "hide") {
    comment.isHidden = true;
    comment.isReported = false; // Clear reported status
  } else if (action === "show") {
    comment.isHidden = false;
    comment.isReported = false; // Clear reported status
  } else {
    return res.status(400).json({
      status: "error",
      message: "Action must be either hide or show",
    });
  }

  await comment.save();

  res.json({
    status: "success",
    message: `Comment ${action === "hide" ? "hidden" : "shown"} successfully`,
    data: {
      comment: {
        _id: comment._id,
        isHidden: comment.isHidden,
        isReported: comment.isReported,
      },
    },
  });
});

module.exports = {
  getDashboardStats,
  getAllUsers,
  getAllBlogsAdmin,
  getPendingBlogs,
  getRecentUsers,
  reviewBlog,
  toggleBlogFeatured,
  toggleBlogVisibility,
  deleteBlogAdmin,
  toggleUserStatus,
  changeUserRole,
  getReportedComments,
  moderateComment,
};
