import React from "react";
import { motion } from "framer-motion";
import {
  TrendingUp,
  BookOpen,
  Eye,
  Heart,
  MessageCircle,
  ExternalLink,
} from "lucide-react";
import { Link } from "react-router-dom";

interface PublicCategoryPerformanceProps {
  data: {
    categories: Array<{
      category: string;
      blogCount: number;
      totalViews: number;
      totalLikes: number;
      totalComments: number;
      totalShares: number;
      avgViews: number;
      avgLikes: number;
      avgComments: number;
      engagementRate: number;
    }>;
  };
}

const PublicCategoryPerformance: React.FC<PublicCategoryPerformanceProps> = ({
  data,
}) => {
  const getEngagementColor = (rate: number) => {
    if (rate >= 10) return "text-green-600";
    if (rate >= 5) return "text-yellow-600";
    return "text-red-600";
  };

  const getCategoryIcon = (category: string) => {
    // You can add specific icons for different categories
    return <BookOpen className="w-5 h-5" />;
  };

  if (data.categories.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Category Performance
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500 dark:text-gray-400">
            No category data available
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Category Performance
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Performance metrics across {data.categories.length} categories
        </p>
      </div>

      <div className="p-6">
        <div className="grid gap-6">
          {data.categories.map((category, index) => (
            <motion.div
              key={category.category}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                    {getCategoryIcon(category.category)}
                  </div>
                  <div>
                    <h4 className="text-lg font-medium text-gray-900 dark:text-white">
                      {category.category}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {category.blogCount} blog
                      {category.blogCount !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-medium ${getEngagementColor(
                      category.engagementRate
                    )}`}
                  >
                    {category.engagementRate.toFixed(1)}% avg engagement
                  </div>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Eye className="w-4 h-4 text-gray-400 mr-1" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.totalViews.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Views
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <Heart className="w-4 h-4 text-gray-400 mr-1" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.totalLikes.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Likes
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <MessageCircle className="w-4 h-4 text-gray-400 mr-1" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.totalComments.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Comments
                  </div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-1">
                    <TrendingUp className="w-4 h-4 text-gray-400 mr-1" />
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {category.totalShares.toLocaleString()}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    Shares
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PublicCategoryPerformance;
