import { apiRequest } from "./api";
import {
  Blog,
  BlogsResponse,
  CreateBlogData,
  UpdateBlogData,
  SearchFilters,
  ApiResponse,
} from "@/types";

export const blogService = {
  // Get all blogs (public)
  getBlogs: async (filters: SearchFilters = {}): Promise<BlogsResponse> => {
    const response = await apiRequest.get<BlogsResponse>("/blogs", filters);
    return response.data!;
  },

  // Get trending blogs
  getTrendingBlogs: async (limit: number = 10): Promise<Blog[]> => {
    const response = await apiRequest.get<{ blogs: Blog[] }>(
      "/blogs/trending",
      { limit }
    );
    return response.data!.blogs;
  },

  // Get latest blogs
  getLatestBlogs: async (limit: number = 10): Promise<Blog[]> => {
    const response = await apiRequest.get<{ blogs: Blog[] }>("/blogs/latest", {
      limit,
    });
    return response.data!.blogs;
  },

  // Get featured blogs
  getFeaturedBlogs: async (limit: number = 5): Promise<Blog[]> => {
    const response = await apiRequest.get<{ blogs: Blog[] }>(
      "/blogs/featured",
      { limit }
    );
    return response.data!.blogs;
  },

  // Get single blog by slug
  getBlogBySlug: async (slug: string): Promise<Blog> => {
    const response = await apiRequest.get<{ blog: Blog }>(`/blogs/${slug}`);
    return response.data!.blog;
  },

  // Get single blog by ID
  getBlogById: async (id: string): Promise<ApiResponse<{ blog: Blog }>> => {
    return apiRequest.get<{ blog: Blog }>(`/blogs/id/${id}`);
  },

  // Create new blog
  createBlog: async (
    data: CreateBlogData
  ): Promise<ApiResponse<{ blog: Blog }>> => {
    return apiRequest.post<{ blog: Blog }>("/blogs", data);
  },

  // Update blog
  updateBlog: async (
    id: string,
    data: UpdateBlogData
  ): Promise<ApiResponse<{ blog: Blog }>> => {
    return apiRequest.put<{ blog: Blog }>(`/blogs/${id}`, data);
  },

  // Delete blog
  deleteBlog: async (id: string): Promise<ApiResponse> => {
    return apiRequest.delete(`/blogs/${id}`);
  },

  // Get user's own blogs
  getMyBlogs: async (filters: SearchFilters = {}): Promise<BlogsResponse> => {
    const response = await apiRequest.get<BlogsResponse>(
      "/blogs/user/my-blogs",
      filters
    );
    return response.data!;
  },

  // Toggle blog like
  toggleBlogLike: async (
    id: string
  ): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await apiRequest.post<{
      liked: boolean;
      likeCount: number;
    }>(`/blogs/${id}/like`);
    return response.data!;
  },

  // Search blogs
  searchBlogs: async (query: string, limit: number = 20): Promise<Blog[]> => {
    const response = await apiRequest.get<{ blogs: Blog[] }>("/blogs/search", {
      q: query,
      limit,
    });
    return response.data!.blogs;
  },
};
