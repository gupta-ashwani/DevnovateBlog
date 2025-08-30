import { apiRequest } from "./api";
import {
  AnalyticsOverview,
  BlogAnalytics,
  BlogsAnalytics,
  CategoryAnalytics,
} from "../types";

const analyticsService = {
  // Get user's analytics overview
  getAnalyticsOverview: (): Promise<AnalyticsOverview> =>
    apiRequest
      .get<AnalyticsOverview>("/analytics/overview")
      .then((res) => res.data!),

  // Get detailed analytics for a specific blog
  getBlogAnalytics: (blogId: string): Promise<BlogAnalytics> =>
    apiRequest
      .get<BlogAnalytics>(`/analytics/blog/${blogId}`)
      .then((res) => res.data!),

  // Get analytics for all user's blogs
  getAllBlogsAnalytics: (params?: {
    page?: number;
    limit?: number;
    sortBy?: "views" | "likes" | "comments" | "createdAt";
    sortOrder?: "asc" | "desc";
  }): Promise<BlogsAnalytics> =>
    apiRequest
      .get<BlogsAnalytics>("/analytics/blogs", params)
      .then((res) => res.data!),

  // Get category performance analytics
  getCategoryAnalytics: (): Promise<CategoryAnalytics> =>
    apiRequest
      .get<CategoryAnalytics>("/analytics/categories")
      .then((res) => res.data!),

  // Public analytics functions (no authentication required)

  // Get public analytics overview for any user
  getPublicUserAnalytics: (userId: string): Promise<AnalyticsOverview> =>
    apiRequest
      .get<AnalyticsOverview>(`/analytics/user/${userId}/overview`)
      .then((res) => res.data!),

  // Get public blogs analytics for any user
  getPublicUserBlogsAnalytics: (
    userId: string,
    params?: {
      page?: number;
      limit?: number;
      sortBy?: "views" | "likes" | "comments" | "publishedAt";
      sortOrder?: "asc" | "desc";
    }
  ): Promise<BlogsAnalytics> =>
    apiRequest
      .get<BlogsAnalytics>(`/analytics/user/${userId}/blogs`, params)
      .then((res) => res.data!),

  // Get public category analytics for any user
  getPublicUserCategoryAnalytics: (
    userId: string
  ): Promise<CategoryAnalytics> =>
    apiRequest
      .get<CategoryAnalytics>(`/analytics/user/${userId}/categories`)
      .then((res) => res.data!),
};

export default analyticsService;
