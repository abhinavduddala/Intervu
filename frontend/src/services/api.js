import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Sends cookies automatically for session validation
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to inject Authorization Bearer token from Zustand store
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token expiry / unauthorized requests globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear store auth parameters when token expires
      useAuthStore.getState().logout();
      // Redirect to login page if on browser env
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    
    // Normalize error message payload structure supporting nested backend error format
    const message = error.response?.data?.error?.message || error.response?.data?.message || error.message || 'Something went wrong';
    const code = error.response?.data?.error?.code || error.response?.data?.code || 'SERVER_ERROR';
    const details = error.response?.data?.error?.details || error.response?.data?.details || null;
    
    return Promise.reject({
      message,
      code,
      details,
      status: error.response?.status || 500,
    });
  }
);

export default api;
