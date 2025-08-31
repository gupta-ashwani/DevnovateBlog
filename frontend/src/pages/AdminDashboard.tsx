import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Users,
  FileText,
  MessageCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Eye,
  Calendar,
  Filter,
  Search,
  MoreHorizontal,
  Edit3,
  Trash2,
  User,
  BarChart3,
  EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { adminService } from "@/services/admin";
import { Blog, User as UserType, DashboardStats } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import BlogPreview from "@/components/admin/BlogPreview";
import RejectionModal from "@/components/admin/RejectionModal";

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [pendingBlogs, setPendingBlogs] = useState<Blog[]>([]);
  const [publishedBlogs, setPublishedBlogs] = useState<Blog[]>([]);
  const [recentUsers, setRecentUsers] = useState<UserType[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [previewBlog, setPreviewBlog] = useState<Blog | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [rejectionModal, setRejectionModal] = useState<{
    isOpen: boolean;
    blog: Blog | null;
  }>({ isOpen: false, blog: null });

  useEffect(() => {
    if (user?.role === "admin") {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const [
        dashboardStats,
        pendingBlogsData,
        publishedBlogsData,
        recentUsersData,
      ] = await Promise.all([
        adminService.getDashboardStats(),
        adminService.getPendingBlogs(),
        adminService.getAllBlogs({ status: "approved", limit: 50 }),
        adminService.getRecentUsers(),
      ]);

      setStats(dashboardStats);
      setPendingBlogs(pendingBlogsData);
      setPublishedBlogs(publishedBlogsData.blogs || []);
      setRecentUsers(recentUsersData);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBlogAction = async (
    blogId: string,
    action: "approve" | "reject",
    adminNotes?: string
  ) => {
    try {
      setActionLoading(blogId);
      await adminService.reviewBlog(blogId, {
        status: action === "approve" ? "approved" : "rejected",
        adminNotes: adminNotes || "",
      });

      // Remove the blog from pending list
      setPendingBlogs(pendingBlogs.filter((blog) => blog._id !== blogId));

      // Update stats
      if (stats) {
        setStats({
          ...stats,
          overview: {
            ...stats.overview,
            pendingBlogs: stats.overview.pendingBlogs - 1,
            publishedBlogs:
              action === "approve"
                ? stats.overview.publishedBlogs + 1
                : stats.overview.publishedBlogs,
          },
        });
      }
    } catch (error) {
      console.error(`Error ${action}ing blog:`, error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleBlogPreview = (blog: Blog) => {
    setPreviewBlog(blog);
    setShowPreview(true);
  };

  const handleClosePreview = () => {
    setShowPreview(false);
    setPreviewBlog(null);
  };

  const handleRejectionConfirm = async (reason: string) => {
    if (!rejectionModal.blog) return;

    await handleBlogAction(rejectionModal.blog._id, "reject", reason);
    setRejectionModal({ isOpen: false, blog: null });
  };

  const handleRejectClick = (blog: Blog) => {
    setRejectionModal({ isOpen: true, blog });
  };

  const handleHideBlog = async (blogId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to hide this blog from public view? You can always show it again later."
      )
    ) {
      return;
    }

    try {
      setActionLoading(blogId);
      await adminService.toggleBlogVisibility(blogId);

      // Remove from published blogs list and update stats
      setPublishedBlogs(publishedBlogs.filter((blog) => blog._id !== blogId));

      if (stats) {
        setStats({
          ...stats,
          overview: {
            ...stats.overview,
            publishedBlogs: stats.overview.publishedBlogs - 1,
          },
        });
      }
    } catch (error) {
      console.error("Error hiding blog:", error);
      alert("Failed to hide blog. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this blog? This action cannot be undone."
      )
    ) {
      return;
    }

    try {
      setActionLoading(blogId);
      await adminService.deleteBlog(blogId);

      // Remove from published blogs list and update stats
      setPublishedBlogs(publishedBlogs.filter((blog) => blog._id !== blogId));

      if (stats) {
        setStats({
          ...stats,
          overview: {
            ...stats.overview,
            publishedBlogs: stats.overview.publishedBlogs - 1,
          },
        });
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
      alert("Failed to delete blog. Please try again.");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-100";
      case "pending":
        return "text-yellow-600 bg-yellow-100";
      case "rejected":
        return "text-red-600 bg-red-100";
      case "draft":
        return "text-gray-600 bg-gray-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h2>
          <p className="text-gray-600 mb-6">
            You don't have permission to access the admin dashboard.
          </p>
          <Link
            to="/"
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 sm:py-6 gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex items-center space-x-3">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-lg sm:text-xl font-semibold">
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <Link
                    to="/admin/profile"
                    className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-1.5 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors touch-manipulation"
                    title="Edit avatar"
                  >
                    <Edit3 className="h-3.5 w-3.5 text-gray-600" />
                  </Link>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 truncate">
                    Admin Dashboard
                  </h1>
                  <p className="mt-1 text-sm sm:text-base text-gray-600 truncate">
                    Welcome back, {user?.fullName}
                    <span className="hidden md:inline">
                      {" "}
                      • Manage blogs, users, and platform analytics
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div className="flex space-x-3">
              <Link
                to="/admin/profile"
                className="bg-gray-100 text-gray-700 px-3 sm:px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2 text-sm"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Edit Profile</span>
                <span className="sm:hidden">Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 w-full"
            >
              <div className="flex items-center">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Users
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats.overview.totalUsers}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 w-full"
            >
              <div className="flex items-center">
                <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Published Blogs
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats.overview.publishedBlogs}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-lg p-4 sm:p-6 border border-gray-200 w-full sm:col-span-2 lg:col-span-1"
            >
              <div className="flex items-center">
                <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-yellow-600" />
                <div className="ml-3 sm:ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Pending Review
                  </p>
                  <p className="text-xl sm:text-2xl font-bold text-gray-900">
                    {stats.overview.pendingBlogs}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav
              className="flex overflow-x-auto px-4 sm:px-6"
              aria-label="Tabs"
            >
              <button
                onClick={() => setActiveTab("overview")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap mr-6 sm:mr-8 ${
                  activeTab === "overview"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("pending")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap mr-6 sm:mr-8 ${
                  activeTab === "pending"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="hidden sm:inline">
                  Pending Blogs ({pendingBlogs.length})
                </span>
                <span className="sm:hidden">
                  Pending ({pendingBlogs.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("published")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap mr-6 sm:mr-8 ${
                  activeTab === "published"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="hidden sm:inline">
                  Published Blogs ({publishedBlogs.length})
                </span>
                <span className="sm:hidden">
                  Published ({publishedBlogs.length})
                </span>
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`py-3 sm:py-4 px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap ${
                  activeTab === "users"
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                <span className="hidden sm:inline">Recent Users</span>
                <span className="sm:hidden">Users</span>
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === "overview" && stats && (
              <div className="space-y-6">
                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Blogs
                    </h3>
                    <div className="space-y-3">
                      {stats.recentActivity.recentBlogs
                        .slice(0, 5)
                        .map((blog) => (
                          <div
                            key={blog._id}
                            className="flex items-center space-x-3"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {blog.title}
                              </p>
                              <p className="text-xs text-gray-500">
                                by{" "}
                                {blog.author?.fullName || blog.author?.username}
                              </p>
                            </div>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                blog.status
                              )}`}
                            >
                              {blog.status}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Recent Users
                    </h3>
                    <div className="space-y-3">
                      {stats.recentActivity.recentUsers
                        .slice(0, 5)
                        .map((user) => (
                          <div
                            key={user._id}
                            className="flex items-center space-x-3"
                          >
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-medium">
                              {user.firstName?.charAt(0) ||
                                user.username?.charAt(0)}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {user.fullName || user.username}
                              </p>
                              <p className="text-xs text-gray-500">
                                Joined {formatDate(user.createdAt)}
                              </p>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "pending" && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search blogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                    </div>
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                {/* Pending Blogs List */}
                {(() => {
                  // Filter blogs based on search and status
                  const filteredBlogs = pendingBlogs.filter((blog) => {
                    const matchesSearch =
                      searchTerm === "" ||
                      blog.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      blog.content
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      blog.author?.fullName
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      blog.author?.username
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase());

                    const matchesStatus =
                      filterStatus === "all" || blog.status === filterStatus;

                    return matchesSearch && matchesStatus;
                  });

                  if (filteredBlogs.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm || filterStatus !== "all"
                            ? "No matching blogs"
                            : "No pending blogs"}
                        </h3>
                        <p className="text-gray-600">
                          {searchTerm || filterStatus !== "all"
                            ? "Try adjusting your search or filter criteria"
                            : "All blogs have been reviewed!"}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredBlogs.map((blog) => (
                        <motion.div
                          key={blog._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {blog.title}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    blog.status
                                  )}`}
                                >
                                  {blog.status}
                                </span>
                              </div>

                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {blog.excerpt ||
                                  blog.content.substring(0, 200) + "..."}
                              </p>

                              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                                <span className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>
                                    {blog.author?.fullName ||
                                      blog.author?.username}
                                  </span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{formatDate(blog.createdAt)}</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{blog.readingTime} min read</span>
                                </span>
                              </div>

                              {blog.tags && blog.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {blog.tags.slice(0, 5).map((tag) => (
                                    <span
                                      key={tag}
                                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleBlogPreview(blog)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Preview Blog →
                            </button>

                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleRejectClick(blog)}
                                disabled={actionLoading === blog._id}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                              >
                                {actionLoading === blog._id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Reject
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() =>
                                  handleBlogAction(blog._id, "approve")
                                }
                                disabled={actionLoading === blog._id}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                              >
                                {actionLoading === blog._id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === "published" && (
              <div className="space-y-6">
                {/* Search and Filter */}
                <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search published blogs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                      />
                    </div>
                  </div>
                </div>

                {/* Published Blogs List */}
                {(() => {
                  // Filter blogs based on search
                  const filteredBlogs = publishedBlogs.filter((blog) => {
                    const matchesSearch =
                      searchTerm === "" ||
                      blog.title
                        .toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      blog.content
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      blog.author?.fullName
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                      blog.author?.username
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase());

                    return matchesSearch;
                  });

                  if (filteredBlogs.length === 0) {
                    return (
                      <div className="text-center py-12">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {searchTerm
                            ? "No matching blogs"
                            : "No published blogs"}
                        </h3>
                        <p className="text-gray-600">
                          {searchTerm
                            ? "Try adjusting your search criteria"
                            : "No blogs have been published yet"}
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-4">
                      {filteredBlogs.map((blog) => (
                        <motion.div
                          key={blog._id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="text-xl font-semibold text-gray-900">
                                  {blog.title}
                                </h3>
                                <span
                                  className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                    blog.status
                                  )}`}
                                >
                                  {blog.status}
                                </span>
                                {blog.isFeatured && (
                                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                                    Featured
                                  </span>
                                )}
                              </div>

                              <p className="text-gray-600 mb-3 line-clamp-2">
                                {blog.excerpt ||
                                  blog.content?.substring(0, 200) + "..."}
                              </p>

                              <div className="flex items-center space-x-6 text-sm text-gray-500 mb-4">
                                <span className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>
                                    {blog.author?.fullName ||
                                      blog.author?.username}
                                  </span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>
                                    {formatDate(
                                      blog.publishedAt || blog.createdAt
                                    )}
                                  </span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <Eye className="h-4 w-4" />
                                  <span>{blog.metrics?.views || 0} views</span>
                                </span>
                                <span className="flex items-center space-x-1">
                                  <TrendingUp className="h-4 w-4" />
                                  <span>{blog.metrics?.likes || 0} likes</span>
                                </span>
                              </div>

                              {blog.tags && blog.tags.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                  {blog.tags.slice(0, 5).map((tag) => (
                                    <span
                                      key={tag}
                                      className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleBlogPreview(blog)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                            >
                              Preview Blog →
                            </button>

                            <div className="flex space-x-3">
                              <button
                                onClick={() => handleHideBlog(blog._id)}
                                disabled={actionLoading === blog._id}
                                className="inline-flex items-center px-3 py-1.5 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-white hover:bg-yellow-50 disabled:opacity-50"
                                title="Hide this blog from public view"
                              >
                                {actionLoading === blog._id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <Eye className="h-4 w-4 mr-1" />
                                    Hide
                                  </>
                                )}
                              </button>
                              <button
                                onClick={() => handleDeleteBlog(blog._id)}
                                disabled={actionLoading === blog._id}
                                className="inline-flex items-center px-3 py-1.5 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50"
                                title="Permanently delete this blog"
                              >
                                {actionLoading === blog._id ? (
                                  <LoadingSpinner size="sm" />
                                ) : (
                                  <>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-4">
                {recentUsers.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No users found
                    </h3>
                    <p className="text-gray-600">No recent user activity.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {recentUsers.map((user) => (
                      <motion.div
                        key={user._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                            {user.firstName?.charAt(0) ||
                              user.username?.charAt(0)}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {user.fullName || user.username}
                            </h4>
                            <p className="text-sm text-gray-600">
                              @{user.username}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex justify-between">
                            <span>Email:</span>
                            <span className="truncate ml-2">{user.email}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Joined:</span>
                            <span>{formatDate(user.createdAt)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Blogs:</span>
                            <span>{user.stats?.totalBlogs || 0}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Status:</span>
                            <span
                              className={
                                user.isActive
                                  ? "text-green-600"
                                  : "text-red-600"
                              }
                            >
                              {user.isActive ? "Active" : "Inactive"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Blog Preview Modal */}
      {previewBlog && (
        <BlogPreview
          blog={previewBlog}
          isOpen={showPreview}
          onClose={handleClosePreview}
        />
      )}

      {/* Rejection Modal */}
      <RejectionModal
        isOpen={rejectionModal.isOpen}
        onClose={() => setRejectionModal({ isOpen: false, blog: null })}
        onConfirm={handleRejectionConfirm}
        blogTitle={rejectionModal.blog?.title || ""}
        isLoading={actionLoading === rejectionModal.blog?._id}
      />
    </div>
  );
};

export default AdminDashboard;
