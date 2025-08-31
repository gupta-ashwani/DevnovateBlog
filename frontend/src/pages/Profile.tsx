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
} from "lucide-react";
import { userService } from "@/services/user";
import { User as UserType, Blog } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const Profile: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();

  const [user, setUser] = useState<UserType | null>(null);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    publishedBlogs: 0,
  });

  useEffect(() => {
    if (username) {
      fetchUserProfile();
      fetchUserBlogs();
    }
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);
      const userData = await userService.getUserByUsername(username!);
      setUser(userData);
      calculateStats(userData);
    } catch (error) {
      console.error("Error fetching user profile:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBlogs = async () => {
    try {
      setBlogsLoading(true);
      const response = await userService.getUserBlogs(username!);
      setBlogs(response.blogs);
      calculateStatsFromBlogs(response.blogs);
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
      totalComments: 0,
      publishedBlogs: userStats.totalBlogs || 0,
    });
  };

  const calculateStatsFromBlogs = (userBlogs: Blog[]) => {
    const totalViews = userBlogs.reduce(
      (sum, blog) => sum + (blog.metrics?.views || 0),
      0
    );
    const totalLikes = userBlogs.reduce(
      (sum, blog) => sum + (blog.metrics?.likes || 0),
      0
    );
    const totalComments = userBlogs.reduce(
      (sum, blog) => sum + (blog.metrics?.comments || 0),
      0
    );

    setStats({
      totalViews,
      totalLikes,
      totalComments,
      publishedBlogs: userBlogs.length,
    });
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="flex flex-col items-center text-center sm:flex-row sm:items-start sm:text-left sm:space-x-6 space-y-4 sm:space-y-0">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold overflow-hidden">
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
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 break-words">
                {user.fullName || user.username}
              </h1>

              <p className="text-gray-600 mb-3 text-sm sm:text-base">
                @{user.username}
              </p>

              {user.bio && (
                <p className="text-gray-700 mb-4 max-w-2xl text-sm sm:text-base leading-relaxed break-words">
                  {user.bio}
                </p>
              )}

              {/* Social Links */}
              <div className="flex items-center justify-center sm:justify-start space-x-4 mb-4 sm:mb-0">
                {user.socialLinks?.website && (
                  <a
                    href={user.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Globe className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks?.twitter && (
                  <a
                    href={user.socialLinks.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-500 p-2 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Twitter className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks?.linkedin && (
                  <a
                    href={user.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-blue-700 p-2 hover:bg-blue-50 rounded-full transition-colors"
                  >
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
                {user.socialLinks?.github && (
                  <a
                    href={user.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <Github className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
              <Link
                to={`/analytics/${user._id}`}
                className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">My Analytics</span>
                <span className="sm:hidden">Analytics</span>
              </Link>
              <Link
                to="/write"
                className="inline-flex items-center justify-center px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm sm:text-base"
              >
                <FileText className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Write Blog</span>
                <span className="sm:hidden">Write</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Statistics</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg p-4 border border-gray-200"
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
            className="bg-white rounded-lg p-4 border border-gray-200"
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
            className="bg-white rounded-lg p-4 border border-gray-200"
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
            className="bg-white rounded-lg p-4 border border-gray-200"
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

        {/* Published Blogs */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="border-b border-gray-200">
            <div className="px-6 py-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Published Blogs ({stats.publishedBlogs})
              </h3>
            </div>
          </div>

          <div className="p-6">
            {blogsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : blogs.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No published blogs yet
                </h3>
                <p className="text-gray-600">
                  This user hasn't published any blogs yet.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {blogs.map((blog, index) => (
                  <motion.div
                    key={blog._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => navigate(`/blog/${blog.slug}`)}
                    className="border border-gray-200 rounded-lg p-6 transition-all hover:shadow-md cursor-pointer hover:border-gray-300"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
                            {blog.title}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Published
                          </span>
                        </div>

                        <p className="text-gray-600 mb-3 line-clamp-2">
                          {blog.excerpt ||
                            blog.content.substring(0, 150) + "..."}
                        </p>

                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                          <span className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {formatDate(blog.publishedAt || blog.createdAt)}
                            </span>
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

                    <div className="mt-4 pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500 flex items-center">
                        <Eye className="h-3 w-3 mr-1" />
                        Click to view blog
                      </p>
                    </div>
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

export default Profile;
