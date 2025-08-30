import { apiRequest } from "./api";
import { User, BlogsResponse, UpdateUserData } from "@/types";

export const userService = {
  // Get user profile by username
  getUserProfile: async (username: string): Promise<User> => {
    const response = await apiRequest.get<{ user: User }>(`/users/${username}`);
    return response.data!.user;
  },

  // Get user by username (alias for getUserProfile)
  getUserByUsername: async (username: string): Promise<User> => {
    return userService.getUserProfile(username);
  },

  // Get user by ID
  getUserById: async (id: string): Promise<User> => {
    const response = await apiRequest.get<{ user: User }>(`/users/id/${id}`);
    return response.data!.user;
  },

  // Update user profile
  updateProfile: async (data: UpdateUserData): Promise<User> => {
    const response = await apiRequest.put<{ user: User }>(
      "/users/me",
      data
    );
    // The API returns { status: "success", data: { user: {...} } }
    return response.data!.user;
  },

  // Get user's public blogs
  getUserBlogs: async (
    username: string,
    page: number = 1,
    limit: number = 10
  ): Promise<BlogsResponse> => {
    const response = await apiRequest.get<BlogsResponse>(
      `/users/${username}/blogs`,
      { page, limit }
    );
    return response.data!;
  },

  // Get user stats
  getUserStats: async (userId?: string): Promise<any> => {
    const endpoint = userId ? `/users/${userId}/stats` : "/users/me/stats";
    const response = await apiRequest.get(endpoint);
    return response.data;
  },

  // Get current user's own blogs (including drafts)
  getMyBlogs: async (
    status?: string,
    page: number = 1,
    limit: number = 10
  ): Promise<BlogsResponse> => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(status && { status }),
    });
    const response = await apiRequest.get<BlogsResponse>(
      `/users/me/blogs?${params}`
    );
    return response.data!;
  },

  // Get current user profile
  getCurrentUser: async (): Promise<User> => {
    const response = await apiRequest.get<{ user: User }>("/users/me");
    return response.data!.user;
  },

  // Follow/Unfollow user
  toggleFollow: async (userId: string): Promise<{ isFollowing: boolean }> => {
    const response = await apiRequest.post<{ isFollowing: boolean }>(
      `/users/${userId}/follow`
    );
    return response.data!;
  },

  // Search users
  searchUsers: async (query: string, limit: number = 10): Promise<User[]> => {
    const response = await apiRequest.get<{ users: User[] }>("/users/search", {
      q: query,
      limit,
    });
    return response.data!.users;
  },

  // Get top authors
  getTopAuthors: async (limit: number = 10): Promise<User[]> => {
    const response = await apiRequest.get<{ authors: User[] }>(
      "/users/top-authors",
      { limit }
    );
    return response.data!.authors;
  },
};
