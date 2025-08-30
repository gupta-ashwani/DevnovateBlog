const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        status: "error",
        message: "Access token required",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        status: "error",
        message: "Invalid token - user not found",
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        status: "error",
        message: "Account has been deactivated",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid token",
      });
    }

    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired",
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Token verification failed",
    });
  }
};

// Middleware to check if user is admin
const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  if (req.user.role !== "admin") {
    return res.status(403).json({
      status: "error",
      message: "Admin access required",
    });
  }

  next();
};

// Middleware to check if user owns the resource or is admin
const requireOwnershipOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      status: "error",
      message: "Authentication required",
    });
  }

  // Admin can access any resource
  if (req.user.role === "admin") {
    return next();
  }

  // Check if user owns the resource
  // This assumes the resource has an 'author' field or the user ID is in params
  const resourceUserId = req.resource?.author?.toString() || req.params.userId;

  if (resourceUserId && resourceUserId === req.user._id.toString()) {
    return next();
  }

  return res.status(403).json({
    status: "error",
    message: "Access denied - insufficient permissions",
  });
};

// Optional authentication middleware (doesn't fail if no token)
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select("-password");

      if (user && user.isActive) {
        req.user = user;
      }
    }
  } catch (error) {
    // Silently ignore auth errors for optional auth
    console.log("Optional auth failed:", error.message);
  }

  next();
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireOwnershipOrAdmin,
  optionalAuth,
};
