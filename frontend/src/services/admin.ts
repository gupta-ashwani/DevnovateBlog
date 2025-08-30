import { apiRequest } from "./api";
import {
  DashboardStats,
  UsersResponse,
  BlogsResponse,
  CommentsResponse,
  AdminFilters,
  Blog,
  // User,
  // Comment,
  ApiResponse,
} from "@/types";

export const adminService = {
  // Get dashboard statistics
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiRequest.get<DashboardStats>("/admin/dashboard");
    return response.data!;
  },

  // Get pending blogs for review
  getPendingBlogs: async (): Promise<Blog[]> => {
    const response = await apiRequest.get<{ blogs: Blog[] }>(
      "/admin/blogs/pending"
    );
    return response.data!.blogs || [];
  },

  // Get recent users
  getRecentUsers: async (limit = 10): Promise<any[]> => {
    const response = await apiRequest.get<{ users: any[] }>(
      `/admin/users/recent?limit=${limit}`
    );
    return response.data!.users || [];
  },

  // Get all users for admin
  getAllUsers: async (filters: AdminFilters = {}): Promise<UsersResponse> => {
    const response = await apiRequest.get<UsersResponse>(
      "/admin/users",
      filters
    );
    return response.data!;
  },

  // Get all blogs for admin
  getAllBlogs: async (filters: AdminFilters = {}): Promise<BlogsResponse> => {
    const response = await apiRequest.get<BlogsResponse>(
      "/admin/blogs",
      filters
    );
    return response.data!;
  },

  // Review blog (approve/reject)
  reviewBlog: async (
    id: string,
    reviewData: { status: "approved" | "rejected"; adminNotes?: string }
  ): Promise<Blog> => {
    const response = await apiRequest.put<{ blog: Blog }>(
      `/admin/blogs/${id}/review`,
      reviewData
    );
    return response.data!.blog;
  },

  // Toggle blog featured status
  toggleBlogFeatured: async (id: string): Promise<ApiResponse> => {
    return apiRequest.put(`/admin/blogs/${id}/featured`);
  },

  // Toggle blog visibility (hide/show)
  toggleBlogVisibility: async (id: string): Promise<ApiResponse> => {
    return apiRequest.put(`/admin/blogs/${id}/visibility`);
  },

  // Delete blog (admin)
  deleteBlog: async (id: string): Promise<ApiResponse> => {
    return apiRequest.delete(`/admin/blogs/${id}`);
  },

  // Toggle user active status
  toggleUserStatus: async (id: string): Promise<ApiResponse> => {
    return apiRequest.put(`/admin/users/${id}/status`);
  },

  // Change user role
  changeUserRole: async (
    id: string,
    role: "user" | "admin"
  ): Promise<ApiResponse> => {
    return apiRequest.put(`/admin/users/${id}/role`, { role });
  },

  // Get reported comments
  getReportedComments: async (
    page: number = 1,
    limit: number = 20
  ): Promise<CommentsResponse> => {
    const response = await apiRequest.get<CommentsResponse>(
      "/admin/comments/reported",
      { page, limit }
    );
    return response.data!;
  },

  // Moderate comment (hide/show)
  moderateComment: async (
    id: string,
    action: "hide" | "show"
  ): Promise<ApiResponse> => {
    return apiRequest.put(`/admin/comments/${id}/moderate`, { action });
  },
};
