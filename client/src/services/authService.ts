import axios from 'axios';
import { User } from '../types';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  // Login
  login: async (username: string, password: string): Promise<{ user: User; token: string }> => {
    const response = await api.post('/api/auth/login', { username, password });
    const { user, token } = response.data;
    localStorage.setItem('token', token);
    return { user, token };
  },

  // Logout
  logout: () => {
    localStorage.removeItem('token');
  },

  // Get current user
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.put('/api/auth/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (currentPassword: string, newPassword: string): Promise<void> => {
    await api.put('/api/auth/change-password', { currentPassword, newPassword });
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Get user role
  getUserRole: (): string | null => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      return user.role;
    }
    return null;
  },

  // Check if user has required role
  hasRole: (requiredRole: string): boolean => {
    const userRole = authService.getUserRole();
    if (!userRole) return false;

    const roleHierarchy = {
      admin: ['admin', 'technician', 'viewer'],
      technician: ['technician', 'viewer'],
      viewer: ['viewer']
    };

    return roleHierarchy[userRole as keyof typeof roleHierarchy]?.includes(requiredRole) || false;
  }
}; 