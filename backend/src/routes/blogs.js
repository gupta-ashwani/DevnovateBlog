const express = require("express");
const { body } = require("express-validator");
const {
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
} = require("../controllers/blogController");
const {
  getComments,
  createComment,
} = require("../controllers/commentController");
const { authenticateToken, optionalAuth } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/error");

const router = express.Router();

// Validation rules
const createBlogValidation = [
  body("title")
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("content")
    .trim()
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters long"),
  body("category")
    .isIn([
      "Technology",
      "Programming",
      "AI/ML",
      "Web Development",
      "Mobile Development",
      "DevOps",
      "Database",
      "Security",
      "Tutorial",
      "Opinion",
      "News",
      "Other",
    ])
    .withMessage("Invalid category"),
  body("excerpt")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Excerpt cannot exceed 300 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be between 1 and 30 characters"),
  body("featuredImage")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Featured image must be a valid URL string"),
  body("seo.metaTitle")
    .optional()
    .isLength({ max: 60 })
    .withMessage("Meta title cannot exceed 60 characters"),
  body("seo.metaDescription")
    .optional()
    .isLength({ max: 160 })
    .withMessage("Meta description cannot exceed 160 characters"),
];

const updateBlogValidation = [
  body("title")
    .optional()
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage("Title must be between 3 and 100 characters"),
  body("content")
    .optional()
    .trim()
    .isLength({ min: 50 })
    .withMessage("Content must be at least 50 characters long"),
  body("category")
    .optional()
    .isIn([
      "Technology",
      "Programming",
      "AI/ML",
      "Web Development",
      "Mobile Development",
      "DevOps",
      "Database",
      "Security",
      "Tutorial",
      "Opinion",
      "News",
      "Other",
    ])
    .withMessage("Invalid category"),
  body("excerpt")
    .optional()
    .isLength({ max: 300 })
    .withMessage("Excerpt cannot exceed 300 characters"),
  body("tags").optional().isArray().withMessage("Tags must be an array"),
  body("tags.*")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Each tag must be between 1 and 30 characters"),
  body("featuredImage")
    .optional({ checkFalsy: true })
    .isString()
    .withMessage("Featured image must be a valid URL string"),
];

const createCommentValidation = [
  body("content")
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage("Comment must be between 1 and 1000 characters"),
  body("parentComment")
    .optional()
    .isMongoId()
    .withMessage("Invalid parent comment ID"),
];

// Public routes
router.get("/", getAllBlogs);
router.get("/trending", getTrendingBlogs);
router.get("/latest", getLatestBlogs);
router.get("/featured", getFeaturedBlogs);
router.get("/search", searchBlogs);
router.get("/id/:id", authenticateToken, getBlogById); // Get blog by ID (private)
router.get("/:slug", optionalAuth, getBlogBySlug);

// Comment routes (public read, private write)
router.get("/:blogId/comments", getComments);
router.post(
  "/:blogId/comments",
  authenticateToken,
  createCommentValidation,
  handleValidationErrors,
  createComment
);

// Private routes
router.use(authenticateToken); // All routes below require authentication

router.get("/user/my-blogs", getMyBlogs);
router.post("/", createBlogValidation, handleValidationErrors, createBlog);
router.put("/:id", updateBlogValidation, handleValidationErrors, updateBlog);
router.delete("/:id", deleteBlog);
router.post("/:id/like", toggleBlogLike);

module.exports = router;
