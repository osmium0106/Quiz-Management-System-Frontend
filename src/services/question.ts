import apiClient from './api';
import {
  Question,
  CreateQuestionRequest,
  ApiResponse,
} from '../types';

export const questionService = {
  // Get questions for a quiz
  getQuestions: async (quizId: number): Promise<ApiResponse<Question[]>> => {
    const response = await apiClient.get<ApiResponse<Question[]>>(`/admin/quizzes/${quizId}/questions/`);
    return response.data;
  },

  // Create new question
  createQuestion: async (quizId: number, data: CreateQuestionRequest): Promise<ApiResponse<Question>> => {
    const response = await apiClient.post<ApiResponse<Question>>(`/admin/quizzes/${quizId}/questions/`, data);
    return response.data;
  },

  // Get question by ID
  getQuestion: async (id: number): Promise<ApiResponse<Question>> => {
    const response = await apiClient.get<ApiResponse<Question>>(`/admin/questions/${id}/`);
    return response.data;
  },

  // Update question
  updateQuestion: async (id: number, data: CreateQuestionRequest): Promise<ApiResponse<Question>> => {
    const response = await apiClient.put<ApiResponse<Question>>(`/admin/questions/${id}/`, data);
    return response.data;
  },

  // Partially update question
  patchQuestion: async (id: number, data: Partial<CreateQuestionRequest>): Promise<ApiResponse<Question>> => {
    const response = await apiClient.patch<ApiResponse<Question>>(`/admin/questions/${id}/`, data);
    return response.data;
  },

  // Delete question
  deleteQuestion: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/admin/questions/${id}/`);
    return response.data;
  },

  // Reorder questions
  reorderQuestions: async (quizId: number, questionIds: number[]): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>(`/admin/quizzes/${quizId}/reorder-questions/`, {
      question_ids: questionIds,
    });
    return response.data;
  },
};