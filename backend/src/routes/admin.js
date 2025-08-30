const express = require("express");
const { body } = require("express-validator");
const {
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
} = require("../controllers/adminController");
const { authenticateToken, requireAdmin } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/error");

const router = express.Router();

// Apply authentication and admin check to all routes
router.use(authenticateToken);
router.use(requireAdmin);

// Validation rules
const reviewBlogValidation = [
  body("status")
    .isIn(["approved", "rejected"])
    .withMessage("Status must be either approved or rejected"),
  body("adminNotes")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Admin notes cannot exceed 500 characters"),
];

const moderateCommentValidation = [
  body("action")
    .isIn(["hide", "show"])
    .withMessage("Action must be either hide or show"),
];

const changeRoleValidation = [
  body("role")
    .isIn(["user", "admin"])
    .withMessage("Role must be either user or admin"),
];

// Dashboard routes
router.get("/dashboard", getDashboardStats);

// User management routes
router.get("/users", getAllUsers);
router.get("/users/recent", getRecentUsers);
router.put("/users/:id/status", toggleUserStatus);
router.put(
  "/users/:id/role",
  changeRoleValidation,
  handleValidationErrors,
  changeUserRole
);

// Blog management routes
router.get("/blogs", getAllBlogsAdmin);
router.get("/blogs/pending", getPendingBlogs);
router.put(
  "/blogs/:id/review",
  reviewBlogValidation,
  handleValidationErrors,
  reviewBlog
);
router.put("/blogs/:id/featured", toggleBlogFeatured);
router.put("/blogs/:id/visibility", toggleBlogVisibility);
router.delete("/blogs/:id", deleteBlogAdmin);

// Comment moderation routes
router.get("/comments/reported", getReportedComments);
router.put(
  "/comments/:id/moderate",
  moderateCommentValidation,
  handleValidationErrors,
  moderateComment
);

module.exports = router;
