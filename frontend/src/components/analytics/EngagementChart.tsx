import React from "react";
import { motion } from "framer-motion";
import { Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface EngagementChartProps {
  data: {
    period: number;
    trends: {
      views: Array<{
        _id: { year: number; month: number; day: number };
        totalViews: number;
        count: number;
      }>;
      likes: Array<{
        _id: { year: number; month: number; day: number };
        count: number;
      }>;
      comments: Array<{
        _id: { year: number; month: number; day: number };
        count: number;
      }>;
    };
  };
  period: number;
  onPeriodChange: (period: number) => void;
}

const EngagementChart: React.FC<EngagementChartProps> = ({
  data,
  period,
  onPeriodChange,
}) => {
  const periodOptions = [
    { value: 7, label: "7 days" },
    { value: 30, label: "30 days" },
    { value: 90, label: "90 days" },
  ];

  // Calculate totals for the period
  const totalLikes = data.trends.likes.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const totalComments = data.trends.comments.reduce(
    (sum, item) => sum + item.count,
    0
  );
  const totalViews = data.trends.views.reduce(
    (sum, item) => sum + item.totalViews,
    0
  );

  // Calculate daily averages based on actual data days, not the selected period
  const actualDaysWithLikes = data.trends.likes.length || 1;
  const actualDaysWithComments = data.trends.comments.length || 1;
  const actualDaysWithViews = data.trends.views.length || 1;

  const avgLikesPerDay =
    actualDaysWithLikes > 0 ? Math.round(totalLikes / actualDaysWithLikes) : 0;
  const avgCommentsPerDay =
    actualDaysWithComments > 0
      ? Math.round(totalComments / actualDaysWithComments)
      : 0;
  const avgViewsPerDay =
    actualDaysWithViews > 0 ? Math.round(totalViews / actualDaysWithViews) : 0;

  // Create a simple bar chart visualization
  const maxValue = Math.max(
    Math.max(...data.trends.likes.map((item) => item.count)),
    Math.max(...data.trends.comments.map((item) => item.count))
  );

  const formatDate = (dateObj: {
    year: number;
    month: number;
    day: number;
  }) => {
    return new Date(
      dateObj.year,
      dateObj.month - 1,
      dateObj.day
    ).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  // Combine and normalize data for visualization
  const chartData = data.trends.likes
    .map((likeItem, index) => {
      const commentItem = data.trends.comments.find(
        (c) =>
          c._id.day === likeItem._id.day &&
          c._id.month === likeItem._id.month &&
          c._id.year === likeItem._id.year
      );

      return {
        date: formatDate(likeItem._id),
        likes: likeItem.count,
        comments: commentItem?.count || 0,
        likesHeight: maxValue > 0 ? (likeItem.count / maxValue) * 100 : 0,
        commentsHeight:
          maxValue > 0 ? ((commentItem?.count || 0) / maxValue) * 100 : 0,
      };
    })
    .slice(-14); // Show last 14 data points for readability

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="bg-white rounded-lg p-6 border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Engagement Trends
          </h3>
          <div className="flex space-x-2">
            {periodOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onPeriodChange(option.value)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  period === option.value
                    ? "bg-blue-100 text-blue-700"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <p className="text-sm text-blue-600">Total Views</p>
                <p className="text-xl font-bold text-blue-900">
                  {totalViews.toLocaleString()}
                </p>
                <p className="text-xs text-blue-600">
                  {avgViewsPerDay}/day avg
                </p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-red-600 mr-2" />
              <div>
                <p className="text-sm text-red-600">Total Likes</p>
                <p className="text-xl font-bold text-red-900">
                  {totalLikes.toLocaleString()}
                </p>
                <p className="text-xs text-red-600">{avgLikesPerDay}/day avg</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              <div>
                <p className="text-sm text-green-600">Total Comments</p>
                <p className="text-xl font-bold text-green-900">
                  {totalComments.toLocaleString()}
                </p>
                <p className="text-xs text-green-600">
                  {avgCommentsPerDay}/day avg
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Bar Chart */}
        {chartData.length > 0 ? (
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-4">
              Daily Engagement (Last 14 days)
            </h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-red-500 rounded mr-2"></div>
                  <span>Likes</span>
                </div>
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded mr-2"></div>
                  <span>Comments</span>
                </div>
              </div>

              <div className="relative h-64 border-l border-b border-gray-200">
                <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
                  <span>{maxValue}</span>
                  <span>{Math.round(maxValue * 0.75)}</span>
                  <span>{Math.round(maxValue * 0.5)}</span>
                  <span>{Math.round(maxValue * 0.25)}</span>
                  <span>0</span>
                </div>

                <div className="ml-8 h-full flex items-end space-x-2">
                  {chartData.map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="flex-1 flex flex-col items-center space-y-1"
                    >
                      <div
                        className="w-full flex space-x-1 items-end"
                        style={{ height: "200px" }}
                      >
                        <div
                          className="bg-red-500 rounded-t"
                          style={{
                            height: `${item.likesHeight}%`,
                            width: "45%",
                            minHeight: item.likes > 0 ? "2px" : "0",
                          }}
                          title={`${item.likes} likes`}
                        />
                        <div
                          className="bg-green-500 rounded-t"
                          style={{
                            height: `${item.commentsHeight}%`,
                            width: "45%",
                            minHeight: item.comments > 0 ? "2px" : "0",
                          }}
                          title={`${item.comments} comments`}
                        />
                      </div>
                      <span className="text-xs text-gray-600 transform rotate-45 origin-left whitespace-nowrap">
                        {item.date}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              No engagement data available for this period
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default EngagementChart;
