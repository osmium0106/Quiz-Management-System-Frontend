import apiClient from './api';
import {
  LoginRequest,
  RegisterRequest,
  LoginResponse,
  RegisterResponse,
  TokenRefreshRequest,
  TokenRefreshResponse,
  ChangePasswordRequest,
  ApiResponse,
  User,
} from '../types';

export const authService = {
  // Register new admin user
  register: async (data: RegisterRequest): Promise<RegisterResponse> => {
    const response = await apiClient.post<RegisterResponse>('/auth/register/', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<LoginResponse>('/auth/login/', data);
    return response.data;
  },

  // Logout user
  logout: async (refreshToken: string): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/logout/', {
      refresh_token: refreshToken,
    });
    return response.data;
  },

  // Refresh access token
  refreshToken: async (data: TokenRefreshRequest): Promise<TokenRefreshResponse> => {
    const response = await apiClient.post<TokenRefreshResponse>('/auth/token/refresh/', data);
    return response.data;
  },

  // Get user profile
  getProfile: async (): Promise<{ data: User }> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile/');
    // Handle both wrapped and direct responses
    const userData = (response.data as any).data || (response.data as unknown as User);
    return { data: userData };
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<{ data: User }> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile/', data);
    // Handle both wrapped and direct responses
    const userData = (response.data as any).data || (response.data as unknown as User);
    return { data: userData };
  },

  // Change password
  changePassword: async (data: ChangePasswordRequest): Promise<ApiResponse> => {
    const response = await apiClient.post<ApiResponse>('/auth/change-password/', data);
    return response.data;
  },
};