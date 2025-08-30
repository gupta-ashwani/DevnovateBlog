import { apiRequest } from "./api";
import {
  Comment,
  CommentsResponse,
  CreateCommentData,
  ApiResponse,
} from "@/types";

export const commentService = {
  // Get comments for a blog
  getComments: async (
    blogId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<CommentsResponse> => {
    const response = await apiRequest.get<CommentsResponse>(
      `/blogs/${blogId}/comments`,
      { page, limit }
    );
    return response.data!;
  },

  // Create comment
  createComment: async (
    blogId: string,
    data: CreateCommentData
  ): Promise<Comment> => {
    const response = await apiRequest.post<{ comment: Comment }>(
      `/blogs/${blogId}/comments`,
      data
    );
    return response.data!.comment;
  },

  // Update comment
  updateComment: async (id: string, content: string): Promise<Comment> => {
    const response = await apiRequest.put<{ comment: Comment }>(
      `/comments/${id}`,
      { content }
    );
    return response.data!.comment;
  },

  // Delete comment
  deleteComment: async (id: string): Promise<ApiResponse> => {
    return apiRequest.delete(`/comments/${id}`);
  },

  // Toggle comment like
  toggleCommentLike: async (
    id: string
  ): Promise<{ liked: boolean; likeCount: number }> => {
    const response = await apiRequest.post<{
      liked: boolean;
      likeCount: number;
    }>(`/comments/${id}/like`);
    return response.data!;
  },

  // Report comment
  reportComment: async (id: string, reason: string): Promise<ApiResponse> => {
    return apiRequest.post(`/comments/${id}/report`, { reason });
  },

  // Get comment replies
  getReplies: async (
    id: string,
    page: number = 1,
    limit: number = 10
  ): Promise<CommentsResponse> => {
    const response = await apiRequest.get<CommentsResponse>(
      `/comments/${id}/replies`,
      { page, limit }
    );
    return response.data!;
  },
};
