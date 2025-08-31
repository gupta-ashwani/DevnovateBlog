import React from "react";
import { motion } from "framer-motion";
import { Eye, Heart, MessageCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface TopPerformingBlogsProps {
  blogs: Array<{
    _id: string;
    title: string;
    slug: string;
    views: number;
    likes: number;
    comments: number;
    publishedAt: string;
    status: string;
  }>;
}

const TopPerformingBlogs: React.FC<TopPerformingBlogsProps> = ({ blogs }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (blogs.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Performing Blogs
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No blogs available yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Top Performing Blogs
      </h3>
      <div className="space-y-4">
        {blogs.map((blog, index) => (
          <motion.div
            key={blog._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="flex items-center space-x-4 p-4 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">
                {index + 1}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2 mb-1">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {blog.title}
                </h4>
                <span
                  className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                    blog.status
                  )}`}
                >
                  {blog.status}
                </span>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center">
                  <Eye className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
                  <span className="hidden xs:inline">{blog.views}</span>
                  <span className="xs:hidden">
                    {blog.views > 999
                      ? `${Math.floor(blog.views / 1000)}k`
                      : blog.views}
                  </span>
                </span>
                <span className="flex items-center">
                  <Heart className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
                  <span className="hidden xs:inline">{blog.likes}</span>
                  <span className="xs:hidden">
                    {blog.likes > 999
                      ? `${Math.floor(blog.likes / 1000)}k`
                      : blog.likes}
                  </span>
                </span>
                <span className="flex items-center">
                  <MessageCircle className="w-4 h-4 sm:w-3 sm:h-3 mr-1" />
                  <span className="hidden xs:inline">{blog.comments}</span>
                  <span className="xs:hidden">
                    {blog.comments > 999
                      ? `${Math.floor(blog.comments / 1000)}k`
                      : blog.comments}
                  </span>
                </span>
                {blog.publishedAt && (
                  <span>{formatDate(blog.publishedAt)}</span>
                )}
              </div>
            </div>

            {blog.status === "approved" && (
              <Link
                to={`/blog/${blog.slug}`}
                className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-600 transition-colors"
                title="View blog"
              >
                <ExternalLink className="w-4 h-4" />
              </Link>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TopPerformingBlogs;
