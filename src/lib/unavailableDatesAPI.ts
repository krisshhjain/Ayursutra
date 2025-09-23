const API_BASE_URL = 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
};

export const unavailableDatesAPI = {
  // Get all unavailable dates for the authenticated practitioner
  getAll: async (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await fetch(`${API_BASE_URL}/unavailable-dates?${params}`, {
      headers: getAuthHeaders()
    });
    
    return response.json();
  },

  // Add new unavailable date(s)
  add: async (data: {
    date?: string;
    dates?: string[];
    reason?: string;
    isRecurring?: boolean;
    recurringType?: 'weekly' | 'monthly' | 'yearly';
    recurringEndDate?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/unavailable-dates`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    });
    
    return response.json();
  },

  // Remove unavailable date by ID
  removeById: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/unavailable-dates/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return response.json();
  },

  // Remove unavailable date by date
  removeByDate: async (date: string) => {
    const response = await fetch(`${API_BASE_URL}/unavailable-dates/date/${date}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    
    return response.json();
  },

  // Check if a specific date is unavailable
  checkDate: async (date: string) => {
    const response = await fetch(`${API_BASE_URL}/unavailable-dates/check/${date}`, {
      headers: getAuthHeaders()
    });
    
    return response.json();
  },

  // Bulk remove multiple dates
  bulkRemove: async (dates: string[]) => {
    const response = await fetch(`${API_BASE_URL}/unavailable-dates/bulk-remove`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ dates })
    });
    
    return response.json();
  }
};

export default unavailableDatesAPI;