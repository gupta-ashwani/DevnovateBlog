import React, { useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Link } from "react-router-dom";
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Users,
  BookOpen,
  Star,
} from "lucide-react";

const Home: React.FC = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, -50]);
  const y2 = useTransform(scrollY, [0, 300], [0, -100]);

  const [featuredBlogs] = useState([
    {
      id: 1,
      title: "The Future of Web Development: What's Coming in 2025",
      excerpt:
        "Explore the latest trends, frameworks, and technologies that will shape web development in the coming year.",
      author: { name: "Sarah Chen", avatar: "/api/placeholder/40/40" },
      readTime: "8 min read",
      publishedAt: "2 days ago",
      tags: ["Web Development", "Future Tech"],
      image: "/api/placeholder/600/400",
    },
    {
      id: 2,
      title: "Building Scalable Applications with Modern Architecture",
      excerpt:
        "Learn how to design and implement applications that can grow with your business needs using proven architectural patterns.",
      author: { name: "Alex Johnson", avatar: "/api/placeholder/40/40" },
      readTime: "12 min read",
      publishedAt: "1 week ago",
      tags: ["Architecture", "Scalability"],
      image: "/api/placeholder/600/400",
    },
    {
      id: 3,
      title: "AI and Machine Learning: Practical Applications",
      excerpt:
        "Discover real-world applications of AI and ML that are transforming industries and creating new opportunities.",
      author: { name: "Maria Rodriguez", avatar: "/api/placeholder/40/40" },
      readTime: "10 min read",
      publishedAt: "3 days ago",
      tags: ["AI", "Machine Learning"],
      image: "/api/placeholder/600/400",
    },
  ]);

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-gray-100">
        <div className="absolute inset-0">
          <motion.div
            style={{ y: y1 }}
            className="absolute top-20 right-20 w-72 h-72 bg-blue-50 rounded-full blur-3xl opacity-70"
          />
          <motion.div
            style={{ y: y2 }}
            className="absolute bottom-20 left-20 w-96 h-96 bg-purple-50 rounded-full blur-3xl opacity-70"
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Blogs worth
              <br />
              <span className="text-blue-600">reading</span>
            </motion.h1>

            <motion.p
              className="mt-8 text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Discover blogs, thinking, and expertise from writers on any topic.
              Share your ideas with the world.
            </motion.p>

            <motion.div
              className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link
                to="/register"
                className="inline-flex items-center px-8 py-3 bg-gray-900 text-white font-medium rounded-full hover:bg-gray-800 transition-colors group"
              >
                Start writing
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-8 py-3 text-gray-900 font-medium rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Sign in
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="grid grid-cols-1 md:grid-cols-4 gap-8"
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
                <div className="inline-flex items-center justify-center w-12 h-12 bg-white rounded-lg shadow-sm mb-4">
                  <stat.icon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {stat.value}
                </div>
                <div className="text-gray-600 mt-1">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Featured Blogs */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Featured Blogs
            </h2>
            <p className="text-xl text-gray-600">
              Discover the most engaging content from our community
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {featuredBlogs.map((blog, index) => (
              <motion.article
                key={blog.id}
                className="group cursor-pointer"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
              >
                <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:border-gray-200 transition-all duration-300">
                  <div className="aspect-video bg-gray-100 overflow-hidden">
                    <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                      <div className="text-gray-400 text-sm">
                        Featured Image
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      {blog.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {blog.excerpt}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {blog.author.name}
                          </div>
                          <div className="text-gray-500 text-xs">
                            {blog.publishedAt}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <Clock className="w-4 h-4" />
                        {blog.readTime}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gray-900 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold mb-6">
              Ready to share your blog?
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Join thousands of writers who are sharing their knowledge,
              experiences, and insights with the world.
            </p>
            <Link
              to="/register"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-900 font-semibold rounded-full hover:bg-gray-100 transition-colors group"
            >
              Get started for free
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default Home;
