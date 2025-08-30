const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
  refreshToken,
} = require("../controllers/authController");
const { authenticateToken } = require("../middleware/auth");
const { handleValidationErrors } = require("../middleware/error");

const router = express.Router();

// Validation rules
const registerValidation = [
  body("username")
    .isLength({ min: 3, max: 20 })
    .withMessage("Username must be between 3 and 20 characters")
    .matches(/^[a-zA-Z0-9_.-]+$/)
    .withMessage(
      "Username can only contain letters, numbers, underscores, periods, and hyphens"
    ),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),
  body("firstName")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("First name is required and must not exceed 30 characters"),
  body("lastName")
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Last name is required and must not exceed 30 characters"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const updateProfileValidation = [
  body("firstName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("First name must not exceed 30 characters"),
  body("lastName")
    .optional()
    .trim()
    .isLength({ min: 1, max: 30 })
    .withMessage("Last name must not exceed 30 characters"),
  body("bio")
    .optional()
    .isLength({ max: 500 })
    .withMessage("Bio cannot exceed 500 characters"),
  body("avatar").optional().isURL().withMessage("Avatar must be a valid URL"),
  body("socialLinks.twitter")
    .optional()
    .isURL()
    .withMessage("Twitter URL must be valid"),
  body("socialLinks.linkedin")
    .optional()
    .isURL()
    .withMessage("LinkedIn URL must be valid"),
  body("socialLinks.github")
    .optional()
    .isURL()
    .withMessage("GitHub URL must be valid"),
  body("socialLinks.website")
    .optional()
    .isURL()
    .withMessage("Website URL must be valid"),
];

const changePasswordValidation = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),
];

// Routes
router.post("/register", registerValidation, handleValidationErrors, register);
router.post("/login", loginValidation, handleValidationErrors, login);
router.post("/logout", authenticateToken, logout);
router.post("/refresh", authenticateToken, refreshToken);

router.get("/me", authenticateToken, getMe);
router.put(
  "/me",
  authenticateToken,
  updateProfileValidation,
  handleValidationErrors,
  updateMe
);
router.put(
  "/change-password",
  authenticateToken,
  changePasswordValidation,
  handleValidationErrors,
  changePassword
);

module.exports = router;
