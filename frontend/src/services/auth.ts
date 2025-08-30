import { apiRequest } from "./api";
import {
  AuthResponse,
  LoginData,
  RegisterData,
  User,
  ChangePasswordData,
  UpdateUserData,
  ApiResponse,
} from "@/types";

export const authService = {
  // Register new user
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiRequest.post<{ token: string; user: User }>(
      "/auth/register",
      data
    );
    return {
      status: response.status,
      message: response.message,
      data: response.data,
    };
  },

  // Login user
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await apiRequest.post<{ token: string; user: User }>(
      "/auth/login",
      data
    );
    return {
      status: response.status,
      message: response.message,
      data: response.data,
    };
  },

  // Logout user
  logout: async (): Promise<ApiResponse> => {
    return apiRequest.post("/auth/logout");
  },

  // Get current user profile
  getMe: async (): Promise<User> => {
    const response = await apiRequest.get<{ user: User }>("/auth/me");
    return response.data!.user;
  },

  // Update user profile
  updateMe: async (data: UpdateUserData): Promise<User> => {
    const response = await apiRequest.put<{ user: User }>("/auth/me", data);
    return response.data!.user;
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<ApiResponse> => {
    return apiRequest.put("/auth/change-password", data);
  },

  // Refresh token
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await apiRequest.post<{ token: string; user: User }>(
      "/auth/refresh"
    );
    return {
      status: response.status,
      message: response.message,
      data: response.data,
    };
  },
};
