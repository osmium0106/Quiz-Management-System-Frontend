import { create } from 'zustand';
import { User } from '../types';

interface AuthStore {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  // Actions
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    password: string;
    password_confirm: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  changePassword: (data: {
    old_password: string;
    new_password: string;
    new_password_confirm: string;
  }) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  // Initial state
  user: null,
  accessToken: localStorage.getItem('access_token'),
  refreshToken: localStorage.getItem('refresh_token'),
  isAuthenticated: !!localStorage.getItem('access_token'),
  isLoading: false,

  // Actions (simplified for now)
  login: async (username: string, _password: string) => {
    set({ isLoading: true });
    // Simulate login - replace with actual API call later
    setTimeout(() => {
      const mockToken = 'mock-token-' + Date.now();
      localStorage.setItem('access_token', mockToken);
      localStorage.setItem('refresh_token', mockToken);
      set({
        accessToken: mockToken,
        refreshToken: mockToken,
        isAuthenticated: true,
        isLoading: false,
        user: {
          id: 1,
          username,
          email: 'user@example.com',
          first_name: 'Test',
          last_name: 'User',
          full_name: 'Test User',
          is_quiz_admin: true,
          date_joined: new Date().toISOString(),
        }
      });
    }, 1000);
  },

  register: async (_data) => {
    set({ isLoading: true });
    // Simulate registration
    setTimeout(() => {
      set({ isLoading: false });
    }, 1000);
  },

  logout: async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  loadUser: async () => {
    const token = localStorage.getItem('access_token');
    if (token) {
      set({ 
        accessToken: token,
        isAuthenticated: true,
        user: {
          id: 1,
          username: 'admin',
          email: 'admin@example.com',
          first_name: 'Admin',
          last_name: 'User',
          full_name: 'Admin User',
          is_quiz_admin: true,
          date_joined: new Date().toISOString(),
        }
      });
    }
  },

  updateProfile: async (data: Partial<User>) => {
    set({ isLoading: true });
    setTimeout(() => {
      const currentUser = get().user;
      if (currentUser) {
        set({
          user: { ...currentUser, ...data },
          isLoading: false,
        });
      }
    }, 1000);
  },

  changePassword: async (_data) => {
    set({ isLoading: true });
    setTimeout(() => {
      set({ isLoading: false });
    }, 1000);
  },

  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
    set({
      accessToken,
      refreshToken,
      isAuthenticated: true,
    });
  },

  clearAuth: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },
}));