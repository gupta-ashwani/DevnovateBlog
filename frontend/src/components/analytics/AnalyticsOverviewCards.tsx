import React from "react";
import { motion } from "framer-motion";
import {
  Eye,
  Heart,
  MessageCircle,
  Share2,
  FileText,
  Clock,
} from "lucide-react";

interface AnalyticsOverviewCardsProps {
  overview: {
    totalBlogs: number;
    totalViews: number;
    totalLikes: number;
    totalComments: number;
    totalShares: number;
    publishedBlogs: number;
    draftBlogs: number;
    pendingBlogs: number;
    rejectedBlogs: number;
  };
}

const AnalyticsOverviewCards: React.FC<AnalyticsOverviewCardsProps> = ({
  overview,
}) => {
  const cards = [
    {
      title: "Total Views",
      value: overview.totalViews.toLocaleString(),
      icon: Eye,
      color: "blue",
    },
    {
      title: "Total Likes",
      value: overview.totalLikes.toLocaleString(),
      icon: Heart,
      color: "red",
    },
    {
      title: "Total Comments",
      value: overview.totalComments.toLocaleString(),
      icon: MessageCircle,
      color: "green",
    },
    {
      title: "Total Shares",
      value: overview.totalShares.toLocaleString(),
      icon: Share2,
      color: "purple",
    },
    {
      title: "Published Blogs",
      value: overview.publishedBlogs.toString(),
      icon: FileText,
      color: "indigo",
      subtitle: `${overview.draftBlogs} drafts, ${overview.pendingBlogs} pending`,
    },
    {
      title: "Total Blogs",
      value: overview.totalBlogs.toString(),
      icon: Clock,
      color: "gray",
      subtitle: `${overview.rejectedBlogs} rejected`,
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: "bg-blue-500 text-blue-600 bg-blue-50",
      red: "bg-red-500 text-red-600 bg-red-50",
      green: "bg-green-500 text-green-600 bg-green-50",
      purple: "bg-purple-500 text-purple-600 bg-purple-50",
      indigo: "bg-indigo-500 text-indigo-600 bg-indigo-50",
      gray: "bg-gray-500 text-gray-600 bg-gray-50",
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.gray;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        const colors = getColorClasses(card.color).split(" ");
        const iconBg = colors[0];
        const textColor = colors[1];
        const cardBg = colors[2];

        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-white rounded-lg p-6 border border-gray-200 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${cardBg}`}>
                <IconComponent className={`h-6 w-6 ${textColor}`} />
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-600">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                {card.subtitle && (
                  <p className="text-sm text-gray-500">{card.subtitle}</p>
                )}
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default AnalyticsOverviewCards;
