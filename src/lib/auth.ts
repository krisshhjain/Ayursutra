// Authentication utilities for API calls

export interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  userType: 'patient' | 'practitioner' | 'admin';
  specialization?: string;
  isVerified: boolean;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
  message?: string;
}

// Get stored token
export const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Get stored user
export const getUser = (): User | null => {
  const userStr = localStorage.getItem('user');
  return userStr ? JSON.parse(userStr) : null;
};

// Store auth data
export const setAuth = (token: string, user: User): void => {
  localStorage.setItem('token', token);
  localStorage.setItem('user', JSON.stringify(user));
};

// Clear auth data
export const clearAuth = (): void => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// Check if user has specific role
export const hasRole = (requiredRole: string): boolean => {
  const user = getUser();
  return user?.userType === requiredRole;
};

// Get auth headers for API calls
export const getAuthHeaders = (): Record<string, string> => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// API call wrapper with auth
export const apiCall = async (
  endpoint: string, 
  options: RequestInit = {}
): Promise<any> => {
  const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
  
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'API request failed');
  }

  return data;
};