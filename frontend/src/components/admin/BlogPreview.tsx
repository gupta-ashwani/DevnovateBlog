import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { X, Calendar, User, Eye, Clock, Tag } from "lucide-react";
import { Blog } from "@/types";

interface BlogPreviewProps {
  blog: Blog;
  isOpen: boolean;
  onClose: () => void;
}

const BlogPreview: React.FC<BlogPreviewProps> = ({ blog, isOpen, onClose }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] overflow-y-auto" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50"
              onClick={onClose}
            />

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
              &#8203;
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle bg-white shadow-2xl rounded-2xl z-[10000]"
              style={{ transform: 'translateZ(0)' }}
              onClick={(e) => e.stopPropagation()}
            >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Blog Preview</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Blog Content */}
          <div className="space-y-6">
            {/* Featured Image */}
            {blog.featuredImage && (
              <div className="w-full h-64 rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={blog.featuredImage}
                  alt={blog.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h1 className="text-3xl font-bold text-gray-900 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <User className="h-4 w-4" />
                <span>{blog.author?.fullName || blog.author?.username}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(blog.createdAt)}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Clock className="h-4 w-4" />
                <span>{blog.readingTime || 5} min read</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{blog.metrics?.views || 0} views</span>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Status:</span>
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  blog.status === "approved"
                    ? "bg-green-100 text-green-800"
                    : blog.status === "pending"
                    ? "bg-yellow-100 text-yellow-800"
                    : blog.status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-gray-100 text-gray-800"
                }`}
              >
                {blog.status}
              </span>
            </div>

            {/* Category and Tags */}
            <div className="flex flex-wrap items-center gap-4">
              {blog.category && (
                <div className="flex items-center space-x-1">
                  <Tag className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">
                    {blog.category}
                  </span>
                </div>
              )}
              {blog.tags && blog.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Excerpt */}
            {blog.excerpt && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-2">
                  Excerpt:
                </h3>
                <p className="text-gray-700 italic">{blog.excerpt}</p>
              </div>
            )}

            {/* Content */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Content:
              </h3>
              <div
                className="prose max-w-none text-gray-700 leading-relaxed"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {blog.content.length > 1000
                  ? `${blog.content.substring(0, 1000)}...`
                  : blog.content}
              </div>
              {blog.content.length > 1000 && (
                <p className="text-sm text-gray-500 mt-4 italic">
                  Content truncated for preview. Full content will be visible
                  after approval.
                </p>
              )}
            </div>

            {/* Admin Notes */}
            {blog.adminNotes && (
              <div
                className={`p-4 rounded-lg border ${
                  blog.status === "rejected"
                    ? "bg-red-50 border-red-200"
                    : "bg-blue-50 border-blue-200"
                }`}
              >
                <h3
                  className={`text-sm font-medium mb-2 ${
                    blog.status === "rejected"
                      ? "text-red-900"
                      : "text-blue-900"
                  }`}
                >
                  {blog.status === "rejected"
                    ? "Rejection Reason:"
                    : "Admin Notes:"}
                </h3>
                <p
                  className={`${
                    blog.status === "rejected"
                      ? "text-red-700"
                      : "text-blue-700"
                  }`}
                >
                  {blog.adminNotes}
                </p>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Close Preview
            </button>
            <a
              href={`/blog/${blog.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
            >
              View Full Blog
            </a>
          </div>
        </motion.div>
      </div>
    </div>
      )}
    </AnimatePresence>
  );

  // Use portal to render modal at body level
  return typeof document !== 'undefined' 
    ? createPortal(modalContent, document.body)
    : null;
};

export default BlogPreview;
