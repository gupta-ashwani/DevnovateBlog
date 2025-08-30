import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Configure axios instance for upload
const uploadAPI = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
uploadAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const uploadService = {
  // Upload image to Cloudinary
  uploadImage: async (file: File) => {
    const formData = new FormData();
    formData.append("image", file);

    const response = await uploadAPI.post("/upload/image", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  },

  // Delete image from Cloudinary
  deleteImage: async (publicId: string) => {
    const response = await uploadAPI.delete(`/upload/image/${publicId}`);
    return response.data;
  },
};
