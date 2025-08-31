import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Save,
  Send,
  Eye,
  FileText,
  Tag,
  Image,
  ArrowLeft,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { blogService } from "@/services/blog";
import { BlogStatus } from "@/types";
import ImageUpload from "@/components/ImageUpload";
import MarkdownEditor from "@/components/MarkdownEditor";

interface BlogEditorProps {
  mode?: "create" | "edit";
}

const BlogEditor: React.FC<BlogEditorProps> = ({ mode = "create" }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(1);

  const [blogData, setBlogData] = useState({
    title: "",
    content: "",
    excerpt: "",
    tags: [] as string[],
    featuredImage: "",
    status: "draft" as BlogStatus,
  });

  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    if (id) {
      fetchBlog();
    }
  }, [id]);

  useEffect(() => {
    // Calculate word count and reading time
    const words = blogData.content
      .split(/\s+/)
      .filter((word) => word.length > 0).length;
    setWordCount(words);
    setReadingTime(Math.ceil(words / 200) || 1);
  }, [blogData.content]);

  const fetchBlog = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      const response = await blogService.getBlogById(id);
      if (response.status === "success" && response.data) {
        setBlogData(response.data.blog);
      }
    } catch (error: any) {
      console.error("Error fetching blog:", error);
      // Don't show network errors on initial load, only show actual data errors
      if (!error.isNetworkError) {
        toast.error(error.message || "Failed to load blog. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setBlogData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !blogData.tags.includes(tagInput.trim())) {
      setBlogData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setBlogData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const handleSave = async (status: "draft" | "pending") => {
    if (!blogData.title.trim() || !blogData.content.trim()) {
      alert("Please fill in the title and content");
      return;
    }

    try {
      setIsSaving(true);
      const dataToSave = {
        ...blogData,
        status,
        // Remove empty featuredImage to avoid validation issues
        featuredImage: blogData.featuredImage.trim() || undefined,
      };

      let response;
      if (id) {
        response = await blogService.updateBlog(id, dataToSave);
      } else {
        response = await blogService.createBlog(dataToSave);
      }

      if (response.status === "success") {
        if (status === "pending") {
          toast.success("Blog submitted for admin approval!");
          navigate("/profile");
        } else {
          toast.success("Blog saved as draft!");
        }
      }
    } catch (error: any) {
      console.error("Error saving blog:", error);

      // Handle validation errors
      if (error.errors && Array.isArray(error.errors)) {
        const validationMessages = error.errors
          .map((err: any) => err.message)
          .join(", ");
        toast.error(`Validation Error: ${validationMessages}`);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error("Error saving blog. Please try again.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(-1)}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </motion.button>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-semibold text-gray-900 truncate">
                  {id ? "Edit Blog" : "Write New Blog"}
                </h1>
                <div className="hidden sm:flex items-center space-x-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center">
                    <FileText className="h-4 w-4 mr-1" />
                    {wordCount} words
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {readingTime} min read
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSave("draft")}
                disabled={isSaving}
                className="flex items-center px-2 sm:px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 text-xs sm:text-sm"
              >
                <Save className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Save Draft</span>
                <span className="sm:hidden">Save</span>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleSave("pending")}
                disabled={isSaving}
                className="flex items-center px-2 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-xs sm:text-sm"
              >
                <Send className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-2" />
                <span className="hidden sm:inline">Submit for Review</span>
                <span className="sm:hidden">Submit</span>
              </motion.button>
            </div>
          </div>

          {/* Mobile stats */}
          <div className="sm:hidden flex items-center justify-center space-x-4 text-xs text-gray-500 pb-2">
            <span className="flex items-center">
              <FileText className="h-3 w-3 mr-1" />
              {wordCount} words
            </span>
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {readingTime} min read
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
          {/* Main Editor */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
            >
              <input
                type="text"
                placeholder="Enter your blog title..."
                value={blogData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className="w-full text-2xl sm:text-3xl font-bold text-gray-900 placeholder-gray-400 border-none outline-none resize-none"
              />
            </motion.div>

            {/* Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="p-4 sm:p-6 pb-0">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Content
                </h3>
              </div>
              <div className="px-4 sm:px-6 pb-4 sm:pb-6">
                <MarkdownEditor
                  value={blogData.content}
                  onChange={(value) => handleInputChange("content", value)}
                  placeholder="Write your blog content using Markdown..."
                  height={400}
                />
              </div>
            </motion.div>

            {/* Excerpt */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
            >
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Excerpt (Optional)
              </label>
              <textarea
                placeholder="Write a brief summary of your blog..."
                value={blogData.excerpt}
                onChange={(e) => handleInputChange("excerpt", e.target.value)}
                className="w-full h-20 sm:h-24 text-gray-900 placeholder-gray-400 border border-gray-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm sm:text-base"
                maxLength={300}
              />
              <div className="text-right text-sm text-gray-500 mt-2">
                {blogData.excerpt.length}/300
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Status Info */}
            {id && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
              >
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">
                  Status
                </h3>
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      blogData.status === "approved"
                        ? "bg-green-500"
                        : blogData.status === "pending"
                        ? "bg-yellow-500"
                        : blogData.status === "rejected"
                        ? "bg-red-500"
                        : "bg-gray-400"
                    }`}
                  />
                  <span className="text-sm font-medium text-gray-700 capitalize">
                    {blogData.status === "pending"
                      ? "Waiting for Admin Approval"
                      : blogData.status}
                  </span>
                </div>
              </motion.div>
            )}

            {/* Tags */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
            >
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tags
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  placeholder="Add a tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                  className="flex-1 border border-gray-200 rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAddTag}
                  className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Tag className="h-4 w-4" />
                </motion.button>
              </div>
              <div className="flex flex-wrap gap-2">
                {blogData.tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="inline-flex items-center px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="ml-1 sm:ml-2 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </motion.span>
                ))}
              </div>
            </motion.div>

            {/* Featured Image */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6"
            >
              <ImageUpload
                value={blogData.featuredImage}
                onChange={(url) => handleInputChange("featuredImage", url)}
                placeholder="Upload your blog's featured image"
              />
            </motion.div>

            {/* Tips */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-blue-50 rounded-xl border border-blue-200 p-4 sm:p-6"
            >
              <div className="flex items-start space-x-3">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="text-sm font-medium text-blue-900 mb-2">
                    Markdown Writing Tips
                  </h4>
                  <ul className="text-xs sm:text-sm text-blue-800 space-y-1">
                    <li>• Use headers (# ## ###) to structure your content</li>
                    <li>• Add code blocks with ``` for syntax highlighting</li>
                    <li>• Include images with ![alt text](url)</li>
                    <li>• Use **bold** and *italic* for emphasis</li>
                    <li className="hidden sm:list-item">
                      • Create tables for better data presentation
                    </li>
                    <li className="hidden sm:list-item">
                      • Preview your content before submitting
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogEditor;
