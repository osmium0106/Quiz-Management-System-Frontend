import apiClient from './api';
import {
  Quiz,
  CreateQuizRequest,
  UpdateQuizRequest,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export interface QuizListParams {
  page?: number;
  search?: string;
  ordering?: string;
}

export const quizService = {
  // Get all quizzes (admin)
  getQuizzes: async (params: QuizListParams = {}): Promise<ApiResponse<PaginatedResponse<Quiz>>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);

    const response = await apiClient.get<ApiResponse<PaginatedResponse<Quiz>>>(
      `/admin/quizzes/?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get all quizzes (public access)
  getAllQuizzes: async (params: QuizListParams = {}): Promise<PaginatedResponse<Quiz>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);

    // Use the public quizzes endpoint that doesn't require authentication
    const response = await apiClient.get<PaginatedResponse<Quiz>>(
      `/public/quizzes/?${queryParams.toString()}`
    );
    return response.data;
  },

  // Get quiz by ID (admin)
  getQuiz: async (id: number): Promise<ApiResponse<Quiz>> => {
    const response = await apiClient.get<ApiResponse<Quiz>>(`/admin/quizzes/${id}/`);
    return response.data;
  },

  // Create new quiz
  createQuiz: async (data: CreateQuizRequest): Promise<ApiResponse<Quiz>> => {
    const response = await apiClient.post<ApiResponse<Quiz>>('/admin/quizzes/', data);
    return response.data;
  },

  // Update quiz
  updateQuiz: async (id: number, data: UpdateQuizRequest): Promise<ApiResponse<Quiz>> => {
    const response = await apiClient.put<ApiResponse<Quiz>>(`/admin/quizzes/${id}/`, data);
    return response.data;
  },

  // Partially update quiz
  patchQuiz: async (id: number, data: Partial<UpdateQuizRequest>): Promise<ApiResponse<Quiz>> => {
    const response = await apiClient.patch<ApiResponse<Quiz>>(`/admin/quizzes/${id}/`, data);
    return response.data;
  },

  // Delete quiz
  deleteQuiz: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/admin/quizzes/${id}/`);
    return response.data;
  },

  // Toggle quiz active status
  toggleQuizStatus: async (id: number, isActive: boolean): Promise<ApiResponse<Quiz>> => {
    const response = await apiClient.patch<ApiResponse<Quiz>>(`/admin/quizzes/${id}/`, {
      is_active: isActive,
    });
    return response.data;
  },
};