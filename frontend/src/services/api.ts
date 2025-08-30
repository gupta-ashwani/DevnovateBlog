import axios, { AxiosResponse, AxiosError } from "axios";
import { ApiResponse } from "@/types";

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Token management
// Store token for client-side requests
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    localStorage.setItem("auth_token", token);
  } else {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("auth_token");
  }
};

// Initialize token from localStorage
const savedToken = localStorage.getItem("auth_token");
if (savedToken) {
  setAuthToken(savedToken);
}

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(
      "API Request:",
      config.method?.toUpperCase(),
      config.url,
      config.baseURL
    );
    // Add timestamp to prevent caching
    if (config.method === "get") {
      config.params = {
        ...config.params,
        _t: Date.now(),
      };
    }
    return config;
  },
  (error) => {
    console.error("Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("API Response:", response.status, response.config.url);
    return response;
  },
  (error: AxiosError) => {
    // Log network errors as warnings, actual errors as errors
    if (!error.response) {
      console.warn("Network connection issue:", {
        url: error.config?.url,
        message: error.message,
      });
    } else {
      console.error("API Error:", {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data,
      });
    }

    const response = error.response;

    // Handle authentication errors
    if (response?.status === 401) {
      setAuthToken(null);
      // Only redirect if not already on auth pages
      const currentPath = window.location.pathname;
      if (
        !currentPath.includes("/login") &&
        !currentPath.includes("/register")
      ) {
        window.location.href = "/login";
      }
    }

    // Handle rate limiting
    if (response?.status === 429) {
      return Promise.reject({
        status: "error",
        message: "Too many requests. Please wait a moment and try again.",
      });
    }

    // Handle network errors (don't auto-show toast, let components handle it)
    if (!response) {
      return Promise.reject({
        status: "error",
        message:
          "Connection failed. Please check if the backend server is running.",
        isNetworkError: true,
      });
    }

    // Handle specific server errors
    if (response?.status >= 500) {
      return Promise.reject({
        status: "error",
        message: "Server error. Please try again later.",
      });
    }

    // Return formatted error response
    const errorData: ApiResponse<any> =
      response.data &&
      typeof response.data === "object" &&
      "status" in response.data &&
      "message" in response.data
        ? (response.data as ApiResponse<any>)
        : {
            status: "error",
            message: `Server error (${response.status}): ${error.message}`,
          };

    return Promise.reject(errorData);
  }
);

// Generic API helpers (no retry, clean and simple)
export const apiRequest = {
  get: <T = any>(url: string, params?: any): Promise<ApiResponse<T>> =>
    api.get(url, { params }).then((res) => res.data),

  post: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
    api.post(url, data).then((res) => res.data),

  put: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
    api.put(url, data).then((res) => res.data),

  delete: <T = any>(url: string): Promise<ApiResponse<T>> =>
    api.delete(url).then((res) => res.data),

  patch: <T = any>(url: string, data?: any): Promise<ApiResponse<T>> =>
    api.patch(url, data).then((res) => res.data),
};

// Simple health check
export const checkApiHealth = () => apiRequest.get("/health");

export default api;
