// Environment configuration
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  BACKEND_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000',
  APP_NAME: import.meta.env.VITE_APP_NAME || 'Quiz Management System',
  APP_VERSION: import.meta.env.VITE_APP_VERSION || '1.0.0',
};