// Centralized API configuration

export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api',
  
  // Common endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    PROFILE: '/auth/profile',
    LOGOUT: '/auth/logout'
  },
  
  APPOINTMENTS: {
    BASE: '/appointments',
    PRACTITIONERS: '/appointments/practitioners',
    COMPLETE: (id: string) => `/appointments/${id}/complete`,
    CONFIRM: (id: string) => `/appointments/${id}/confirm`,
    AVAILABILITY: (practitionerId: string) => `/appointments/practitioner/${practitionerId}/availability`
  },
  
  PRACTITIONER: {
    DASHBOARD: '/practitioner/dashboard',
    PATIENTS: '/practitioner/patients',
    SCHEDULE: '/practitioner/schedule',
    APPOINTMENTS: '/practitioner/appointments'
  },
  
  PATIENT: {
    DASHBOARD: '/patient/dashboard'
  },
  
  REVIEWS: {
    BASE: '/reviews',
    PRACTITIONER: (id: string) => `/reviews/practitioner/${id}`,
    APPOINTMENT_EXISTS: (id: string) => `/reviews/appointment/${id}/exists`,
    MY_REVIEWS: '/reviews/patient/my-reviews'
  },
  
  ADMIN: {
    USERS: '/admin/users',
    LOGS: '/admin/logs',
    EXPORT: '/admin/export'
  }
};

// Helper function to build full URL
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to get auth headers
export const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// Helper function to make authenticated API calls
export const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const url = buildApiUrl(endpoint);
  const defaultOptions: RequestInit = {
    headers: getAuthHeaders(),
    ...options
  };
  
  const response = await fetch(url, defaultOptions);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response.json();
};