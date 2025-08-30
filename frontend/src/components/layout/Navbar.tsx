import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, PenTool, LogOut, User, Bell, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { blogService } from "@/services/blog";
import { Blog } from "@/types";

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Blog[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const handleSearch = async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await blogService.getBlogs({ search: query, limit: 5 });
      setSearchResults(response.blogs || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);

    // Debounce search
    const timeoutId = setTimeout(() => {
      handleSearch(query);
    }, 300);

    return () => clearTimeout(timeoutId);
  };

  const handleSearchResultClick = (blog: Blog) => {
    navigate(`/blog/${blog._id}`);
    setIsSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  // Close search when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/blogs", label: "Blogs" },
    { href: "/write", label: "Write", auth: true },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-40 backdrop-blur-sm bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section: Logo + Navigation */}
          <div className="flex items-center space-x-8">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center"
            >
              <Link to="/" className="flex items-center space-x-3">
                <div className="relative">
                  <PenTool className="h-8 w-8 text-gray-900" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
                </div>
                <span className="text-2xl font-bold text-gray-900 tracking-tight">
                  Devnovate
                </span>
              </Link>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navLinks.map((link) => {
                if (link.auth && !isAuthenticated) return null;
                // Hide Write link for admin users
                if (link.href === "/write" && user?.role === "admin") return null;
                return (
                  <Link
                    key={link.href}
                    to={link.href}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 relative ${
                      isActive(link.href)
                        ? "text-gray-900 bg-gray-100"
                        : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                    }`}
                  >
                    {link.label}
                    {isActive(link.href) && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gray-100 rounded-full -z-10"
                        transition={{ type: "spring", duration: 0.5 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Center Section: Search Box */}
          <div className="flex-1 max-w-md mx-8 hidden md:block">
            <div className="relative" ref={searchRef}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search blogs..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setIsSearchOpen(true)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:bg-white transition-all duration-200"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>

              <AnimatePresence>
                {isSearchOpen && searchQuery && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden z-50"
                  >
                    {isSearching ? (
                      <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
                        <p className="mt-2 text-sm">Searching...</p>
                      </div>
                    ) : searchResults.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto">
                        {searchResults.map((blog) => (
                          <motion.button
                            key={blog._id}
                            onClick={() => handleSearchResultClick(blog)}
                            className="w-full p-4 text-left hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-b-0"
                            whileHover={{ backgroundColor: "#f9fafb" }}
                          >
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                {blog.featuredImage ? (
                                  <img
                                    src={blog.featuredImage}
                                    alt={blog.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100"></div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                                  {blog.title}
                                </h4>
                                <p className="text-gray-600 text-xs mt-1 line-clamp-2">
                                  {blog.excerpt}
                                </p>
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <span>{blog.author?.fullName}</span>
                                  <span className="mx-1">•</span>
                                  <span>{blog.readingTime || 5} min read</span>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        <p className="text-sm">No blogs found</p>
                        <p className="text-xs mt-1">Try different keywords</p>
                      </div>
                    )}

                    <div className="p-3 bg-gray-50 border-t border-gray-100">
                      <Link
                        to={`/blogs?search=${encodeURIComponent(searchQuery)}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                          setSearchResults([]);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        See all results for "{searchQuery}"
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Section: User Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile search button */}
            <button
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Search className="h-5 w-5" />
            </button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {user?.role === "admin" ? (
                  // Admin gets clickable "Admin Dashboard" text with avatar
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-white text-sm font-semibold">
                          {user?.fullName?.charAt(0).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <Link
                      to="/admin"
                      className="text-gray-700 font-medium hover:text-gray-900 transition-colors"
                    >
                      Admin Dashboard
                    </Link>
                  </div>
                ) : (
                  // Regular users get profile link with avatar - goes to dashboard
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                        {user?.avatar ? (
                          <img
                            src={user.avatar}
                            alt={user.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-white text-sm font-semibold">
                            {user?.fullName?.charAt(0).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="hidden sm:block font-medium">
                        {user?.fullName}
                      </span>
                    </Link>
                  </>
                )}

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" />
                </motion.button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/register"
                  className="bg-gray-900 text-white px-4 py-2 rounded-full hover:bg-gray-800 transition-colors font-medium"
                >
                  Sign up
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
            >
              {isOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </motion.button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="md:hidden border-t border-gray-200 overflow-hidden"
            >
              <div className="py-4 space-y-2">
                {navLinks.map((link) => {
                  if (link.auth && !isAuthenticated) return null;
                  // Hide Write link for admin users
                  if (link.href === "/write" && user?.role === "admin") return null;
                  return (
                    <Link
                      key={link.href}
                      to={link.href}
                      onClick={() => setIsOpen(false)}
                      className={`block px-4 py-2 rounded-lg text-base font-medium transition-colors ${
                        isActive(link.href)
                          ? "text-gray-900 bg-gray-100"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}

                {/* Mobile search input */}
                <div className="px-4 py-2">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search blogs..."
                      value={searchQuery}
                      onChange={handleSearchInputChange}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  </div>
                </div>

                {/* Mobile user actions */}
                {isAuthenticated ? (
                  <div className="px-4 py-2 border-t border-gray-200 mt-4 pt-4">
                    {user?.role === "admin" ? (
                      // Admin mobile view
                      <div className="mb-4">
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {user?.fullName?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">Admin Dashboard</p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Link
                            to="/admin"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <Bell className="h-4 w-4" />
                            <span>Admin Panel</span>
                          </Link>

                          <Link
                            to="/admin/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span>Edit Profile</span>
                          </Link>

                          <button
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                            className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Regular user mobile view
                      <>
                        <div className="flex items-center space-x-3 mb-4">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                            {user?.avatar ? (
                              <img
                                src={user.avatar}
                                alt={user.fullName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold">
                                {user?.fullName?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {user?.fullName}
                            </p>
                            <p className="text-sm text-gray-500">{user?.email}</p>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Link
                            to="/profile"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span>View Profile</span>
                          </Link>

                          <Link
                            to="/profile/edit"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center space-x-3 px-3 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                          >
                            <User className="h-4 w-4" />
                            <span>Edit Profile</span>
                          </Link>

                          <button
                            onClick={() => {
                              handleLogout();
                              setIsOpen(false);
                            }}
                            className="flex items-center space-x-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors w-full text-left"
                          >
                            <LogOut className="h-4 w-4" />
                            <span>Sign out</span>
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="px-4 py-2 border-t border-gray-200 mt-4 pt-4 space-y-2">
                    <Link
                      to="/login"
                      onClick={() => setIsOpen(false)}
                      className="block text-center py-2 text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsOpen(false)}
                      className="block text-center bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition-colors font-medium"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navbar;
