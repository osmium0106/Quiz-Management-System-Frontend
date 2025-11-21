import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';
import { User, LoginRequest, RegisterRequest } from '../types';
import { authService } from '../services/auth';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; accessToken: string; refreshToken: string } }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

interface AuthContextType extends AuthState {
  login: (credentials: LoginRequest) => Promise<void>;
  register: (userData: RegisterRequest) => Promise<void>;
  logout: () => void;
  clearError: () => void;
  refreshAccessToken: () => Promise<void>;
  debugTokens: () => void;
}

const initialState: AuthState = {
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        refreshToken: action.payload.refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    // Initialize API client token on app load
    const initializeApiClient = async () => {
      if (state.accessToken) {
        const { default: apiClient } = await import('../services/api');
        apiClient.setAccessToken(state.accessToken);
        
        // Load user profile if we have a token but no user
        if (!state.user) {
          loadUserProfile();
        }
      }
    };
    
    initializeApiClient();
  }, [state.accessToken]);

  const loadUserProfile = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.getProfile();
      dispatch({ type: 'UPDATE_USER', payload: response.data });
    } catch (error: any) {
      console.error('Failed to load user profile:', error);
      // If profile loading fails, token might be invalid
      logout();
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const login = async (credentials: LoginRequest) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      const response = await authService.login(credentials);
      
      if (response.error) {
        throw new Error(response.message);
      }

      const { user, access_token, refresh_token } = response.data;
      
      // Store tokens in localStorage
      localStorage.setItem('access_token', access_token);
      localStorage.setItem('refresh_token', refresh_token);
      
      // Set token in API client
      const { default: apiClient } = await import('../services/api');
      apiClient.setAccessToken(access_token);
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user,
          accessToken: access_token,
          refreshToken: refresh_token,
        },
      });
      
      toast.success('Login successful!');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    }
  };

  const register = async (userData: RegisterRequest) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const response = await authService.register(userData);
      
      if (response.error) {
        throw new Error(response.message);
      }
      
      toast.success('Registration successful! Please login.');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
      toast.error(errorMessage);
      throw error;
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const logout = async () => {
    try {
      if (state.refreshToken) {
        await authService.logout(state.refreshToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear localStorage and state regardless of API call success
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      
      // Clear token from API client
      const { default: apiClient } = await import('../services/api');
      apiClient.clearTokens();
      
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
      
      // Explicit redirect to login page
      window.location.href = '/login';
    }
  };

  const refreshAccessToken = async () => {
    try {
      if (!state.refreshToken) {
        throw new Error('No refresh token available');
      }
      
      const response = await authService.refreshToken({ refresh: state.refreshToken });
      const newAccessToken = response.access;
      
      localStorage.setItem('access_token', newAccessToken);
      
      // Update API client token
      const { default: apiClient } = await import('../services/api');
      apiClient.setAccessToken(newAccessToken);
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: {
          user: state.user!,
          accessToken: newAccessToken,
          refreshToken: state.refreshToken,
        },
      });
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  // Debug function to check token status
  const debugTokens = () => {
    console.log('🔍 Auth Debug Info:', {
      accessToken: state.accessToken ? `${state.accessToken.substring(0, 20)}...` : 'null',
      refreshToken: state.refreshToken ? `${state.refreshToken.substring(0, 20)}...` : 'null',
      localStorage_access: localStorage.getItem('access_token') ? 'exists' : 'missing',
      localStorage_refresh: localStorage.getItem('refresh_token') ? 'exists' : 'missing',
      isAuthenticated: state.isAuthenticated,
      user: state.user ? `${state.user.username} (${state.user.email})` : 'null'
    });
  };

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    refreshAccessToken,
    debugTokens,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
