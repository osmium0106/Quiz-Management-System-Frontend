import apiClient from './api';
import {
  PublicQuiz,
  PublicQuizDetail,
  SubmitQuizRequest,
  QuizSubmissionResponse,
  QuizResponse,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export const publicService = {
  // Get active quizzes for public
  getPublicQuizzes: async (): Promise<PaginatedResponse<PublicQuiz>> => {
    const response = await apiClient.get<PaginatedResponse<PublicQuiz>>('/public/quizzes/');
    return response.data;
  },

  // Get quiz for taking (without correct answers)
  getPublicQuiz: async (id: number): Promise<ApiResponse<PublicQuizDetail>> => {
    const response = await apiClient.get<ApiResponse<PublicQuizDetail>>(`/public/quizzes/${id}/`);
    return response.data;
  },

  // Submit quiz responses
  submitQuiz: async (id: number, data: SubmitQuizRequest): Promise<QuizSubmissionResponse> => {
    const response = await apiClient.post<QuizSubmissionResponse>(`/public/quizzes/${id}/submit/`, data);
    return response.data;
  },

  // Get quiz results by session ID
  getResults: async (sessionId: string): Promise<ApiResponse<QuizResponse>> => {
    const response = await apiClient.get<ApiResponse<QuizResponse>>(`/public/results/${sessionId}/`);
    return response.data;
  },
};