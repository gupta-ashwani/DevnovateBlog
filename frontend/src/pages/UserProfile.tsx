import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  User,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  FileText,
  Edit3,
  Trash2,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  TrendingUp,
  Users,
  Globe,
  Github,
  Twitter,
  Linkedin,
  Settings,
  Plus,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { blogService } from "@/services/blog";
import { userService } from "@/services/user";
import { Blog, User as UserType } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const UserProfile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  // If no username in params, use current user
  const isOwnProfile = !username || username === currentUser?.username;
  const profileUsername = username || currentUser?.username;

  const [user, setUser] = useState<UserType | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [activeTab, setActiveTab] = useState("published");
  const [isLoading, setIsLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    pendingBlogs: 0,
    rejectedBlogs: 0,
  });
  const [statsLoading, setStatsLoading] = useState(false);

  // Handle blog click navigation
  const handleBlogClick = (blog: Blog) => {
    // Only allow navigation to published blogs for non-owners
    if (blog.status === "approved") {
      navigate(`/blog/${blog.slug}`);
    } else if (isOwnProfile) {
      // For own drafts/pending blogs, navigate to edit page
      if (blog.status === "draft" || blog.status === "pending") {
        navigate(`/edit/${blog._id}`);
      } else if (blog.status === "rejected") {
        // For rejected blogs, also go to edit page to make corrections
        navigate(`/edit/${blog._id}`);
      }
    }
    // For non-owners viewing unpublished blogs, do nothing
  };

  // Check if blog is clickable
  const isBlogClickable = (blog: Blog) => {
    return blog.status === "approved" || isOwnProfile;
  };

  // Get click hint text based on blog status
  const getClickHint = (blog: Blog) => {
    if (!isBlogClickable(blog)) return "";

    if (blog.status === "approved") {
      return "Click to view blog";
    } else if (isOwnProfile) {
      if (blog.status === "draft") {
        return "Click to continue editing";
      } else if (blog.status === "pending") {
        return "Click to view or edit";
      } else if (blog.status === "rejected") {
        return "Click to edit and resubmit";
      }
    }
    return "";
  };

  useEffect(() => {
    if (isOwnProfile && currentUser) {
      // If it's own profile, use current user data
      setUser(currentUser);
      setIsLoading(false);
      // Calculate stats from basic user data initially
      calculateStats(currentUser);
    } else if (profileUsername) {
      fetchUserProfile();
    }
  }, [profileUsername, currentUser, isOwnProfile]);

  useEffect(() => {
    if (user && activeTab) {
      fetchUserBlogs();
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user) {
      fetchAndCalculateStats();
    }
  }, [user, isOwnProfile]);

  const calculateStatsFromBlogs = (allBlogs: Blog[]) => {
    const totalViews = allBlogs.reduce(
      (sum, blog) => sum + (blog.metrics?.views || 0),
      0
    );
    const totalLikes = allBlogs.reduce(
      (sum, blog) => sum + (blog.metrics?.likes || 0),
      0
    );
    const totalComments = allBlogs.reduce(
      (sum, blog) => sum + (blog.metrics?.comments || 0),
      0
    );
    const publishedBlogs = allBlogs.filter(
      (blog) => blog.status === "approved"
    ).length;
    const draftBlogs = allBlogs.filter(
      (blog) => blog.status === "draft"
    ).length;
    const pendingBlogs = allBlogs.filter(
      (blog) => blog.status === "pending"
    ).length;
    const rejectedBlogs = allBlogs.filter(
      (blog) => blog.status === "rejected"
    ).length;

    setStats({
      totalViews,
      totalLikes,
      totalComments,
      publishedBlogs,
      draftBlogs,
      pendingBlogs,
      rejectedBlogs,
    });
  };

  const fetchBlogCounts = async () => {
    if (!isOwnProfile) return;

    try {
      // Fetch blogs for each status to get accurate counts
      const [publishedRes, draftRes, pendingRes, rejectedRes] =
        await Promise.all([
          userService.getMyBlogs("approved"),
          userService.getMyBlogs("draft"),
          userService.getMyBlogs("pending"),
          userService.getMyBlogs("rejected"),
        ]);

      setStats((prev) => ({
        ...prev,
        publishedBlogs: publishedRes.pagination?.totalBlogs || 0,
        draftBlogs: draftRes.pagination?.totalBlogs || 0,
        pendingBlogs: pendingRes.pagination?.totalBlogs || 0,
        rejectedBlogs: rejectedRes.pagination?.totalBlogs || 0,
      }));
    } catch (error) {
      console.error("Error fetching blog counts:", error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getUserByUsername(profileUsername!);
      setUser(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAndCalculateStats = async () => {
    if (!user) return;

    try {
      setStatsLoading(true);
      if (isOwnProfile) {
        // For own profile, fetch all blogs to calculate accurate stats
        const [publishedRes, draftRes, pendingRes, rejectedRes] =
          await Promise.all([
            userService.getMyBlogs("approved"),
            userService.getMyBlogs("draft"),
            userService.getMyBlogs("pending"),
            userService.getMyBlogs("rejected"),
          ]);

        const allBlogs = [
          ...publishedRes.blogs,
          ...draftRes.blogs,
          ...pendingRes.blogs,
          ...rejectedRes.blogs,
        ];

        calculateStatsFromBlogs(allBlogs);
      } else {
        // For other users, only published blogs are available
        const response = await userService.getUserBlogs(user.username);
        calculateStatsFromBlogs(response.blogs);
      }
    } catch (error) {
      console.error("Error fetching blogs for stats:", error);
      // Fallback to basic user stats
      calculateStats(user);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchUserBlogs = async () => {
    if (!user) return;

    try {
      setBlogsLoading(true);
      let response;

      if (isOwnProfile) {
        // Own profile - can see all blogs using the correct service
        const status =
          activeTab === "published"
            ? "approved"
            : activeTab === "drafts"
            ? "draft"
            : activeTab === "pending"
            ? "pending"
            : activeTab === "rejected"
            ? "rejected"
            : undefined;

        response = await userService.getMyBlogs(status);
      } else {
        // Other's profile - only see published blogs
        response = await userService.getUserBlogs(user.username);
      }

      setBlogs(response.blogs);
    } catch (error) {
      console.error("Error fetching user blogs:", error);
    } finally {
      setBlogsLoading(false);
    }
  };

  const calculateStats = (userData: UserType) => {
    const userStats = userData.stats || {};
    setStats({
      totalViews: userStats.totalViews || 0,
      totalLikes: userStats.totalLikes || 0,
      totalComments: 0, // Will be calculated from blogs
      publishedBlogs: userStats.totalBlogs || 0,
      draftBlogs: 0,
      pendingBlogs: 0,
      rejectedBlogs: 0,
    });
  };

  const handleDeleteBlog = async (blogId: string) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await blogService.deleteBlog(blogId);
      setBlogs(blogs.filter((blog) => blog._id !== blogId));

      // Recalculate stats after deletion
      if (isOwnProfile) {
        fetchAndCalculateStats();
      }
    } catch (error) {
      console.error("Error deleting blog:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      approved: {
        color: "bg-green-100 text-green-800",
        icon: CheckCircle,
        label: "Published",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800",
        icon: Clock,
        label: "Pending Review",
      },
      draft: {
        color: "bg-gray-100 text-gray-800",
        icon: Edit3,
        label: "Draft",
      },
      rejected: {
        color: "bg-red-100 text-red-800",
        icon: XCircle,
        label: "Rejected",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const Icon = config.icon;

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}
      >
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            User Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The user you're looking for doesn't exist.
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName || user.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user.firstName?.charAt(0).toUpperCase() ||
                  user.username?.charAt(0).toUpperCase()
                )}
              </div>
              {isOwnProfile && (
                <Link
                  to="/profile/edit"
                  className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:bg-gray-50 transition-colors"
                  title="Edit avatar"
                >
                  <Edit3 className="h-4 w-4 text-gray-600" />
                </Link>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">
                  {user.fullName || user.username}
                </h1>
                {isOwnProfile && (
                  <Link
                    to="/profile/edit"
                    className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    Edit Profile
                  </Link>
                )}
              </div>

              <p className="text-gray-600 mb-3">@{user.username}</p>

              {user.bio && (
                <p className="text-gray-700 mb-4 max-w-2xl">{user.bio}</p>
              )}

              {/* Social Links */}
              <div className="flex items-center space-x-4">
                {user.socialLinks?.website && (
                  <a
                    href={user.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks?.twitter && (
                  <a
                    href={user.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-500"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks?.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-700"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            {isOwnProfile && (
              <div className="flex space-x-3">
                <Link
                  to="/write"
                  className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Write Blog
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
        </div>
        <div
          className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-opacity ${
            statsLoading ? "opacity-70" : "opacity-100"
          }`}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-white rounded-lg p-4 border border-gray-200 ${
              statsLoading ? "animate-pulse" : ""
            }`}
          >
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Blogs</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.publishedBlogs}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`bg-white rounded-lg p-4 border border-gray-200 ${
              statsLoading ? "animate-pulse" : ""
            }`}
          >
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalViews.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`bg-white rounded-lg p-4 border border-gray-200 ${
              statsLoading ? "animate-pulse" : ""
            }`}
          >
            <div className="flex items-center">
              <Heart className="h-8 w-8 text-red-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Likes</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalLikes.toLocaleString()}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`bg-white rounded-lg p-4 border border-gray-200 ${
              statsLoading ? "animate-pulse" : ""
            }`}
          >
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-600">Followers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {user.stats?.followersCount || 0}
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {isOwnProfile ? (
                <>
                  <button
                    onClick={() => setActiveTab("published")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "published"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Published ({stats.publishedBlogs})
                  </button>
                  <button
                    onClick={() => setActiveTab("drafts")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "drafts"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Drafts ({stats.draftBlogs})
                  </button>
                  <button
                    onClick={() => setActiveTab("pending")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "pending"
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Pending Review ({stats.pendingBlogs})
                  </button>
                  <button
                    onClick={() => setActiveTab("rejected")}
                    className={`py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === "rejected"
                        ? "border-red-500 text-red-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    Rejected ({stats.rejectedBlogs})
                  </button>
                </>
              ) : (
                <button className="py-4 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
                  Published Blogs ({stats.publishedBlogs})
                </button>
              )}
            </nav>
          </div>

          {/* Blog List */}
          <div className="p-6">
            {blogsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {activeTab === "published"
                    ? "No published blogs yet"
                    : activeTab === "drafts"
                    ? "No drafts yet"
                    : activeTab === "pending"
                    ? "No pending blogs"
                    : activeTab === "rejected"
                    ? "No rejected blogs"
                    : "No blogs yet"}
                </h3>
                <p className="text-gray-600 mb-6">
                  {isOwnProfile
                    ? activeTab === "rejected"
                      ? "No blogs have been rejected. Keep writing quality content!"
                      : "Start writing to share your knowledge with the community!"
                    : "This user hasn't published any blogs yet."}
                </p>
                {isOwnProfile && (
                  <Link
                    to="/write"
                    className="inline-flex items-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Write Your First Blog
                  </Link>
                )}
              </div>
            ) : (
              <div className="space-y-6">
                {blogs.map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() =>
                      isBlogClickable(blog) && handleBlogClick(blog)
                    }
                    title={getClickHint(blog)}
                    className={`border border-gray-200 rounded-lg p-6 transition-all ${
                      isBlogClickable(blog)
                        ? "hover:shadow-md cursor-pointer hover:border-gray-300"
                        : "cursor-default"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                            {blog.title}
                          </h3>
                          {getStatusBadge(blog.status)}
                        </div>

                        {/* Show rejection reason if blog is rejected */}
                        {blog.status === "rejected" && blog.adminNotes && (
                          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                            <h4 className="text-sm font-medium text-red-900 mb-1">
                              Rejection Reason:
                            </h4>
                            <p className="text-sm text-red-700">
                              {blog.adminNotes}
                            </p>
                          </div>
                        )}

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {blog.excerpt ||
                            blog.content.substring(0, 150) + "..."}
                        </p>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(blog.createdAt)}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Eye className="h-4 w-4" />
                            <span>{blog.metrics?.views || 0} views</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <Heart className="h-4 w-4" />
                            <span>{blog.metrics?.likes || 0} likes</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{blog.metrics?.comments || 0} comments</span>
                          </span>
                        </div>
                      </div>

                      {isOwnProfile && (
                        <div className="flex items-center space-x-2 ml-4">
                          <Link
                            to={`/edit/${blog._id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Link>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteBlog(blog._id);
                            }}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    {blog.tags && blog.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {blog.tags.slice(0, 5).map((tag) => (
                          <span
                            key={tag}
                            className="bg-gray-100 text-gray-700 px-2 py-1 rounded-md text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {blog.tags.length > 5 && (
                          <span className="text-gray-500 text-xs">
                            +{blog.tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Click indicator */}
                    {isBlogClickable(blog) && (
                      <div className="mt-4 pt-3 border-t border-gray-100">
                        <p className="text-xs text-gray-500 flex items-center">
                          {blog.status === "approved" ? (
                            <>
                              <Eye className="h-3 w-3 mr-1" />
                              Click to view blog
                            </>
                          ) : isOwnProfile ? (
                            blog.status === "draft" ? (
                              <>
                                <Edit3 className="h-3 w-3 mr-1" />
                                Click to continue editing
                              </>
                            ) : blog.status === "pending" ? (
                              <>
                                <Clock className="h-3 w-3 mr-1" />
                                Click to view or edit
                              </>
                            ) : blog.status === "rejected" ? (
                              <>
                                <AlertCircle className="h-3 w-3 mr-1" />
                                Click to edit and resubmit
                              </>
                            ) : null
                          ) : null}
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
