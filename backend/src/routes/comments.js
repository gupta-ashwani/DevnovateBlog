const express = require("express");
const { body } = require("express-validator");
const {
  updateComment,
  deleteComment,
  toggleCommentLike,
  reportComment,
  getReplies,
} = require("../controllers/commentController");
const { authenticateToken } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/error");

const router = express.Router();

// Validation rules
const updateCommentValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters"),
];

const reportCommentValidation = [
  body("reason")
    .optional()
    .isIn(["spam", "inappropriate", "harassment", "other"])
    .withMessage("Invalid report reason"),
];

// All routes require authentication
router.use(authenticateToken);

// Comment management routes
router.put(
  "/:id",
  updateCommentValidation,
  handleValidationErrors,
  updateComment
);
router.delete("/:id", deleteComment);
router.post("/:id/like", toggleCommentLike);
router.post(
  "/:id/report",
  reportCommentValidation,
  handleValidationErrors,
  reportComment
);

// Public comment routes (but still require auth for like status)
router.get("/:id/replies", getReplies);

module.exports = router;
