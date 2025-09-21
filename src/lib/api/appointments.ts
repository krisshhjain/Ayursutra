// API utilities for appointment booking system

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Types for appointment system
export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
  isBooked?: boolean;
  duration?: number;
}

export interface SlotAvailability {
  date: string;
  timezone: string;
  slots: TimeSlot[];
  practitionerName?: string;
}

export interface Appointment {
  _id: string;
  practitionerId: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization?: string;
  };
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  date: string;
  slotStartUtc: string;
  slotEndUtc: string;
  duration: number;
  status: 'requested' | 'confirmed' | 'cancelled' | 'completed' | 'rescheduled';
  notes?: string;
  createdBy: 'patient' | 'practitioner';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentRequest {
  practitionerId: string;
  date: string;
  slotStartUtc: string;
  duration?: number;
  notes?: string;
}

export interface UpdateAppointmentRequest {
  action: 'cancel' | 'reschedule';
  reason?: string;
  newDate?: string;
  newSlotStartUtc?: string;
}

export interface Practitioner {
  _id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  experience?: number;
  qualifications?: string[];
  profileImage?: string;
}

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` })
  };
};

// API functions
export const appointmentAPI = {
  // Get available slots for a practitioner on a specific date
  async getAvailability(practitionerId: string, date: string): Promise<SlotAvailability> {
    const response = await fetch(
      `${API_BASE_URL}/appointments/practitioner/${practitionerId}/availability?date=${date}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch availability');
    }

    const data = await response.json();
    return data.data;
  },

  // Create a new appointment request
  async createAppointment(appointmentData: CreateAppointmentRequest): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        // Handle conflict with next available slots
        throw new Error(data.message || 'Time slot not available');
      }
      throw new Error(data.message || 'Failed to create appointment');
    }

    return data.data;
  },

  // Get user's appointments
  async getAppointments(params?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }): Promise<{ appointments: Appointment[]; total: number; pages: number }> {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append('status', params.status);
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/appointments?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }

    const data = await response.json();
    return data.data;
  },

  // Get specific appointment
  async getAppointment(appointmentId: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch appointment');
    }

    const data = await response.json();
    return data.data;
  },

  // Update appointment (cancel/reschedule)
  async updateAppointment(
    appointmentId: string,
    updateData: UpdateAppointmentRequest
  ): Promise<Appointment> {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(updateData),
    });

    const data = await response.json();

    if (!response.ok) {
      if (response.status === 409) {
        throw new Error(data.message || 'Requested time slot not available');
      }
      throw new Error(data.message || 'Failed to update appointment');
    }

    return data.data;
  },

  // Confirm appointment (practitioner only)
  async confirmAppointment(appointmentId: string): Promise<{
    appointment: Appointment;
    calendarInfo: any;
  }> {
    const response = await fetch(`${API_BASE_URL}/appointments/${appointmentId}/confirm`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to confirm appointment');
    }

    return data.data;
  },

  // Get practitioners (for booking)
  async getPractitioners(): Promise<Practitioner[]> {
    const response = await fetch(`${API_BASE_URL}/appointments/practitioners`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch practitioners');
    }

    const data = await response.json();
    return data.data || [];
  }
};

// Utility functions
export const appointmentUtils = {
  // Format slot time for display
  formatSlotTime(isoString: string): string {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  },

  // Format date for display
  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'requested': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'rescheduled': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  },

  // Check if appointment can be modified
  canModifyAppointment(appointment: Appointment): boolean {
    return ['requested', 'confirmed'].includes(appointment.status);
  },

  // Get next 7 days for availability check
  getNext7Days(): string[] {
    const dates: string[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    
    return dates;
  },

  // Convert UTC time to local time string
  toLocalTimeString(utcString: string): string {
    return new Date(utcString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }
};