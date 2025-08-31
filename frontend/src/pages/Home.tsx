import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  Star,
  Eye,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { blogService } from "@/services/blog";
import { Blog } from "@/types";

const Home: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [trendingBlogs, setTrendingBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTrendingBlogs = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching trending blogs...");
        const blogs = await blogService.getLatestBlogs(6);
        console.log("Fetched blogs:", blogs);
        // Sort blogs by views in descending order
        const sortedBlogs = (blogs || []).sort(
          (a, b) => b.metrics.views - a.metrics.views
        );
        setTrendingBlogs(sortedBlogs);
      } catch (error) {
        console.error("Error fetching trending blogs:", error);
        setTrendingBlogs([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrendingBlogs();
  }, []);

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate("/write");
    } else {
      navigate("/register");
    }
  };

  const handleBlogClick = (blog: Blog) => {
    if (blog.slug) {
      navigate(`/blog/${blog.slug}`);
    } else {
      console.error("Blog slug not available");
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Only show when not authenticated */}
      {!isAuthenticated && (
        <section className="relative overflow-hidden bg-white border-b border-gray-100">
          <div className="absolute inset-0">
            <motion.div
              style={{ y: y1 }}
              className="absolute top-10 sm:top-20 right-4 sm:right-20 w-48 h-48 sm:w-72 sm:h-72 bg-blue-50 rounded-full blur-3xl opacity-70"
            />
            <motion.div
              style={{ y: y2 }}
              className="absolute bottom-10 sm:bottom-20 left-4 sm:left-20 w-64 h-64 sm:w-96 sm:h-96 bg-purple-50 rounded-full blur-3xl opacity-70"
            />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 sm:pt-20 pb-16 sm:pb-24">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center max-w-4xl mx-auto"
            >
              <motion.h1
                className="text-3xl sm:text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Blogs worth
                <br />
                <span className="text-blue-600">reading</span>
              </motion.h1>

              <motion.p
                className="mt-6 sm:mt-8 text-base sm:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Discover blogs, thinking, and expertise from writers on any
                topic. Share your ideas with the world.
              </motion.p>

              <motion.div
                className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors group text-sm sm:text-base"
                >
                  Start writing
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-6 sm:px-8 py-3 text-gray-900 font-medium rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors text-sm sm:text-base"
                >
                  Sign in
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* Trending Blogs */}
      <section
        className={`py-12 sm:py-20 bg-white ${
          !isAuthenticated ? "" : "pt-20 sm:pt-32"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Trending Blogs
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 px-4">
              Discover the most engaging content from our community
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 aspect-video rounded-2xl mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : trendingBlogs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {trendingBlogs.map((blog, index) => (
                <motion.article
                  key={blog._id}
                  className="group cursor-pointer h-full"
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -8 }}
                  onClick={() => handleBlogClick(blog)}
                >
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300 h-full flex flex-col">
                    <div className="aspect-video bg-gray-100 overflow-hidden flex-shrink-0">
                      {blog.featuredImage ? (
                        <img
                          src={blog.featuredImage}
                          alt={blog.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <div className="text-gray-400 text-sm">
                            Featured Image
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="p-4 sm:p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {blog.tags &&
                          blog.tags.length > 0 &&
                          blog.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="px-2 sm:px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                      </div>

                      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2 min-h-[3.5rem]">
                        {blog.title || "Untitled"}
                      </h3>

                      <p className="text-sm sm:text-base text-gray-600 mb-4 line-clamp-3 flex-grow min-h-[4.5rem]">
                        {blog.excerpt || "No excerpt available"}
                      </p>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                          <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gray-200 rounded-full overflow-hidden flex-shrink-0">
                            {blog.author?.avatar ? (
                              <img
                                src={blog.author.avatar}
                                alt={blog.author.fullName || "Author"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-gray-300"></div>
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium text-gray-900 text-xs sm:text-sm truncate">
                              {blog.author?.fullName || "Anonymous"}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {blog.publishedAt
                                ? new Date(
                                    blog.publishedAt
                                  ).toLocaleDateString()
                                : "Draft"}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                          <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">
                              {blog.metrics?.views || 0}
                            </span>
                            <span className="sm:hidden">
                              {blog.metrics?.views || 0}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500 text-xs sm:text-sm">
                            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span className="hidden sm:inline">
                              {blog.readingTime ||
                                (blog.content
                                  ? Math.ceil(
                                      blog.content.split(" ").length / 200
                                    )
                                  : 5)}{" "}
                              min read
                            </span>
                            <span className="sm:hidden">
                              {blog.readingTime ||
                                (blog.content
                                  ? Math.ceil(
                                      blog.content.split(" ").length / 200
                                    )
                                  : 5)}
                              m
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.article>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-base sm:text-lg">
                No trending blogs available at the moment.
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Check back later for fresh content!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {[
              { icon: Users, value: "10K+", label: "Active Writers" },
              { icon: BookOpen, value: "50K+", label: "Blogs Published" },
              { icon: TrendingUp, value: "1M+", label: "Monthly Readers" },
              { icon: Star, value: "4.9", label: "Community Rating" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-lg shadow-sm mb-3 sm:mb-4">
                  <stat.icon className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-1 text-sm sm:text-base">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 sm:mb-6">
              Ready to share your blog?
            </h2>
            <p className="text-base sm:text-xl text-gray-300 mb-6 sm:mb-8 leading-relaxed px-4">
              Join thousands of writers who are sharing their knowledge,
              experiences, and insights with the world.
            </p>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors group text-sm sm:text-base"
            >
              Get started for free
              <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
