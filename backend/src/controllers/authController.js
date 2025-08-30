const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { asyncHandler } = require("../middleware/error");

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res) => {
  const { username, email, password, firstName, lastName } = req.body;

  console.log("Registration attempt:", {
    username,
    email,
    firstName,
    lastName,
  });

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }],
  });

  if (existingUser) {
    console.log(
      "User already exists:",
      existingUser.email === email ? "email" : "username"
    );
    return res.status(400).json({
      status: "error",
      message:
        existingUser.email === email
          ? "Email already registered"
          : "Username already taken",
    });
  }

  // Create new user
  const user = await User.create({
    username,
    email,
    password,
    firstName,
    lastName,
  });

  console.log("User created successfully:", user._id);

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.status(201).json({
    status: "success",
    message: "User registered successfully",
    data: {
      token,
      user: user.getPublicProfile(),
    },
  });
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user and include password field
  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  // Check if account is active
  if (!user.isActive) {
    return res.status(401).json({
      status: "error",
      message: "Account has been deactivated",
    });
  }

  // Verify password
  const isPasswordValid = await user.comparePassword(password);

  if (!isPasswordValid) {
    return res.status(401).json({
      status: "error",
      message: "Invalid email or password",
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  await user.save();

  res.json({
    status: "success",
    message: "Login successful",
    data: {
      token,
      user: user.getPublicProfile(),
    },
  });
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  res.json({
    status: "success",
    data: {
      user: user.getPublicProfile(),
    },
  });
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = asyncHandler(async (req, res) => {
  const allowedUpdates = [
    "firstName",
    "lastName",
    "bio",
    "avatar",
    "socialLinks",
  ];
  const updates = Object.keys(req.body);
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).json({
      status: "error",
      message: "Invalid updates. Allowed fields: " + allowedUpdates.join(", "),
    });
  }

  const user = await User.findById(req.user._id);

  updates.forEach((update) => {
    user[update] = req.body[update];
  });

  await user.save();

  res.json({
    status: "success",
    message: "Profile updated successfully",
    data: {
      user: user.getPublicProfile(),
    },
  });
});

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  // Get user with password field
  const user = await User.findById(req.user._id).select("+password");

  // Verify current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);

  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      status: "error",
      message: "Current password is incorrect",
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    status: "success",
    message: "Password changed successfully",
  });
});

// @desc    Logout user (client-side token removal)
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res) => {
  // In a JWT implementation, logout is typically handled client-side
  // by removing the token. However, we can track this server-side for analytics

  res.json({
    status: "success",
    message: "Logged out successfully",
  });
});

// @desc    Refresh token
// @route   POST /api/auth/refresh
// @access  Private
const refreshToken = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  if (!user || !user.isActive) {
    return res.status(401).json({
      status: "error",
      message: "User not found or inactive",
    });
  }

  // Generate new token
  const token = generateToken(user._id);

  res.json({
    status: "success",
    message: "Token refreshed successfully",
    data: {
      token,
      user: user.getPublicProfile(),
    },
  });
});

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  changePassword,
  logout,
  refreshToken,
};
