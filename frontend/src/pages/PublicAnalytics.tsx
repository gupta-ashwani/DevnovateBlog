import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BarChart3,
  ArrowLeft,
  User,
  Calendar,
  TrendingUp,
  MessageCircle,
  Heart,
  Eye,
} from "lucide-react";
import analyticsService from "../services/analytics";
import { userService } from "../services/user";
import { AnalyticsOverview, BlogsAnalytics, CategoryAnalytics } from "../types";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import AnalyticsOverviewCards from "../components/analytics/AnalyticsOverviewCards";
import TopPerformingBlogs from "../components/analytics/TopPerformingBlogs";
import PublicBlogsTable from "../components/analytics/PublicBlogsTable";
import PublicCategoryPerformance from "../components/analytics/PublicCategoryPerformance";

const PublicAnalytics: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [blogsAnalytics, setBlogsAnalytics] = useState<BlogsAnalytics | null>(
    null
  );
  const [categoryAnalytics, setCategoryAnalytics] =
    useState<CategoryAnalytics | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<
    "overview" | "blogs" | "categories"
  >("overview");

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!userId) {
        setError("User ID is required");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);

        // Fetch user profile
        const profile = await userService.getUserProfile(userId);
        setUserProfile(profile);

        // Fetch analytics data in parallel
        const [overviewData, blogsData, categoryData] = await Promise.all([
          analyticsService.getPublicUserAnalytics(userId),
          analyticsService.getPublicUserBlogsAnalytics(userId, {
            page: 1,
            limit: 10,
            sortBy: "views",
            sortOrder: "desc",
          }),
          analyticsService.getPublicUserCategoryAnalytics(userId),
        ]);

        setOverview(overviewData);
        setBlogsAnalytics(blogsData);
        setCategoryAnalytics(categoryData);
      } catch (err: any) {
        console.error("Error fetching public analytics:", err);
        setError(
          err.response?.data?.message || "Failed to load analytics data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId]);

  const handleTabChange = (tab: "overview" | "blogs" | "categories") => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Error Loading Analytics
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
          <div className="h-6 w-px bg-gray-300 dark:bg-gray-600" />
          <BarChart3 className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Public Analytics
            </h1>
            {userProfile && (
              <div className="flex items-center gap-2 mt-2">
                <User className="w-4 h-4 text-gray-500" />
                <span className="text-gray-600 dark:text-gray-400">
                  {userProfile.name}'s Blog Performance
                </span>
              </div>
            )}
          </div>
        </div>

        {/* User Info Card */}
        {userProfile && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {userProfile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {userProfile.name}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">
                  {userProfile.email}
                </p>
                <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>
                      Joined{" "}
                      {new Date(userProfile.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  {overview && (
                    <>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>{overview.totalBlogs} blogs</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span>{overview.totalViews} views</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg mb-8">
        {[
          { key: "overview", label: "Overview", icon: TrendingUp },
          { key: "blogs", label: "Blog Performance", icon: BarChart3 },
          { key: "categories", label: "Categories", icon: User },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => handleTabChange(key as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === key
                ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                : "text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === "overview" && overview && (
          <div className="space-y-8">
            <AnalyticsOverviewCards overview={overview} />
            {blogsAnalytics && (
              <TopPerformingBlogs blogs={blogsAnalytics.blogs.slice(0, 5)} />
            )}
          </div>
        )}

        {activeTab === "blogs" && blogsAnalytics && (
          <PublicBlogsTable data={blogsAnalytics} />
        )}

        {activeTab === "categories" && categoryAnalytics && (
          <PublicCategoryPerformance data={categoryAnalytics} />
        )}
      </motion.div>

      {/* Empty State */}
      {overview && overview.totalBlogs === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Blog Data Available
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {userProfile?.name} hasn't published any blogs yet.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default PublicAnalytics;
