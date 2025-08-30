const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const Like = require("../models/Like");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/error");

// @desc    Get user's blog analytics overview
// @route   GET /api/analytics/overview
// @access  Private
const getUserAnalyticsOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Get all user's blogs
  const userBlogs = await Blog.find({ author: userId });
  const blogIds = userBlogs.map((blog) => blog._id);

  // Calculate metrics
  const totalViews = userBlogs.reduce(
    (sum, blog) => sum + (blog.metrics?.views || 0),
    0
  );
  const totalLikes = userBlogs.reduce(
    (sum, blog) => sum + (blog.metrics?.likes || 0),
    0
  );
  const totalComments = userBlogs.reduce(
    (sum, blog) => sum + (blog.metrics?.comments || 0),
    0
  );
  const totalShares = userBlogs.reduce(
    (sum, blog) => sum + (blog.metrics?.shares || 0),
    0
  );

  // Blog status counts
  const statusCounts = userBlogs.reduce((acc, blog) => {
    acc[blog.status] = (acc[blog.status] || 0) + 1;
    return acc;
  }, {});

  // Calculate average metrics
  const publishedBlogs = statusCounts.approved || 0;
  const avgViewsPerBlog =
    publishedBlogs > 0 ? Math.round(totalViews / publishedBlogs) : 0;
  const avgLikesPerBlog =
    publishedBlogs > 0 ? Math.round(totalLikes / publishedBlogs) : 0;
  const avgCommentsPerBlog =
    publishedBlogs > 0 ? Math.round(totalComments / publishedBlogs) : 0;

  // Calculate overall engagement rate
  const totalEngagements = totalLikes + totalComments;
  const engagementRate =
    totalViews > 0 ? ((totalEngagements / totalViews) * 100).toFixed(2) : 0;

  // Get top performing blogs
  const topBlogs = userBlogs
    .sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0))
    .slice(0, 5)
    .map((blog) => ({
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      views: blog.metrics?.views || 0,
      likes: blog.metrics?.likes || 0,
      comments: blog.metrics?.comments || 0,
      publishedAt: blog.publishedAt,
      status: blog.status,
    }));

  // Recent activity (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentBlogs = userBlogs.filter(
    (blog) => blog.createdAt >= thirtyDaysAgo
  ).length;

  const recentLikes = await Like.countDocuments({
    blog: { $in: blogIds },
    createdAt: { $gte: thirtyDaysAgo },
  });

  const recentComments = await Comment.countDocuments({
    blog: { $in: blogIds },
    createdAt: { $gte: thirtyDaysAgo },
  });

  res.json({
    status: "success",
    data: {
      overview: {
        totalBlogs: userBlogs.length,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        publishedBlogs: statusCounts.approved || 0,
        draftBlogs: statusCounts.draft || 0,
        pendingBlogs: statusCounts.pending || 0,
        rejectedBlogs: statusCounts.rejected || 0,
        avgViewsPerBlog,
        avgLikesPerBlog,
        avgCommentsPerBlog,
        engagementRate: parseFloat(engagementRate),
      },
      topPerformingBlogs: topBlogs,
      recentActivity: {
        newBlogs: recentBlogs,
        newLikes: recentLikes,
        newComments: recentComments,
      },
    },
  });
});

// @desc    Get any user's public analytics overview
// @route   GET /api/analytics/user/:userId/overview
// @access  Public
const getPublicUserAnalytics = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  // Verify user exists
  const user = await User.findById(userId).select(
    "username firstName lastName avatar"
  );
  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  // Get only published blogs for public analytics
  const userBlogs = await Blog.find({ author: userId, status: "approved" });
  const blogIds = userBlogs.map((blog) => blog._id);

  // Calculate metrics (only from published blogs)
  const totalViews = userBlogs.reduce(
    (sum, blog) => sum + (blog.metrics?.views || 0),
    0
  );
  const totalLikes = userBlogs.reduce(
    (sum, blog) => sum + (blog.metrics?.likes || 0),
    0
  );
  const totalComments = userBlogs.reduce(
    (sum, blog) => sum + (blog.metrics?.comments || 0),
    0
  );
  const totalShares = userBlogs.reduce(
    (sum, blog) => sum + (blog.metrics?.shares || 0),
    0
  );

  // Get top performing published blogs
  const topBlogs = userBlogs
    .sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0))
    .slice(0, 5)
    .map((blog) => ({
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      views: blog.metrics?.views || 0,
      likes: blog.metrics?.likes || 0,
      comments: blog.metrics?.comments || 0,
      publishedAt: blog.publishedAt,
      status: blog.status,
      tags: blog.tags.slice(0, 3), // Limit tags for display
    }));

  // Calculate average metrics for published blogs
  const publishedCount = userBlogs.length;
  const avgViewsPerBlog =
    publishedCount > 0 ? Math.round(totalViews / publishedCount) : 0;
  const avgLikesPerBlog =
    publishedCount > 0 ? Math.round(totalLikes / publishedCount) : 0;
  const avgCommentsPerBlog =
    publishedCount > 0 ? Math.round(totalComments / publishedCount) : 0;

  // Calculate overall engagement rate
  const totalEngagements = totalLikes + totalComments;
  const engagementRate =
    totalViews > 0 ? ((totalEngagements / totalViews) * 100).toFixed(2) : 0;

  // Recent activity (last 30 days) - only published blogs
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentBlogs = userBlogs.filter(
    (blog) => blog.publishedAt >= thirtyDaysAgo
  ).length;

  const recentLikes = await Like.countDocuments({
    blog: { $in: blogIds },
    createdAt: { $gte: thirtyDaysAgo },
  });

  const recentComments = await Comment.countDocuments({
    blog: { $in: blogIds },
    createdAt: { $gte: thirtyDaysAgo },
  });

  res.json({
    status: "success",
    data: {
      user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        avatar: user.avatar,
      },
      overview: {
        totalBlogs: userBlogs.length,
        totalViews,
        totalLikes,
        totalComments,
        totalShares,
        publishedBlogs: userBlogs.length, // All are published in public view
        draftBlogs: 0, // Not visible in public analytics
        pendingBlogs: 0, // Not visible in public analytics
        rejectedBlogs: 0, // Not visible in public analytics
        avgViewsPerBlog,
        avgLikesPerBlog,
        avgCommentsPerBlog,
        engagementRate: parseFloat(engagementRate),
      },
      topPerformingBlogs: topBlogs,
      recentActivity: {
        newBlogs: recentBlogs,
        newLikes: recentLikes,
        newComments: recentComments,
      },
    },
  });
});

