import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  TrendingUp,
  Eye,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Download,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import analyticsService from "@/services/analytics";
import { AnalyticsOverview, BlogsAnalytics, CategoryAnalytics } from "@/types";
import AnalyticsOverviewCards from "../components/analytics/AnalyticsOverviewCards";
import TopPerformingBlogs from "../components/analytics/TopPerformingBlogs";
import BlogsPerformanceTable from "../components/analytics/BlogsPerformanceTable";
import CategoryPerformance from "../components/analytics/CategoryPerformance";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

const AnalyticsDashboard: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [blogsAnalytics, setBlogsAnalytics] = useState<BlogsAnalytics | null>(
    null
  );
  const [categoryStats, setCategoryStats] = useState<CategoryAnalytics | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [blogsSortBy, setBlogsSortBy] = useState<
    "views" | "likes" | "comments" | "createdAt"
  >("views");
  const [blogsSortOrder, setBlogsSortOrder] = useState<"asc" | "desc">("desc");

  useEffect(() => {
    if (user) {
      fetchAllAnalytics();
    }
  }, [user]);

  const fetchAllAnalytics = async () => {
    try {
      setIsLoading(true);

      const [overviewData, blogsData, categoryData] = await Promise.all([
        analyticsService.getAnalyticsOverview(),
        analyticsService.getAllBlogsAnalytics({
          page: 1,
          limit: 10,
          sortBy: blogsSortBy,
          sortOrder: blogsSortOrder,
        }),
        analyticsService.getCategoryAnalytics(),
      ]);

      setOverview(overviewData);
      setBlogsAnalytics(blogsData);
      setCategoryStats(categoryData);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      toast.error("Failed to load analytics data");
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchAllAnalytics();
    setIsRefreshing(false);
    toast.success("Analytics data refreshed");
  };

  const exportData = () => {
    if (!overview || !blogsAnalytics) return;

    const exportData = {
      overview: overview.overview,
      topBlogs: overview.topPerformingBlogs,
      recentActivity: overview.recentActivity,
      allBlogs: blogsAnalytics.blogs,
      categories: categoryStats?.categories || [],
      exportedAt: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `analytics-${user?.username}-${
      new Date().toISOString().split("T")[0]
    }.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast.success("Analytics data exported successfully");
  };

  const handleBlogsSortChange = async (
    sortBy: typeof blogsSortBy,
    sortOrder: typeof blogsSortOrder
  ) => {
    setBlogsSortBy(sortBy);
    setBlogsSortOrder(sortOrder);
    try {
      const blogsData = await analyticsService.getAllBlogsAnalytics({
        page: 1,
        limit: 10,
        sortBy,
        sortOrder,
      });
      setBlogsAnalytics(blogsData);
    } catch (error) {
      console.error("Error fetching blogs analytics:", error);
      toast.error("Failed to update blogs data");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            No Analytics Data
          </h2>
          <p className="text-gray-600">
            Start writing blogs to see your analytics!
          </p>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "blogs", label: "Blog Performance", icon: TrendingUp },
    { id: "categories", label: "Categories", icon: Filter },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 mt-2">
                Track your blog performance and engagement metrics
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={refreshData}
                disabled={isRefreshing}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 mr-2 ${
                    isRefreshing ? "animate-spin" : ""
                  }`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={exportData}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? "border-blue-500 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                  >
                    <IconComponent className="w-5 h-5 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "overview" && (
            <div className="space-y-8">
              <AnalyticsOverviewCards overview={overview.overview} />
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <TopPerformingBlogs blogs={overview.topPerformingBlogs} />
                <div className="bg-white rounded-lg p-6 border border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Recent Activity (30 days)
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">New Blogs</span>
                      <span className="font-semibold text-gray-900">
                        {overview.recentActivity.newBlogs}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">New Likes</span>
                      <span className="font-semibold text-gray-900">
                        {overview.recentActivity.newLikes}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">New Comments</span>
                      <span className="font-semibold text-gray-900">
                        {overview.recentActivity.newComments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "blogs" && blogsAnalytics && (
            <BlogsPerformanceTable
              data={blogsAnalytics}
              sortBy={blogsSortBy}
              sortOrder={blogsSortOrder}
              onSortChange={handleBlogsSortChange}
            />
          )}

          {activeTab === "categories" && categoryStats && (
            <CategoryPerformance data={categoryStats} />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
