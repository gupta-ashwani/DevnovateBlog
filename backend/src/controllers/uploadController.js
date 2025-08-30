const cloudinary = require("../config/cloudinary");
const { asyncHandler } = require("../middleware/error");

// @desc    Upload image to Cloudinary
// @route   POST /api/upload/image
// @access  Private
const uploadImage = asyncHandler(async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "error",
        message: "No image file provided",
      });
    }

    // Convert buffer to base64 for Cloudinary upload
    const base64String = `data:${
      req.file.mimetype
    };base64,${req.file.buffer.toString("base64")}`;

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(base64String, {
      folder: "blog-images", // Organize images in a folder
      resource_type: "image",
      transformation: [
        { width: 1200, height: 630, crop: "limit" }, // Limit max size
        { quality: "auto" }, // Auto quality optimization
        { fetch_format: "auto" }, // Auto format optimization
      ],
    });

    // Return the secure URL
    res.json({
      status: "success",
      message: "Image uploaded successfully",
      data: {
        url: result.secure_url,
        publicId: result.public_id,
      },
    });
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to upload image",
      error: error.message,
    });
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Private
const deleteImage = asyncHandler(async (req, res) => {
  try {
    const { publicId } = req.params;

    // Delete image from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId);

    if (result.result === "ok") {
      res.json({
        status: "success",
        message: "Image deleted successfully",
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "Image not found",
      });
    }
  } catch (error) {
    console.error("Cloudinary delete error:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to delete image",
      error: error.message,
    });
  }
});

module.exports = {
  uploadImage,
  deleteImage,
};
