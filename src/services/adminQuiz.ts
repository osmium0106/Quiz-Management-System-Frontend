import apiClient from './api';
import { Quiz, Question, ApiResponse, PaginatedResponse } from '../types';

export interface AdminQuizListParams {
  page?: number;
  page_size?: number;
  search?: string;
  is_active?: boolean;
}

export interface AdminQuestionListParams {
  page?: number;
  page_size?: number;
  search?: string;
}

export const adminQuizService = {
  // Quiz CRUD operations
  getQuizzes: async (params: AdminQuizListParams = {}): Promise<PaginatedResponse<Quiz>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<PaginatedResponse<Quiz>>(
      `/admin/quizzes/?${queryParams.toString()}`
    );
    return response.data;
  },

  getQuiz: async (id: number): Promise<Quiz> => {
    const response = await apiClient.get<Quiz>(`/admin/quizzes/${id}/`);
    return response.data;
  },

  createQuiz: async (data: Partial<Quiz>): Promise<Quiz> => {
    const response = await apiClient.post<Quiz>('/admin/quizzes/', data);
    return response.data;
  },

  updateQuiz: async (id: number, data: Partial<Quiz>): Promise<Quiz> => {
    const response = await apiClient.put<Quiz>(`/admin/quizzes/${id}/`, data);
    return response.data;
  },

  partialUpdateQuiz: async (id: number, data: Partial<Quiz>): Promise<Quiz> => {
    const response = await apiClient.patch<Quiz>(`/admin/quizzes/${id}/`, data);
    return response.data;
  },

  deleteQuiz: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/quizzes/${id}/`);
  },

  // Quiz Questions operations
  getQuizQuestions: async (quizId: number, params: AdminQuestionListParams = {}): Promise<PaginatedResponse<Question>> => {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });
    
    const response = await apiClient.get<PaginatedResponse<Question>>(
      `/admin/quizzes/${quizId}/questions/?${queryParams.toString()}`
    );
    return response.data;
  },

  createQuizQuestion: async (quizId: number, data: Partial<Question>): Promise<Question> => {
    const response = await apiClient.post<Question>(`/admin/quizzes/${quizId}/questions/`, data);
    return response.data;
  },

  // Individual Question operations
  getQuestion: async (id: number): Promise<Question> => {
    const response = await apiClient.get<Question>(`/admin/questions/${id}/`);
    return response.data;
  },

  updateQuestion: async (id: number, data: Partial<Question>): Promise<Question> => {
    const response = await apiClient.put<Question>(`/admin/questions/${id}/`, data);
    return response.data;
  },

  partialUpdateQuestion: async (id: number, data: Partial<Question>): Promise<Question> => {
    const response = await apiClient.patch<Question>(`/admin/questions/${id}/`, data);
    return response.data;
  },

  deleteQuestion: async (id: number): Promise<void> => {
    await apiClient.delete(`/admin/questions/${id}/`);
  },

  // Dashboard stats
  getDashboardStats: async (): Promise<{
    totalQuizzes: number;
    activeQuizzes: number;
    totalQuestions: number;
    totalResponses: number;
  }> => {
    try {
      const quizzesResponse = await adminQuizService.getQuizzes({ page_size: 1000 });
      const quizzes = quizzesResponse.results || [];
      
      const totalQuizzes = quizzesResponse.count || quizzes.length;
      const activeQuizzes = quizzes.filter(quiz => quiz.is_active).length;
      
      // Count total questions across all quizzes
      let totalQuestions = 0;
      for (const quiz of quizzes.slice(0, 10)) { // Limit to first 10 to avoid too many requests
        try {
          const questionsResponse = await adminQuizService.getQuizQuestions(quiz.id);
          totalQuestions += questionsResponse.count || 0;
        } catch (error) {
          console.warn(`Failed to get questions for quiz ${quiz.id}:`, error);
        }
      }
      
      return {
        totalQuizzes,
        activeQuizzes,
        totalQuestions,
        totalResponses: 0, // Will be implemented when response endpoints are available
      };
    } catch (error) {
      console.error('Failed to get dashboard stats:', error);
      return {
        totalQuizzes: 0,
        activeQuizzes: 0,
        totalQuestions: 0,
        totalResponses: 0,
      };
    }
  },
};