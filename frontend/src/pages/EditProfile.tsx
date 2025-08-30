import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Save, ArrowLeft, Upload, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { userService } from "@/services/user";
import { uploadService } from "@/services/upload";
import { UpdateUserData } from "@/types";
import toast from "react-hot-toast";

const EditProfile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  
  // Determine if this is admin editing or regular user editing
  const isAdmin = user?.role === "admin";
  const backRoute = isAdmin ? "/admin" : "/profile";
  
  const [formData, setFormData] = useState<UpdateUserData>({
    username: "",
    firstName: "",
    lastName: "",
    bio: "",
    avatar: "",
    socialLinks: {
      twitter: "",
      linkedin: "",
      github: "",
      website: "",
    },
  });

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username || "",
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        bio: user.bio || "",
        avatar: user.avatar || "",
        socialLinks: {
          twitter: user.socialLinks?.twitter || "",
          linkedin: user.socialLinks?.linkedin || "",
          github: user.socialLinks?.github || "",
          website: user.socialLinks?.website || "",
        },
      });
      setAvatarPreview(user.avatar || "");
    }
  }, [user]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    
    if (name.startsWith("socialLinks.")) {
      const field = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [field]: value,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        toast.error("Please select an image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image size should be less than 5MB");
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview("");
    setFormData(prev => ({ ...prev, avatar: "" }));
  };

  const uploadAvatarToCloudinary = async (file: File): Promise<string> => {
    try {
      const response = await uploadService.uploadImage(file);
      return response.data.url;
    } catch (error: any) {
      console.error("Avatar upload error:", error);
      
      // Extract meaningful error message
      let errorMessage = "Failed to upload avatar";
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let updateData = { ...formData };

      // Upload avatar if new file is selected
      if (avatarFile) {
        const avatarUrl = await uploadAvatarToCloudinary(avatarFile);
        updateData.avatar = avatarUrl;
      } else if (avatarPreview === "" && formData.avatar) {
        // If user removed avatar, set it to empty string
        updateData.avatar = "";
      }

      // Update user profile
      const updatedUser = await userService.updateProfile(updateData);
      console.log("Updated user response:", updatedUser);
      
      // Update auth context
      updateUser(updatedUser);
      
      toast.success("Profile updated successfully!");
      navigate(backRoute);
    } catch (error: any) {
      console.error("Error updating profile:", error);
      console.error("Error response:", error.response);
      
      // Extract meaningful error message from API response
      let errorMessage = "Failed to update profile";
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        if (Array.isArray(errors) && errors.length > 0) {
          errorMessage = errors.map(err => err.message).join(', ');
        }
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <Link
                to={backRoute}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Profile</h1>
                <p className="text-sm text-gray-600">
                  Update your personal information and preferences
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
        >
          <form onSubmit={handleSubmit}>
            {/* Avatar Section */}
            <div className="px-6 py-8 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Profile Picture
              </h3>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-full flex items-center justify-center overflow-hidden">
                    {avatarPreview ? (
                      <img
                        src={avatarPreview}
                        alt="Avatar preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl font-semibold">
                        {user.fullName?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatar}
                      className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <label
                    htmlFor="avatar"
                    className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Camera className="h-4 w-4 mr-2" />
                    Change Avatar
                  </label>
                  <input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="mt-2 text-sm text-gray-500">
                    JPG, GIF or PNG. Max size of 5MB.
                  </p>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="px-6 py-8 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Basic Information
              </h3>
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label
                    htmlFor="username"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Username
                  </label>
                  <input
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter your username"
                    pattern="^[a-zA-Z0-9_]+$"
                    title="Username can only contain letters, numbers, and underscores"
                    required
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    3-30 characters. Letters, numbers, and underscores only.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    First Name
                  </label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Last Name
                  </label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-6">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bio
                </label>
                <textarea
                  id="bio"
                  name="bio"
                  rows={4}
                  value={formData.bio}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Tell us about yourself..."
                />
              </div>
            </div>

            {/* Social Links */}
            <div className="px-6 py-8">
              <h3 className="text-lg font-medium text-gray-900 mb-6">
                Social Links
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="twitter"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Twitter
                  </label>
                  <input
                    type="url"
                    id="twitter"
                    name="socialLinks.twitter"
                    value={formData.socialLinks?.twitter}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://twitter.com/username"
                  />
                </div>
                <div>
                  <label
                    htmlFor="linkedin"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    id="linkedin"
                    name="socialLinks.linkedin"
                    value={formData.socialLinks?.linkedin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
                <div>
                  <label
                    htmlFor="github"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    GitHub
                  </label>
                  <input
                    type="url"
                    id="github"
                    name="socialLinks.github"
                    value={formData.socialLinks?.github}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://github.com/username"
                  />
                </div>
                <div>
                  <label
                    htmlFor="website"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Website
                  </label>
                  <input
                    type="url"
                    id="website"
                    name="socialLinks.website"
                    value={formData.socialLinks?.website}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://yourwebsite.com"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="px-6 py-6 bg-gray-50 border-t border-gray-200 flex justify-end space-x-3">
              <Link
                to={backRoute}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EditProfile;
