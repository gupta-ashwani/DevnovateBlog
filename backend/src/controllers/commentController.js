const Comment = require("../models/Comment");
const Blog = require("../models/Blog");
const { asyncHandler } = require("../middleware/error");

// @desc    Get comments for a blog
// @route   GET /api/blogs/:blogId/comments
// @access  Public
const getComments = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  // Check if blog exists
  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  const comments = await Comment.getCommentsForBlog(blogId, {
    page: parseInt(page),
    limit: parseInt(limit),
  });

  const total = await Comment.countDocuments({
    blog: blogId,
    parentComment: null,
    isHidden: false,
  });

  res.json({
    status: "success",
    data: {
      comments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalComments: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    },
  });
});

// @desc    Create comment
// @route   POST /api/blogs/:blogId/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { blogId } = req.params;
  const { content, parentComment } = req.body;

  // Check if blog exists and is published
  const blog = await Blog.findById(blogId);
  if (!blog) {
    return res.status(404).json({
      status: "error",
      message: "Blog not found",
    });
  }

  if (blog.status !== "approved") {
    return res.status(400).json({
      status: "error",
      message: "Cannot comment on unpublished blog",
    });
  }

  if (!blog.isCommentEnabled) {
    return res.status(400).json({
      status: "error",
      message: "Comments are disabled for this blog",
    });
  }

  // If it's a reply, check if parent comment exists
  if (parentComment) {
    const parentCommentDoc = await Comment.findById(parentComment);
    if (!parentCommentDoc || parentCommentDoc.blog.toString() !== blogId) {
      return res.status(400).json({
        status: "error",
        message: "Invalid parent comment",
      });
    }
  }

  const comment = await Comment.create({
    content,
    author: req.user._id,
    blog: blogId,
    parentComment: parentComment || null,
  });

  await comment.populate("author", "username firstName lastName avatar");

  res.status(201).json({
    status: "success",
    message: "Comment created successfully",
    data: {
      comment,
    },
  });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private (Owner only)
const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      status: "error",
      message: "Comment not found",
    });
  }

  // Check ownership
  if (comment.author.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      status: "error",
      message: "Not authorized to update this comment",
    });
  }

  comment.content = content;
  comment.isEdited = true;
  comment.editedAt = new Date();
  await comment.save();

  await comment.populate("author", "username firstName lastName avatar");

  res.json({
    status: "success",
    message: "Comment updated successfully",
    data: {
      comment,
    },
  });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private (Owner or Admin)
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      status: "error",
      message: "Comment not found",
    });
  }

  // Check ownership or admin role
  if (
    comment.author.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    return res.status(403).json({
      status: "error",
      message: "Not authorized to delete this comment",
    });
  }

  // Delete all replies to this comment
  await Comment.deleteMany({ parentComment: id });

  await comment.deleteOne();

  res.json({
    status: "success",
    message: "Comment deleted successfully",
  });
});

// @desc    Toggle comment like
// @route   POST /api/comments/:id/like
// @access  Private
const toggleCommentLike = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      status: "error",
      message: "Comment not found",
    });
  }

  const likeResult = comment.toggleLike(req.user._id);
  await comment.save();

  res.json({
    status: "success",
    message: likeResult.liked ? "Comment liked" : "Comment unliked",
    data: likeResult,
  });
});

// @desc    Report comment
// @route   POST /api/comments/:id/report
// @access  Private
const reportComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { reason } = req.body;

  const comment = await Comment.findById(id);

  if (!comment) {
    return res.status(404).json({
      status: "error",
      message: "Comment not found",
    });
  }

  // Check if user already reported this comment
  const existingReport = comment.reports.find(
    (report) => report.user.toString() === req.user._id.toString()
  );

  if (existingReport) {
    return res.status(400).json({
      status: "error",
      message: "You have already reported this comment",
    });
  }

  comment.reports.push({
    user: req.user._id,
    reason: reason || "other",
  });

  // Mark as reported if it has multiple reports
  if (comment.reports.length >= 3) {
    comment.isReported = true;
  }

  await comment.save();

  res.json({
    status: "success",
    message: "Comment reported successfully",
  });
});

// @desc    Get replies for a comment
// @route   GET /api/comments/:id/replies
// @access  Public
const getReplies = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { page = 1, limit = 10 } = req.query;

  const skip = (page - 1) * limit;

  const replies = await Comment.find({
    parentComment: id,
    isHidden: false,
  })
    .populate("author", "username firstName lastName avatar")
    .sort({ createdAt: 1 }) // Replies shown chronologically
    .skip(skip)
    .limit(parseInt(limit));

  const total = await Comment.countDocuments({
    parentComment: id,
    isHidden: false,
  });

  res.json({
    status: "success",
    data: {
      replies,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalReplies: total,
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    },
  });
});

module.exports = {
  getComments,
  createComment,
  updateComment,
  deleteComment,
  toggleCommentLike,
  reportComment,
  getReplies,
};
