import apiClient from './api';
import {
  QuizResponse,
  ApiResponse,
  PaginatedResponse,
} from '../types';

export interface ResponseListParams {
  page?: number;
  search?: string;
  ordering?: string;
}

export const responseService = {
  // Get all quiz responses (admin) - requires authentication despite being "public"
  getResponses: async (params: ResponseListParams = {}): Promise<PaginatedResponse<QuizResponse>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);

    const url = `http://localhost:8000/api/v1/public/admin/responses/?${queryParams.toString()}`;
    console.log('Making authenticated request to:', url);

    // Get the access token from localStorage
    const accessToken = localStorage.getItem('access_token');
    
    if (!accessToken) {
      throw new Error('Authentication required - please log in');
    }

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Fetch error response:', errorData);
        
        if (response.status === 401) {
          throw new Error('Authentication failed - please log in again');
        }
        
        throw new Error(`HTTP ${response.status}: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json();
      console.log('Fetch response data:', data);
      return data;
    } catch (error: any) {
      console.error('Fetch request failed:', error);
      throw error;
    }
  },

  // Get detailed response by ID (admin)
  getResponse: async (id: number): Promise<ApiResponse<QuizResponse>> => {
    const response = await apiClient.get<ApiResponse<QuizResponse>>(`/public/admin/responses/${id}/`);
    return response.data;
  },

  // Delete response (admin)
  deleteResponse: async (id: number): Promise<ApiResponse> => {
    const response = await apiClient.delete<ApiResponse>(`/admin/responses/${id}/`);
    return response.data;
  },

  // Get responses for a specific quiz (admin)
  getQuizResponses: async (quizId: number, params: ResponseListParams = {}): Promise<ApiResponse<PaginatedResponse<QuizResponse>>> => {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.ordering) queryParams.append('ordering', params.ordering);

    const response = await apiClient.get<ApiResponse<PaginatedResponse<QuizResponse>>>(
      `/admin/quizzes/${quizId}/responses/?${queryParams.toString()}`
    );
    return response.data;
  },
};