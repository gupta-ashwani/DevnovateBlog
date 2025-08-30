import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  PenTool,
  Instagram,
  Github,
  Linkedin,
  Mail,
  ArrowUp,
} from "lucide-react";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="py-16"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {/* Company Info */}
            <motion.div variants={itemVariants} className="lg:col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <PenTool className="h-8 w-8 text-gray-900" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full" />
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  Devnovate
                </span>
              </div>
              <p className="text-gray-600 text-lg leading-relaxed mb-6 max-w-md">
                Empowering developers with cutting-edge insights, tutorials, and
                industry knowledge. Join our community of passionate creators
                building the future.
              </p>
              <div className="flex items-center space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://www.instagram.com/i.ashwani.gupta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-pink-600 hover:bg-pink-50 rounded-full transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://github.com/gupta-ashwani"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Github className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://www.linkedin.com/in/sukriti-saraswati-258451273/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  href="mailto:devnovateblog@gmail.com"
                  className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-full transition-colors"
                >
                  <Mail className="w-5 h-5" />
                </motion.a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Explore
              </h3>
              <ul className="space-y-4">
                {[
                  { label: "Blogs", href: "/blogs" },
                  { label: "Write", href: "/write" },
                  { label: "Community", href: "/community" },
                  { label: "About", href: "/about" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Resources */}
            <motion.div variants={itemVariants}>
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Resources
              </h3>
              <ul className="space-y-4">
                {[
                  { label: "Help Center", href: "/help" },
                  { label: "Guidelines", href: "/guidelines" },
                  { label: "API", href: "/api" },
                  { label: "Status", href: "/status" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <div className="py-8 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">
              © {currentYear} Devnovate. All rights reserved.
            </p>

            <div className="flex items-center gap-6">
              <div className="flex items-center space-x-6">
                <Link
                  to="/privacy"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Terms
                </Link>
                <Link
                  to="/cookies"
                  className="text-gray-600 hover:text-gray-900 text-sm transition-colors"
                >
                  Cookies
                </Link>
              </div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={scrollToTop}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowUp className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
