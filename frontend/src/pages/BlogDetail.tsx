import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { tomorrow } from "react-syntax-highlighter/dist/esm/styles/prism";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import remarkGfm from "remark-gfm";
import {
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  Eye,
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Twitter,
  Facebook,
  Linkedin,
  Copy,
  Check,
  Tag,
  Edit3,
  Trash2,
  ChevronUp,
  ChevronDown,
  MoreHorizontal,
  MoreVertical,
  Reply,
  Send,
  ThumbsUp,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { blogService } from "@/services/blog";
import { commentService } from "@/services/comment";
import { Blog, Comment, User as UserType, CreateCommentData } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

interface CommentWithReplies extends Comment {
  replies?: CommentWithReplies[];
  isExpanded?: boolean;
}

// Separate ReplyForm component with its own state
const ReplyForm: React.FC<{
  commentId: string;
  authorName: string;
  user: any;
  onSubmit: (commentId: string, content: string) => void;
  onCancel: () => void;
}> = ({ commentId, authorName, user, onSubmit, onCancel }) => {
  const [replyContent, setReplyContent] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) {
      toast.error("Please enter a reply");
      return;
    }
    onSubmit(commentId, replyContent.trim());
    setReplyContent("");
  };

  return (
    <div className="mt-4 bg-gray-50 rounded-xl border border-gray-200 p-4">
      <form onSubmit={handleSubmit}>
        <div className="flex space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-sm">
            {user?.firstName?.charAt(0) || user?.username?.charAt(0)}
          </div>
          <div className="flex-1">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder={`Reply to ${authorName}...`}
              className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-sm bg-white"
              rows={3}
              autoFocus
            />
            <div className="flex justify-end space-x-2 mt-3">
              <button
                type="button"
                onClick={() => {
                  setReplyContent("");
                  onCancel();
                }}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!replyContent.trim()}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                <Send className="h-4 w-4" />
                <span>Reply</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

const BlogDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [blog, setBlog] = useState<Blog | null>(null);
  const [comments, setComments] = useState<CommentWithReplies[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [expandedComments, setExpandedComments] = useState<Set<string>>(
    new Set()
  );
  const [commentMenuOpen, setCommentMenuOpen] = useState<string | null>(null);
  const [showMobileActions, setShowMobileActions] = useState(false);
  const commentTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Markdown components for rendering blog content
  const markdownComponents = {
    code({ node, inline, className, children, ...props }: any) {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={tomorrow}
          language={match[1]}
          PreTag="div"
          className="rounded-lg my-4"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code
          className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono"
          {...props}
        >
          {children}
        </code>
      );
    },
    blockquote: ({ children }: any) => (
      <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-6 italic text-gray-600 bg-blue-50 rounded-r-lg">
        {children}
      </blockquote>
    ),
    h1: ({ children }: any) => (
      <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4">{children}</h1>
    ),
    h2: ({ children }: any) => (
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">{children}</h3>
    ),
    p: ({ children }: any) => (
      <p className="text-gray-800 leading-relaxed mb-6">{children}</p>
    ),
    ul: ({ children }: any) => (
      <ul className="list-disc list-inside mb-6 space-y-2 text-gray-800">
        {children}
      </ul>
    ),
    ol: ({ children }: any) => (
      <ol className="list-decimal list-inside mb-6 space-y-2 text-gray-800">
        {children}
      </ol>
    ),
    li: ({ children }: any) => <li className="leading-relaxed">{children}</li>,
    a: ({ children, href }: any) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:text-blue-800 underline"
      >
        {children}
      </a>
    ),
    img: ({ src, alt }: any) => (
      <img
        src={src}
        alt={alt}
        className="max-w-full h-auto rounded-lg shadow-sm my-6 mx-auto"
      />
    ),
  };

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  useEffect(() => {
    if (blog) {
      fetchComments();
      // Track reading progress
      const handleScroll = () => {
        const scrollTop = window.scrollY;
        const docHeight =
          document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        setReadingProgress(progress);
        setShowScrollTop(scrollTop > 500);
      };

      const handleClickOutside = () => {
        setCommentMenuOpen(null);
        setShowShareMenu(false);
      };

      window.addEventListener("scroll", handleScroll);
      document.addEventListener("click", handleClickOutside);

      return () => {
        window.removeEventListener("scroll", handleScroll);
        document.removeEventListener("click", handleClickOutside);
      };
    }
  }, [blog]);

  const fetchBlog = async () => {
    try {
      setIsLoading(true);
      const blogData = await blogService.getBlogBySlug(slug!);
      setBlog(blogData);
      setLikesCount(blogData.metrics?.likes || 0);
      setIsLiked(blogData.isLiked || false);
    } catch (error) {
      console.error("Error fetching blog:", error);
      toast.error("Blog not found");
      navigate("/blogs");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchComments = async () => {
    if (!blog) return;
    try {
      setCommentsLoading(true);
      const commentsData = await commentService.getComments(blog._id);
      const organizedComments = organizeComments(commentsData.comments || []);
      setComments(organizedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const organizeComments = (flatComments: Comment[]): CommentWithReplies[] => {
    // Filter out null/undefined comments first
    const validComments = flatComments.filter(
      (comment) =>
        comment && comment._id && comment.author && comment.author._id
    );

    const commentMap = new Map<string, CommentWithReplies>();
    const rootComments: CommentWithReplies[] = [];

    // First pass: create all comment objects
    validComments.forEach((comment) => {
      commentMap.set(comment._id, {
        ...comment,
        replies: [],
        isExpanded: true,
      });
    });

    // Second pass: organize into hierarchy
    validComments.forEach((comment) => {
      const commentObj = commentMap.get(comment._id);
      if (!commentObj) return;

      if (comment.parentComment) {
        const parent = commentMap.get(comment.parentComment);
        if (parent) {
          parent.replies!.push(commentObj);
        } else {
          rootComments.push(commentObj);
        }
      } else {
        rootComments.push(commentObj);
      }
    });

    return rootComments;
  };

  const handleLike = async () => {
    if (!user) {
      toast.error("Please login to like this blog");
      return;
    }

    try {
      const result = await blogService.toggleBlogLike(blog!._id);
      setLikesCount(result.likeCount);
      setIsLiked(result.liked);
    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error("Failed to update like status");
    }
  };

  const handleBookmark = async () => {
    if (!user) {
      toast.error("Please login to bookmark this blog");
      return;
    }

    try {
      setIsBookmarked(!isBookmarked);
      toast.success(
        isBookmarked ? "Removed from bookmarks" : "Added to bookmarks"
      );
    } catch (error) {
      console.error("Error toggling bookmark:", error);
    }
  };

  const handleShare = (platform: string) => {
    const url = window.location.href;
    const title = blog?.title || "";

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(
            title
          )}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "linkedin":
        window.open(
          `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "copy":
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast.success("Link copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
        break;
    }
    setShowShareMenu(false);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error("Please login to comment");
      return;
    }

    if (!newComment.trim()) {
      toast.error("Please enter a comment");
      return;
    }

    try {
      const commentData: CreateCommentData = {
        content: newComment.trim(),
      };
      const comment = await commentService.createComment(
        blog!._id,
        commentData
      );

      const newCommentWithReplies: CommentWithReplies = {
        ...comment,
        replies: [],
        isExpanded: true,
      };

      setComments((prev) => [newCommentWithReplies, ...prev]);
      setNewComment("");
      toast.success("Comment added successfully!");
    } catch (error) {
      console.error("Error creating comment:", error);
      toast.error("Failed to add comment");
    }
  };

  const handleReplySubmit = async (parentId: string, content: string) => {
    if (!user) {
      toast.error("Please login to reply");
      return;
    }

    try {
      const replyData: CreateCommentData = {
        content: content,
        parentComment: parentId,
      };
      const reply = await commentService.createComment(blog!._id, replyData);

      const addReplyToComment = (
        comments: CommentWithReplies[]
      ): CommentWithReplies[] => {
        return comments.map((comment) => {
          if (comment._id === parentId) {
            return {
              ...comment,
              replies: [
                ...(comment.replies || []),
                { ...reply, replies: [], isExpanded: true },
              ],
              isExpanded: true,
            };
          }
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: addReplyToComment(comment.replies),
            };
          }
          return comment;
        });
      };

      setComments((prev) => addReplyToComment(prev));
      setReplyingTo(null);
      toast.success("Reply added successfully!");
    } catch (error) {
      console.error("Error creating reply:", error);
      toast.error("Failed to add reply");
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!user) {
      toast.error("Please login to like comments");
      return;
    }

    try {
      const result = await commentService.toggleCommentLike(commentId);

      const updateCommentLike = (
        comments: CommentWithReplies[]
      ): CommentWithReplies[] => {
        return comments.map((comment) => {
          if (comment._id === commentId) {
            return { ...comment, likeCount: result.likeCount };
          }
          if (comment.replies && comment.replies.length > 0) {
            return { ...comment, replies: updateCommentLike(comment.replies) };
          }
          return comment;
        });
      };

      setComments((prev) => updateCommentLike(prev));

      setLikedComments((prev) => {
        const newLikedComments = new Set(prev);
        if (result.liked) {
          newLikedComments.add(commentId);
        } else {
          newLikedComments.delete(commentId);
        }
        return newLikedComments;
      });
    } catch (error) {
      console.error("Error toggling comment like:", error);
      toast.error("Failed to update like status");
    }
  };

  const toggleCommentExpansion = (commentId: string) => {
    setExpandedComments((prev) => {
      const newExpanded = new Set(prev);
      if (newExpanded.has(commentId)) {
        newExpanded.delete(commentId);
      } else {
        newExpanded.add(commentId);
      }
      return newExpanded;
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Are you sure you want to delete this comment?"))
      return;

    try {
      await commentService.deleteComment(commentId);

      const removeCommentFromTree = (
        comments: CommentWithReplies[]
      ): CommentWithReplies[] => {
        return comments
          .filter((comment) => comment._id !== commentId)
          .map((comment) => ({
            ...comment,
            replies: comment.replies
              ? removeCommentFromTree(comment.replies)
              : [],
          }));
      };

      setComments((prev) => removeCommentFromTree(prev));
      setCommentMenuOpen(null);
      toast.success("Comment deleted successfully");
    } catch (error) {
      console.error("Error deleting comment:", error);
      toast.error("Failed to delete comment");
    }
  };

  const scrollToComments = () => {
    const commentsSection = document.getElementById("comments-section");
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: "auto" });
    }
  };

  const handleDeleteBlog = async () => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await blogService.deleteBlog(blog!._id);
      toast.success("Blog deleted successfully");
      navigate("/blogs");
    } catch (error) {
      console.error("Error deleting blog:", error);
      toast.error("Failed to delete blog");
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const getTotalCommentsCount = (): number => {
    const countComments = (comments: CommentWithReplies[]): number => {
      return comments.reduce((total, comment) => {
        return (
          total + 1 + (comment.replies ? countComments(comment.replies) : 0)
        );
      }, 0);
    };
    return countComments(comments);
  };

  // Helper component for rendering threaded comments
  const CommentThread: React.FC<{
    comment: CommentWithReplies;
    depth?: number;
  }> = ({ comment, depth = 0 }) => {
    const isExpanded = expandedComments.has(comment._id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const maxDepth = 3;
    const canDelete = user?._id === comment.author?._id;

    // If comment author is null/undefined, show deleted comment placeholder
    if (!comment.author) {
      return (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-gray-500 italic">This comment has been deleted.</p>
        </div>
      );
    }

    return (
      <div
        className={`${
          depth > 0
            ? "ml-4 md:ml-8 border-l-2 border-gray-100 pl-4 md:pl-6"
            : ""
        } mb-6`}
      >
        <div className="flex space-x-3 md:space-x-4">
          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0 text-sm">
            {comment.author.firstName?.charAt(0) ||
              comment.author.username?.charAt(0)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="bg-white rounded-xl p-3 md:p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2 min-w-0">
                  <Link
                    to={`/profile/${comment.author.username}`}
                    className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate"
                  >
                    {comment.author.fullName || comment.author.username}
                  </Link>
                  <span className="text-sm text-gray-500 hidden sm:inline">
                    @{comment.author.username}
                  </span>
                  <span className="text-sm text-gray-400 hidden sm:inline">
                    •
                  </span>
                  <span className="text-sm text-gray-500 truncate">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>

                {/* Three dots menu - only show if user can delete */}
                {canDelete && (
                  <div className="relative">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setCommentMenuOpen(
                          commentMenuOpen === comment._id ? null : comment._id
                        );
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {commentMenuOpen === comment._id && (
                      <div
                        className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 min-w-[120px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => handleDeleteComment(comment._id)}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-red-50 text-red-600 transition-colors text-sm"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Delete</span>
                        </button>
                        <button
                          onClick={() => setCommentMenuOpen(null)}
                          className="flex items-center space-x-2 w-full px-3 py-2 text-left hover:bg-gray-50 text-gray-600 transition-colors text-sm"
                        >
                          <span>Cancel</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <p className="text-gray-700 leading-relaxed mb-4 break-words">
                {comment.content}
              </p>

              {/* Comment Actions */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => handleLikeComment(comment._id)}
                  className={`flex items-center space-x-2 text-sm transition-colors ${
                    likedComments.has(comment._id)
                      ? "text-red-600 hover:text-red-700"
                      : "text-gray-500 hover:text-red-600"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      likedComments.has(comment._id) ? "fill-current" : ""
                    }`}
                  />
                  <span>{comment.likeCount || 0}</span>
                </button>

                {depth < maxDepth && (
                  <button
                    onClick={() =>
                      setReplyingTo(
                        replyingTo === comment._id ? null : comment._id
                      )
                    }
                    className="flex items-center space-x-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <Reply className="h-4 w-4" />
                    <span>Reply</span>
                  </button>
                )}

                {hasReplies && (
                  <button
                    onClick={() => toggleCommentExpansion(comment._id)}
                    className="flex items-center space-x-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span>
                      {comment.replies?.length}{" "}
                      {comment.replies?.length === 1 ? "reply" : "replies"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Reply Form */}
            <AnimatePresence>
              {replyingTo === comment._id && (
                <ReplyForm
                  key={`reply-form-${comment._id}`}
                  commentId={comment._id}
                  authorName={
                    comment.author.firstName || comment.author.username
                  }
                  user={user}
                  onSubmit={handleReplySubmit}
                  onCancel={() => setReplyingTo(null)}
                />
              )}
            </AnimatePresence>

            {/* Nested Replies */}
            {hasReplies &&
              (isExpanded || expandedComments.has(comment._id)) && (
                <div className="mt-4 space-y-4">
                  {comment.replies
                    ?.filter((reply) => reply && reply._id)
                    .map((reply) => (
                      <CommentThread
                        key={reply._id}
                        comment={reply}
                        depth={depth + 1}
                      />
                    ))}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Blog not found
          </h2>
          <p className="text-gray-600 mb-6">
            The blog you're looking for doesn't exist.
          </p>
          <Link
            to="/blogs"
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Browse Blogs
          </Link>
        </div>
      </div>
    );
  }

  const isAuthor = user?._id === blog.author._id;

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 w-full h-1 bg-gray-100 z-50">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Navigation Header */}
      <div className="sticky top-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-40">
        <div className="max-w-4xl mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="font-medium text-sm sm:text-base">Back</span>
            </button>

            {/* Author Actions for Mobile */}
            {isAuthor && (
              <div className="flex items-center space-x-2">
                <Link
                  to={`/edit/${blog._id}`}
                  className="text-blue-600 hover:text-blue-800 transition-colors p-2"
                  title="Edit blog"
                >
                  <Edit3 className="h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
                <button
                  onClick={handleDeleteBlog}
                  className="text-red-600 hover:text-red-800 transition-colors p-2"
                  title="Delete blog"
                >
                  <Trash2 className="h-4 w-4 sm:h-5 sm:w-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 py-6 sm:py-8 w-full overflow-hidden">
        {/* Blog Header */}
        <div className="mb-6 sm:mb-8 w-full">
          {/* Tags */}
          {blog.tags && blog.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6">
              {blog.tags.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-50 text-blue-700 text-xs sm:text-sm font-medium rounded-full"
                >
                  <Tag className="h-3 w-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4 sm:mb-6 break-words">
            {blog.title}
          </h1>

          {/* Excerpt */}
          {blog.excerpt && (
            <p className="text-base sm:text-lg md:text-xl text-gray-600 leading-relaxed mb-6 sm:mb-8 break-words">
              {blog.excerpt}
            </p>
          )}

          {/* Author & Meta Info */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between py-4 sm:py-6 border-b border-gray-100 gap-4">
            <div className="flex items-center space-x-3">
              <Link
                to={`/profile/${blog.author.username}`}
                className="flex items-center space-x-3 hover:opacity-80 transition-opacity"
              >
                <div className="w-10 h-10 sm:w-11 sm:h-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium text-sm sm:text-base">
                  {blog.author.firstName?.charAt(0) ||
                    blog.author.username?.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-gray-900 text-sm sm:text-base">
                    {blog.author.fullName || blog.author.username}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500 sm:hidden">
                    @{blog.author.username}
                  </p>
                </div>
              </Link>

              {!isAuthor && (
                <button className="px-3 sm:px-4 py-1.5 border border-gray-300 text-gray-700 text-xs sm:text-sm font-medium rounded-full hover:bg-gray-50 transition-colors">
                  Follow
                </button>
              )}
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm text-gray-500">
              <span>{blog.readingTime || 5} min read</span>
              <span>•</span>
              <span className="truncate">
                {formatDate(blog.publishedAt || blog.createdAt)}
              </span>
            </div>
          </div>

          {/* Interaction Bar */}
          <div className="flex items-center justify-between py-3 sm:py-4 border-b border-gray-100">
            <div className="flex items-center space-x-4 sm:space-x-6">
              <button
                onClick={handleLike}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <Heart
                  className={`h-5 w-5 sm:h-6 sm:w-6 ${
                    isLiked ? "fill-red-500 text-red-500" : ""
                  }`}
                />
                <span className="text-xs sm:text-sm font-medium">
                  {likesCount}
                </span>
              </button>

              <button
                onClick={scrollToComments}
                className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-medium">
                  {getTotalCommentsCount()}
                </span>
              </button>

              <div className="flex items-center space-x-1 sm:space-x-2 text-gray-600">
                <Eye className="h-5 w-5 sm:h-6 sm:w-6" />
                <span className="text-xs sm:text-sm font-medium">
                  {blog.metrics?.views || 0}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <button
                onClick={handleBookmark}
                className="text-gray-600 hover:text-gray-900 transition-colors p-1"
              >
                <Bookmark
                  className={`h-5 w-5 sm:h-6 sm:w-6 ${
                    isBookmarked ? "fill-current" : ""
                  }`}
                />
              </button>

              <div className="relative">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShareMenu(!showShareMenu);
                  }}
                  className="text-gray-600 hover:text-gray-900 transition-colors p-1"
                >
                  <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
                </button>

                {showShareMenu && (
                  <div
                    className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50 min-w-[180px]"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleShare("twitter")}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Twitter className="h-4 w-4 text-blue-500" />
                      <span>Share on Twitter</span>
                    </button>
                    <button
                      onClick={() => handleShare("linkedin")}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Linkedin className="h-4 w-4 text-blue-700" />
                      <span>Share on LinkedIn</span>
                    </button>
                    <button
                      onClick={() => handleShare("copy")}
                      className="flex items-center space-x-3 w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-sm"
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4 text-gray-500" />
                      )}
                      <span>{copied ? "Copied!" : "Copy link"}</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Author Actions */}
          {isAuthor && (
            <div className="flex items-center justify-end space-x-3 mt-4">
              <Link
                to={`/edit/${blog._id}`}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Edit3 className="h-4 w-4" />
                <span>Edit</span>
              </Link>
              <button
                onClick={handleDeleteBlog}
                className="flex items-center space-x-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors"
              >
                <Trash2 className="h-4 w-4" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <div className="mb-8 sm:mb-12">
            <img
              src={blog.featuredImage}
              alt={blog.title}
              className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover rounded-lg sm:rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Blog Content */}
        <div className="mb-8 sm:mb-12 w-full overflow-hidden">
          <div className="prose prose-sm sm:prose-base lg:prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-1 prose-code:rounded">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {blog.content}
            </ReactMarkdown>
          </div>
        </div>

        {/* SEO Keywords */}
        {blog.seo?.keywords && blog.seo.keywords.length > 0 && (
          <div className="mb-8 sm:mb-12 p-4 sm:p-6 bg-gray-50 rounded-lg sm:rounded-xl">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
              Related Topics
            </h3>
            <div className="flex flex-wrap gap-2">
              {blog.seo.keywords.map((keyword) => (
                <span
                  key={keyword}
                  className="px-2 sm:px-3 py-1 bg-white text-gray-600 text-xs sm:text-sm rounded-full border border-gray-200"
                >
                  {keyword}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Comments Section */}
      <ErrorBoundary
        fallback={
          <div className="bg-gray-50 py-8 sm:py-16">
            <div className="max-w-4xl mx-auto px-4">
              <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-100 p-8">
                <div className="text-center">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">
                    Comments Temporarily Unavailable
                  </h2>
                  <p className="text-gray-600">
                    We're experiencing issues loading comments. Please refresh
                    the page to try again.
                  </p>
                </div>
              </div>
            </div>
          </div>
        }
      >
        <section id="comments-section" className="bg-gray-50 py-8 sm:py-16">
          <div className="max-w-4xl mx-auto px-4 w-full overflow-hidden">
            <div className="bg-white rounded-lg sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden w-full">
              <div className="p-4 sm:p-8 border-b border-gray-100">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  Discussion ({getTotalCommentsCount()})
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Join the conversation and share your thoughts on this article.
                </p>
              </div>

              <div className="p-4 sm:p-8 w-full overflow-hidden">
                {/* Comment Form */}
                {user ? (
                  <form
                    onSubmit={handleSubmitComment}
                    className="mb-8 sm:mb-12"
                  >
                    <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0 mx-auto sm:mx-0">
                        {user.firstName?.charAt(0) || user.username?.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <textarea
                          ref={commentTextareaRef}
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="What are your thoughts on this article?"
                          className="w-full p-3 sm:p-4 border border-gray-200 rounded-lg sm:rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-gray-900 placeholder-gray-500 text-sm sm:text-base"
                          rows={3}
                        />
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mt-3 sm:mt-4 gap-3">
                          <p className="text-xs sm:text-sm text-gray-500 text-center sm:text-left">
                            Be respectful and constructive in your comments.
                          </p>
                          <button
                            type="submit"
                            disabled={!newComment.trim()}
                            className="flex items-center justify-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium text-sm sm:text-base"
                          >
                            <Send className="h-4 w-4" />
                            <span>Post Comment</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-8 sm:mb-12 p-4 sm:p-8 bg-gray-50 border border-gray-200 rounded-lg sm:rounded-xl text-center">
                    <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      Join the discussion
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">
                      Sign in to share your thoughts and engage with other
                      readers.
                    </p>
                    <Link
                      to="/login"
                      className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                    >
                      <User className="h-4 w-4" />
                      <span>Sign In to Comment</span>
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                {commentsLoading ? (
                  <div className="flex justify-center py-8 sm:py-12">
                    <LoadingSpinner size="lg" />
                  </div>
                ) : comments.length > 0 ? (
                  <div className="space-y-6 sm:space-y-8">
                    {comments
                      .filter((comment) => comment && comment._id)
                      .map((comment) => (
                        <CommentThread key={comment._id} comment={comment} />
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-12 sm:py-16">
                    <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
                      No comments yet
                    </h3>
                    <p className="text-sm sm:text-base text-gray-600 mb-6 sm:mb-8">
                      Be the first to share your thoughts on this article.
                    </p>
                    {!user && (
                      <Link
                        to="/login"
                        className="inline-flex items-center space-x-2 px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors font-medium text-sm sm:text-base"
                      >
                        <User className="h-4 w-4" />
                        <span>Sign In to Comment</span>
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </ErrorBoundary>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-4 bg-white text-gray-600 rounded-full shadow-lg hover:shadow-xl border border-gray-200 hover:text-gray-900 transition-all z-40"
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

export default BlogDetail;
