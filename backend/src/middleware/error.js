const { validationResult } = require("express-validator");

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    console.log("Validation errors:", formattedErrors);

    // Create a user-friendly message
    const errorMessages = formattedErrors.map(err => err.message);
    const userMessage = errorMessages.length === 1 
      ? errorMessages[0]
      : `Please fix the following issues: ${errorMessages.join(', ')}`;

    return res.status(400).json({
      status: "error",
      message: userMessage,
      errors: formattedErrors,
    });
  }

  next();
};

// Async error handler wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Not found middleware
const notFound = (req, res, next) => {
  const error = new Error(`Not found - ${req.originalUrl}`);
  error.statusCode = 404;
  next(error);
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error("Error:", err);

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = "Resource not found";
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    let message = "Duplicate field value entered";

    // Check if it's a slug duplicate and provide better message
    if (err.keyPattern && err.keyPattern.slug) {
      message =
        "A blog with this title already exists. Please choose a different title.";
    } else if (err.keyValue) {
      const field = Object.keys(err.keyValue)[0];
      const value = err.keyValue[field];
      message = `${
        field.charAt(0).toUpperCase() + field.slice(1)
      } '${value}' already exists`;
    }

    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val) => val.message)
      .join(", ");
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = "Invalid token";
    error = { message, statusCode: 401 };
  }

  if (err.name === "TokenExpiredError") {
    const message = "Token expired";
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    status: "error",
    message: error.message || "Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = {
  handleValidationErrors,
  asyncHandler,
  notFound,
  errorHandler,
};
