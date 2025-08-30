import { ReactNode } from "react";

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: "user" | "admin";
  avatar: string;
  bio: string;
  isActive: boolean;
  lastLogin: string;
  socialLinks: {
    twitter: string;
    linkedin: string;
    github: string;
    website: string;
  };
  stats: {
    totalBlogs: number;
    totalLikes: number;
    totalViews: number;
    followersCount: number;
    followingCount: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Blog {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: User;
  featuredImage: string;
  tags: string[];
  status: BlogStatus;
  publishedAt?: string;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
  };
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  readingTime: number;
  trendingScore: number;
  adminNotes: string;
  reviewedBy?: User;
  reviewedAt?: string;
  isCommentEnabled: boolean;
  isFeatured: boolean;
  isPinned: boolean;
  isLiked?: boolean;
  formattedPublishDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: User;
  blog: string;
  parentComment?: string;
  likes: Array<{
    user: string;
    createdAt: string;
  }>;
  likeCount: number;
  replyCount: number;
  isEdited: boolean;
  editedAt?: string;
  isHidden: boolean;
  isReported: boolean;
  reports: Array<{
    user: string;
    reason: "spam" | "inappropriate" | "harassment" | "other";
    createdAt: string;
  }>;
  replies?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface Like {
  _id: string;
  user: string;
  blog: string;
  type: "like" | "love" | "insightful" | "helpful";
  createdAt: string;
}

export type BlogStatus =
  | "draft"
  | "pending"
  | "approved"
  | "rejected"
  | "hidden";

export interface AuthResponse {
  status: "success" | "error";
  message: string;
  data?: {
    token: string;
    user: User;
  };
}

export interface ApiResponse<T = any> {
  status: "success" | "error";
  message: string;
  data?: T;
  errors?: Array<{
    field: string;
    message: string;
    value?: any;
  }>;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalBlogs?: number;
  totalUsers?: number;
  totalComments?: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface BlogsResponse {
  blogs: Blog[];
  pagination: PaginationInfo;
}

export interface CommentsResponse {
  comments: Comment[];
  pagination: PaginationInfo;
}

export interface UsersResponse {
  users: User[];
  pagination: PaginationInfo;
}

export interface DashboardStats {
  overview: {
    totalUsers: number;
    totalBlogs: number;
    totalComments: number;
    totalLikes: number;
    pendingBlogs: number;
    publishedBlogs: number;
  };
  recentActivity: {
    recentUsers: User[];
    recentBlogs: Blog[];
  };
  topAuthors: Array<{
    author: {
      username: string;
      firstName: string;
      lastName: string;
    };
    blogCount: number;
    totalViews: number;
  }>;
  blogsByMonth: Array<{
    _id: {
      year: number;
      month: number;
    };
    count: number;
  }>;
}

export interface CreateBlogData {
  title: string;
  content: string;
  excerpt?: string;
  tags: string[];
  featuredImage?: string;
  status?: BlogStatus;
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string[];
  };
  isCommentEnabled?: boolean;
}

export interface UpdateBlogData extends Partial<CreateBlogData> {
  isFeatured?: boolean;
  isPinned?: boolean;
}

export interface CreateCommentData {
  content: string;
  parentComment?: string;
}

export interface UpdateUserData {
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  avatar?: string;
  socialLinks?: {
    twitter?: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface SearchFilters {
  tag?: string;
  author?: string;
  search?: string;
  sortBy?: "createdAt" | "publishedAt" | "views" | "likes" | "comments";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export interface AdminFilters extends SearchFilters {
  status?: BlogStatus;
  role?: "user" | "admin";
  isActive?: boolean;
}

export interface BlogFormData {
  title: string;
  content: string;
  excerpt: string;
  tags: string[];
  featuredImage: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  isCommentEnabled: boolean;
}

export interface BlogEditorProps {
  initialData?: Partial<BlogFormData>;
  onSave: (data: BlogFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  mode: "create" | "edit";
}

export interface AnimationProps {
  children: ReactNode;
  delay?: number;
  duration?: number;
  className?: string;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
}

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

// Analytics Types
export interface AnalyticsOverview {
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
    avgViewsPerBlog: number;
    avgLikesPerBlog: number;
    avgCommentsPerBlog: number;
    engagementRate: number;
  };
  topPerformingBlogs: Array<{
    _id: string;
    title: string;
    slug: string;
    views: number;
    likes: number;
    comments: number;
    publishedAt: string;
    status: string;
  }>;
  recentActivity: {
    newBlogs: number;
    newLikes: number;
    newComments: number;
  };
}

export interface BlogAnalytics {
  blogId: string;
  title: string;
  slug: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  publishedAt: string;
  engagementRate: number;
  viewsOverTime: Array<{
    date: string;
    views: number;
  }>;
  likesOverTime: Array<{
    date: string;
    likes: number;
  }>;
  commentsOverTime: Array<{
    date: string;
    comments: number;
  }>;
}

export interface BlogsAnalytics {
  blogs: Array<{
    _id: string;
    title: string;
    slug: string;
    status: string;
    publishedAt: string;
    tags: string[];
    readingTime: number;
    metrics: {
      views: number;
      likes: number;
      comments: number;
      shares: number;
      engagementRate: number;
    };
    createdAt: string;
  }>;
  pagination: PaginationInfo;
}
