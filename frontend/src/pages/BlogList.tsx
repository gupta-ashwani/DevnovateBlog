import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Calendar, User, Eye, MessageCircle } from "lucide-react";
import { blogService } from "@/services/blog";
import { Blog } from "@/types";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const BlogList: React.FC = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("search");

  useEffect(() => {
    fetchBlogs();
  }, [searchQuery]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const filters = searchQuery ? { search: searchQuery } : {};
      const response = await blogService.getBlogs(filters);
      // Only show approved blogs to public
      const approvedBlogs = response.blogs.filter(
        (blog: Blog) => blog.status === "approved"
      );
      setBlogs(approvedBlogs);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setError("Failed to load blogs");
    } finally {
      setIsLoading(false);
    }
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
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Oops! Something went wrong
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchBlogs}
            className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {searchQuery
              ? `Search Results for "${searchQuery}"`
              : "Latest Blogs"}
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {searchQuery
              ? `Found ${blogs.length} blog${
                  blogs.length !== 1 ? "s" : ""
                } matching your search`
              : "Discover insights, tutorials, and blogs from our community of developers and creators."}
          </p>
        </motion.div>

        {/* Blog Grid */}
        {blogs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12"
          >
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              No blogs yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to share your knowledge with the community!
            </p>
            <Link
              to="/write"
              className="bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Write Your Blog
            </Link>
          </motion.div>
        ) : (
          <div className="space-y-8">
            {blogs.map((blog, index) => (
              <motion.article
                key={blog._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="p-8">
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                      {blog.author?.firstName?.charAt(0).toUpperCase() ||
                        blog.author?.username?.charAt(0).toUpperCase() ||
                        "A"}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {blog.author?.fullName ||
                          blog.author?.username ||
                          "Anonymous"}
                      </h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDate(blog.createdAt)}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{blog.metrics?.views || 0} views</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <Link to={`/blog/${blog.slug}`} className="block group">
                    <h2 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                      {blog.title}
                    </h2>
                    <p className="text-gray-600 leading-relaxed mb-4 line-clamp-3">
                      {blog.excerpt || blog.content.substring(0, 200) + "..."}
                    </p>
                  </Link>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {blog.tags?.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                      {blog.tags && blog.tags.length > 3 && (
                        <span className="text-gray-500 text-sm">
                          +{blog.tags.length - 3} more
                        </span>
                      )}
                    </div>

                    <Link
                      to={`/blog/${blog.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center space-x-1 group"
                    >
                      <span>Read more</span>
                      <svg
                        className="h-4 w-4 group-hover:translate-x-1 transition-transform"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BlogList;
