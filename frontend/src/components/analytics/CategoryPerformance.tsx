import React from "react";
import { motion } from "framer-motion";
import { BarChart3, TrendingUp, Eye, Heart, MessageCircle } from "lucide-react";

interface CategoryPerformanceProps {
  data: {
    categories: Array<{
      category: string;
      blogCount: number;
      totalViews: number;
      totalLikes: number;
      totalComments: number;
      totalShares: number;
      avgEngagementRate: number;
      topBlog: {
        title: string;
        slug: string;
        views: number;
      };
    }>;
  };
}

const CategoryPerformance: React.FC<CategoryPerformanceProps> = ({ data }) => {
  if (data.categories.length === 0) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Category Performance
        </h3>
        <div className="text-center py-8">
          <p className="text-gray-500">No category data available</p>
        </div>
      </div>
    );
  }

  // Find the maximum values for scaling the bars
  const maxViews = Math.max(...data.categories.map((cat) => cat.totalViews));
  const maxLikes = Math.max(...data.categories.map((cat) => cat.totalLikes));
  const maxComments = Math.max(
    ...data.categories.map((cat) => cat.totalComments)
  );

  const getEngagementColor = (rate: number) => {
    if (rate >= 10) return "text-green-600 bg-green-50";
    if (rate >= 5) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Categories</p>
              <p className="text-xl font-bold text-gray-900">
                {data.categories.length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <Eye className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Views</p>
              <p className="text-xl font-bold text-gray-900">
                {data.categories
                  .reduce((sum, cat) => sum + cat.totalViews, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <Heart className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Likes</p>
              <p className="text-xl font-bold text-gray-900">
                {data.categories
                  .reduce((sum, cat) => sum + cat.totalLikes, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center">
            <MessageCircle className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">
                Total Comments
              </p>
              <p className="text-xl font-bold text-gray-900">
                {data.categories
                  .reduce((sum, cat) => sum + cat.totalComments, 0)
                  .toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Category Performance Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Performance by Category
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Blogs
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Likes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Comments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.categories.map((category, index) => (
                <motion.tr
                  key={category.category}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {category.category}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">
                      {category.blogCount}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">
                        {category.totalViews.toLocaleString()}
                      </div>
                      <div className="ml-2 flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{
                              width: `${
                                maxViews > 0
                                  ? (category.totalViews / maxViews) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">
                        {category.totalLikes.toLocaleString()}
                      </div>
                      <div className="ml-2 flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-red-600 h-2 rounded-full"
                            style={{
                              width: `${
                                maxLikes > 0
                                  ? (category.totalLikes / maxLikes) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="text-sm text-gray-900">
                        {category.totalComments.toLocaleString()}
                      </div>
                      <div className="ml-2 flex-1">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                maxComments > 0
                                  ? (category.totalComments / maxComments) * 100
                                  : 0
                              }%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>{Math.round(category.totalViews / category.blogCount)} views/blog</div>
                      <div>{Math.round(category.totalLikes / category.blogCount)} likes/blog</div>
                      <div>{Math.round(category.totalComments / category.blogCount)} comments/blog</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-medium rounded ${getEngagementColor(
                        category.avgEngagementRate
                      )}`}
                    >
                      {category.avgEngagementRate.toFixed(1)}%
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Best Performing Category */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Best Performing Category
        </h3>
        {data.categories.length > 0 && (
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xl font-bold text-gray-900">
                {data.categories[0].category}
              </h4>
              <p className="text-gray-600">
                {data.categories[0].totalViews.toLocaleString()} total views
                across {data.categories[0].blogCount} blogs
              </p>
            </div>
            <div className="flex items-center">
              <TrendingUp className="h-6 w-6 text-green-600 mr-2" />
              <span className="text-2xl font-bold text-green-600">
                {data.categories[0].avgEngagementRate.toFixed(1)}%
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategoryPerformance;
