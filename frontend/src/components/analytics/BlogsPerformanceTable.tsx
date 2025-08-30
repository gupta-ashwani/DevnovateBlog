import React from "react";
import { motion } from "framer-motion";
import {
  ArrowUpDown,
  Eye,
  Heart,
  MessageCircle,
  ExternalLink,
  Edit,
} from "lucide-react";
import { Link } from "react-router-dom";

interface BlogsPerformanceTableProps {
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
  sortBy: "views" | "likes" | "comments" | "createdAt";
  sortOrder: "asc" | "desc";
  onSortChange: (
    sortBy: "views" | "likes" | "comments" | "createdAt",
    sortOrder: "asc" | "desc"
  ) => void;
}

const BlogsPerformanceTable: React.FC<BlogsPerformanceTableProps> = ({
  data,
  sortBy,
  sortOrder,
  onSortChange,
}) => {
  const getEngagementColor = (rate: number) => {
    if (rate >= 10) return "text-green-600 bg-green-50";
    if (rate >= 5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleSort = (field: typeof sortBy) => {
    const newOrder = sortBy === field && sortOrder === "desc" ? "asc" : "desc";
    onSortChange(field, newOrder);
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field)
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    return (
      <ArrowUpDown
        className={`w-4 h-4 ${
          sortOrder === "desc" ? "text-blue-600 rotate-180" : "text-blue-600"
        }`}
      />
    );
  };

  if (data.blogs.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Blog Performance
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No blogs available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          Blog Performance
        </h3>
        <p className="text-sm text-gray-600">
          Showing {data.blogs.length} of {data.pagination.totalBlogs} blogs
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blog
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("views")}
              >
                <div className="flex items-center space-x-1">
                  <span>Views</span>
                  {getSortIcon("views")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("likes")}
              >
                <div className="flex items-center space-x-1">
                  <span>Likes</span>
                  {getSortIcon("likes")}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("comments")}
              >
                <div className="flex items-center space-x-1">
                  <span>Comments</span>
                  {getSortIcon("comments")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Engagement
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("createdAt")}
              >
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  {getSortIcon("createdAt")}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.blogs.map((blog, index) => (
              <motion.tr
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="hover:bg-gray-50"
              >
                <td className="px-6 py-4">
                  <div className="max-w-xs">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {blog.title}
                    </div>
                    <div className="text-sm text-gray-500">
                      {blog.category}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">
                      {blog.metrics.views.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <Heart className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">
                      {blog.metrics.likes.toLocaleString()}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <MessageCircle className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-sm text-gray-900">
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
                <td className="px-6 py-4 text-sm text-gray-500">
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

      {/* Pagination info */}
      {data.pagination.totalPages > 1 && (
        <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {data.pagination.currentPage} of {data.pagination.totalPages}
            </div>
            <div className="text-sm text-gray-500">
              {data.pagination.totalBlogs} total blogs
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogsPerformanceTable;
