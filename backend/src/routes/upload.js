const express = require("express");
const multer = require("multer");
const path = require("path");
const { uploadImage, deleteImage } = require("../controllers/uploadController");
const { authenticateToken } = require("../middleware/auth");

const router = express.Router();

// Configure multer for memory storage (Cloudinary will handle the file)
const storage = multer.memoryStorage();

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  // Check file type
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

// Configure multer with file size limit (10MB)
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

// Middleware to handle multer errors
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        status: "error",
        message: "File too large. Maximum size is 5MB.",
      });
    }
  }

  if (error.message === "Only image files are allowed!") {
    return res.status(400).json({
      status: "error",
      message:
        "Only image files are allowed. Please upload JPG, PNG, GIF, or WebP files.",
    });
  }

  return res.status(500).json({
    status: "error",
    message: "File upload error",
    error: error.message,
  });
};

// Routes
router.post(
  "/image",
  authenticateToken,
  upload.single("image"),
  handleUploadError,
  uploadImage
);

router.delete("/image/:publicId", authenticateToken, deleteImage);

module.exports = router;
