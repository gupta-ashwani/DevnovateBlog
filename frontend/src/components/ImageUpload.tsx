import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import { Upload, X, AlertCircle, Image, CheckCircle } from "lucide-react";
import { uploadService } from "@/services/upload";

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
  placeholder?: string;
  className?: string;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  placeholder = "Upload featured image",
  className = "",
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file (JPG, PNG, GIF, WebP)");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must be less than 5MB");
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      const response = await uploadService.uploadImage(file);
      if (response.status === "success") {
        onChange(response.data.url);
        setUploadSuccess(true);
        // Hide success message after 3 seconds
        setTimeout(() => setUploadSuccess(false), 3000);
      } else {
        throw new Error(response.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      setUploadError(
        error.response?.data?.message ||
          error.message ||
          "Failed to upload image. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRemoveImage = () => {
    onChange("");
    setUploadError(null);
    setUploadSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">
        Featured Image
      </label>

      {value ? (
        <div className="relative">
          <img
            src={value}
            alt="Featured"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
            type="button"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <motion.div
          className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
            dragActive
              ? "border-blue-400 bg-blue-50"
              : "border-gray-300 hover:border-gray-400"
          } ${isUploading ? "opacity-50" : ""}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <div className="text-center">
            {isUploading ? (
              <div className="flex flex-col items-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-sm text-gray-600">Uploading image...</p>
              </div>
            ) : (
              <div className="flex flex-col items-center space-y-2">
                <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
                  <Image className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">{placeholder}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    Drag & drop or{" "}
                    <button
                      type="button"
                      onClick={handleBrowseClick}
                      className="text-blue-600 hover:text-blue-700 underline"
                    >
                      browse files
                    </button>
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    PNG, JPG, GIF, WebP up to 5MB
                  </p>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            disabled={isUploading}
          />
        </motion.div>
      )}

      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg"
        >
          <AlertCircle className="h-4 w-4" />
          <span>{uploadError}</span>
        </motion.div>
      )}

      {uploadSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center space-x-2 text-green-600 text-sm bg-green-50 p-3 rounded-lg"
        >
          <CheckCircle className="h-4 w-4" />
          <span>Image uploaded successfully!</span>
        </motion.div>
      )}
    </div>
  );
};

export default ImageUpload;