// @desc    Get any user's published blogs analytics
// @route   GET /api/analytics/user/:userId/blogs
// @access  Public
const getPublicUserBlogsAnalytics = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    page = 1,
    limit = 10,
    sortBy = "views",
    sortOrder = "desc",
  } = req.query;

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  const skip = (page - 1) * limit;
  const sortOptions = {};
  const sortField =
    sortBy === "views"
      ? "metrics.views"
      : sortBy === "likes"
      ? "metrics.likes"
      : sortBy === "comments"
      ? "metrics.comments"
      : "publishedAt";

  sortOptions[sortField] = sortOrder === "desc" ? -1 : 1;

  // Only get published blogs for public view
  const blogs = await Blog.find({ author: userId, status: "approved" })
    .select("title slug publishedAt metrics tags readingTime")
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Blog.countDocuments({
    author: userId,
    status: "approved",
  });

  // Calculate performance metrics for each blog
  const blogsWithMetrics = blogs.map((blog) => {
    const engagementRate =
      blog.metrics.views > 0
        ? (
            ((blog.metrics.likes + blog.metrics.comments) /
              blog.metrics.views) *
            100
          ).toFixed(2)
        : 0;

    return {
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      publishedAt: blog.publishedAt,
      tags: blog.tags,
      readingTime: blog.readingTime,
      metrics: {
        views: blog.metrics.views || 0,
        likes: blog.metrics.likes || 0,
        comments: blog.metrics.comments || 0,
        shares: blog.metrics.shares || 0,
        engagementRate: parseFloat(engagementRate),
      },
    };
  });

  res.json({
    status: "success",
    data: {
      user: {
        _id: user._id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      blogs: blogsWithMetrics,
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

// @desc    Get all blogs analytics for authenticated user
// @route   GET /api/analytics/blogs
// @access  Private
const getAllBlogsAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const {
    page = 1,
    limit = 10,
    sortBy = "views",
    sortOrder = "desc",
  } = req.query;

  // Build sort object
  const sort = {};
  if (sortBy === "views") {
    sort["metrics.views"] = sortOrder === "asc" ? 1 : -1;
  } else if (sortBy === "likes") {
    sort["metrics.likes"] = sortOrder === "asc" ? 1 : -1;
  } else if (sortBy === "comments") {
    sort["metrics.comments"] = sortOrder === "asc" ? 1 : -1;
  } else if (sortBy === "createdAt") {
    sort.createdAt = sortOrder === "asc" ? 1 : -1;
  }

  // Get user's blogs with pagination
  const total = await Blog.countDocuments({ author: userId });
  const blogs = await Blog.find({ author: userId })
    .populate("author", "username firstName lastName")
    .sort(sort)
    .skip((page - 1) * limit)
    .limit(parseInt(limit))
    .select(
      "_id title slug status publishedAt tags readingTime metrics createdAt"
    );

  // Format blogs with analytics
  const blogsWithMetrics = blogs.map((blog) => {
    const engagementRate =
      blog.metrics.views > 0
        ? (
            ((blog.metrics.likes + blog.metrics.comments) /
              blog.metrics.views) *
            100
          ).toFixed(2)
        : 0;

    return {
      _id: blog._id,
      title: blog.title,
      slug: blog.slug,
      status: blog.status,
      publishedAt: blog.publishedAt,
      tags: blog.tags,
      readingTime: blog.readingTime,
      metrics: {
        views: blog.metrics.views || 0,
        likes: blog.metrics.likes || 0,
        comments: blog.metrics.comments || 0,
        shares: blog.metrics.shares || 0,
        engagementRate: parseFloat(engagementRate),
      },
      createdAt: blog.createdAt,
    };
  });

  res.json({
    status: "success",
    data: {
      blogs: blogsWithMetrics,
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

module.exports = {
  getUserAnalyticsOverview,
  getAllBlogsAnalytics,
  getPublicUserAnalytics,
  getPublicUserBlogsAnalytics,
};
