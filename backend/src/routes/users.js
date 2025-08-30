const express = require("express");
const { body } = require("express-validator");
const User = require("../models/User");
const Blog = require("../models/Blog");
const Comment = require("../models/Comment");
const { authenticateToken } = require("../middleware/auth");
const { asyncHandler } = require("../middleware/error");
const { handleValidationErrors } = require("../middleware/error");

const router = express.Router();

// @desc    Get current user profile
// @route   GET /api/users/me
// @access  Private
const getCurrentUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  res.json({
    status: "success",
    data: {
      user,
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/users/me
// @access  Private
const updateProfile = asyncHandler(async (req, res) => {
  const { username, firstName, lastName, bio, avatar, socialLinks } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  // Check if username is being updated and if it's already taken
  if (username !== undefined && username !== user.username) {
    const existingUser = await User.findOne({ username });
    if (existingUser && existingUser._id.toString() !== user._id.toString()) {
      return res.status(400).json({
        status: "error",
        message: "Username is already taken",
      });
    }
    user.username = username;
  }

  // Update fields if provided
  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (bio !== undefined) user.bio = bio;
  if (avatar !== undefined) user.avatar = avatar;
  if (socialLinks !== undefined) {
    user.socialLinks = { ...user.socialLinks, ...socialLinks };
  }

  await user.save();

  res.json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user: user.toJSON(),
    },
  });
});

// @desc    Get current user stats
// @route   GET /api/users/me/stats
// @access  Private
const getCurrentUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("stats");

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  // Get additional blog stats
  const [publishedBlogs, draftBlogs, pendingBlogs, rejectedBlogs] =
    await Promise.all([
      Blog.countDocuments({ author: userId, status: "approved" }),
      Blog.countDocuments({ author: userId, status: "draft" }),
      Blog.countDocuments({ author: userId, status: "pending" }),
      Blog.countDocuments({ author: userId, status: "rejected" }),
    ]);

  // Calculate total comments across all user's approved blogs
  const totalComments = await Comment.countDocuments({
    blog: {
      $in: await Blog.find({ author: userId, status: "approved" }).distinct(
        "_id"
      ),
    },
  });

  const stats = {
    ...user.stats.toObject(),
    publishedBlogs,
    draftBlogs,
    pendingBlogs,
    rejectedBlogs,
    totalComments,
  };

  res.json({
    status: "success",
    data: {
      stats,
    },
  });
});

// @desc    Get user stats
// @route   GET /api/users/:userId/stats
// @access  Public
const getUserStats = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  const user = await User.findById(userId).select("stats");

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  // Get additional blog stats
  const [publishedBlogs, draftBlogs, pendingBlogs] = await Promise.all([
    Blog.countDocuments({ author: userId, status: "approved" }),
    Blog.countDocuments({ author: userId, status: "draft" }),
    Blog.countDocuments({ author: userId, status: "pending" }),
  ]);

  const stats = {
    ...user.stats.toObject(),
    publishedBlogs,
    draftBlogs,
    pendingBlogs,
  };

  res.json({
    status: "success",
    data: {
      stats,
    },
  });
});

// @desc    Get user's own blogs (including drafts)
// @route   GET /api/users/me/blogs
// @access  Private
const getMyBlogs = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const skip = (page - 1) * limit;

  const query = { author: req.user._id };
  if (status) query.status = status;

  const blogs = await Blog.find(query)
    .populate("author", "username firstName lastName avatar")
    .sort({ updatedAt: -1 })
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

// @desc    Get user profile by username
// @route   GET /api/users/:username
// @access  Public
const getUserProfile = asyncHandler(async (req, res) => {
  const { username } = req.params;

  const user = await User.findOne({ username, isActive: true }).select(
    "-email -password"
  ); // Don't expose email and password in public profile

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  res.json({
    status: "success",
    data: {
      user,
    },
  });
});

// @desc    Get user's public blogs
// @route   GET /api/users/:username/blogs
// @access  Public
const getUserBlogs = asyncHandler(async (req, res) => {
  const { username } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const user = await User.findOne({ username, isActive: true });

  if (!user) {
    return res.status(404).json({
      status: "error",
      message: "User not found",
    });
  }

  const Blog = require("../models/Blog");
  const skip = (page - 1) * limit;

  const blogs = await Blog.find({
    author: user._id,
    status: "approved",
  })
    .populate("author", "username firstName lastName avatar")
    .select("-content")
    .sort({ publishedAt: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Blog.countDocuments({
    author: user._id,
    status: "approved",
  });

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

// @desc    Search users
// @route   GET /api/users/search
// @access  Public
const searchUsers = asyncHandler(async (req, res) => {
  const { q, limit = 10 } = req.query;

  if (!q) {
    return res.status(400).json({
      status: "error",
      message: "Search query is required",
    });
  }

  const users = await User.find({
    isActive: true,
    $or: [
      { username: { $regex: q, $options: "i" } },
      { firstName: { $regex: q, $options: "i" } },
      { lastName: { $regex: q, $options: "i" } },
    ],
  })
    .select("username firstName lastName avatar bio stats")
    .limit(parseInt(limit))
    .sort({ "stats.totalBlogs": -1, createdAt: -1 });

  res.json({
    status: "success",
    data: {
      users,
      searchQuery: q,
    },
  });
});

// @desc    Get top authors
// @route   GET /api/users/top-authors
// @access  Public
const getTopAuthors = asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;

  const topAuthors = await User.find({
    isActive: true,
    "stats.totalBlogs": { $gt: 0 },
  })
    .select("username firstName lastName avatar bio stats")
    .sort({ "stats.totalBlogs": -1, "stats.totalLikes": -1 })
    .limit(parseInt(limit));

  res.json({
    status: "success",
    data: {
      authors: topAuthors,
    },
  });
});

// Validation rules
const updateProfileValidation = [
  body("username")
    .optional()
    .isLength({ min: 3, max: 30 })
    .withMessage("Username must be between 3 and 30 characters")
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage("Username can only contain letters, numbers, and underscores"),
  body("firstName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("First name must be between 1 and 50 characters"),
  body("lastName")
    .optional()
    .isLength({ min: 1, max: 50 })
    .withMessage("Last name must be between 1 and 50 characters"),
  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
  body("avatar")
    .optional()
    .custom((value) => {
      // Only validate if value is provided and not empty
      if (value && value.trim() !== '') {
        try {
          new URL(value);
          return true;
        } catch (error) {
          throw new Error("Avatar must be a valid URL");
        }
      }
      return true;
    }),
];

// Routes
router.get("/me", authenticateToken, getCurrentUser);
router.put(
  "/me",
  authenticateToken,
  updateProfileValidation,
  handleValidationErrors,
  updateProfile
);
router.get("/me/blogs", authenticateToken, getMyBlogs);
router.get("/me/stats", authenticateToken, getCurrentUserStats);
router.get("/search", searchUsers);
router.get("/top-authors", getTopAuthors);
router.get("/:userId/stats", getUserStats);
router.get("/:username", getUserProfile);
router.get("/:username/blogs", getUserBlogs);

module.exports = router;
