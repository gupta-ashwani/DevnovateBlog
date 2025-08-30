import React from "react";
import { motion } from "framer-motion";
import { Eye, Heart, MessageCircle, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

interface PublicBlogsTableProps {
  data: {
    blogs: Array<{
      _id: string;
      title: string;
      slug: string;
      category: string;
      status: string;
      publishedAt: string;
      tags: string[];
      readingTime: number;
      metrics: {
        views: number;
        likes: number;
        comments: number;
        shares: number;
        engagementRate: number;
      };
      createdAt: string;
    }>;
    pagination: {
      currentPage: number;
      totalPages: number;
      totalBlogs?: number;
      hasNextPage: boolean;
      hasPrevPage: boolean;
    };
  };
}

const PublicBlogsTable: React.FC<PublicBlogsTableProps> = ({ data }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getEngagementColor = (rate: number) => {
    if (rate >= 10) return "text-green-600 bg-green-50";
    if (rate >= 5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  if (data.blogs.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Blog Performance
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No published blogs available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Blog Performance
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Showing {data.blogs.length} published blogs
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Blog
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Views
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Likes
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Comments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Engagement
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Published
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {data.blogs.map((blog, index) => (
              <motion.tr
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {blog.title}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {blog.category}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {blog.metrics.views.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {blog.metrics.likes.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900 dark:text-white">
                      {blog.metrics.comments.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getEngagementColor(
                      blog.metrics.engagementRate
                    )}`}
                  >
                    {blog.metrics.engagementRate.toFixed(1)}%
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(blog.publishedAt)}
                </td>
                <td className="px-6 py-4">
                  <Link
                    to={`/blog/${blog.slug}`}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="View blog"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PublicBlogsTable;
