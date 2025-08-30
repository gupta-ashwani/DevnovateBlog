const express = require("express");
const {
  getUserAnalyticsOverview,
  getAllBlogsAnalytics,
  getPublicUserAnalytics,
  getPublicUserBlogsAnalytics,
} = require("../controllers/analyticsController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Public routes (no authentication required)
// @route   GET /api/analytics/user/:userId/overview
// @desc    Get public analytics overview for any user
// @access  Public
router.get("/user/:userId/overview", getPublicUserAnalytics);

// @route   GET /api/analytics/user/:userId/blogs
// @desc    Get published blogs analytics for any user
// @access  Public
router.get("/user/:userId/blogs", getPublicUserBlogsAnalytics);

// Protected routes (require authentication)
router.use(authenticateToken);

// @route   GET /api/analytics/overview
// @desc    Get user's analytics overview
// @access  Private
router.get("/overview", getUserAnalyticsOverview);

// @route   GET /api/analytics/blogs
// @desc    Get analytics for all user's blogs
// @access  Private
router.get("/blogs", getAllBlogsAnalytics);

module.exports = router;
