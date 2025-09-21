// API utilities for review system

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

// Types for review system
export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  recommendationRate: number;
  ratingDistribution: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  aspectAverages: {
    effectiveness: number;
    communication: number;
    comfort: number;
    value: number;
  } | null;
}

export interface Review {
  _id: string;
  appointmentId: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
  };
  practitionerId: string;
  rating: number;
  reviewText?: string;
  aspects: {
    effectiveness: number;
    communication: number;
    comfort: number;
    value: number;
  };
  wouldRecommend: boolean;
  isAnonymous: boolean;
  isVisible: boolean;
  helpfulCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReviewRequest {
  appointmentId: string;
  rating: number;
  reviewText?: string;
  aspects: {
    effectiveness: number;
    communication: number;
    comfort: number;
    value: number;
  };
  wouldRecommend: boolean;
  isAnonymous?: boolean;
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
export const reviewAPI = {
  // Check if review exists for an appointment
  async checkReviewExists(appointmentId: string): Promise<boolean> {
    const response = await fetch(
      `${API_BASE_URL}/reviews/appointment/${appointmentId}/exists`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check review status');
    }

    const data = await response.json();
    return data.exists;
  },

  // Create a new review
  async createReview(reviewData: CreateReviewRequest): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(reviewData),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to create review');
    }

    return data.data;
  },

  // Get reviews for a practitioner
  async getPractitionerReviews(practitionerId: string, params?: {
    page?: number;
    limit?: number;
    rating?: number;
    sortBy?: 'createdAt' | 'rating-high' | 'rating-low' | 'helpful';
  }): Promise<{
    reviews: Review[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
    stats: ReviewStats;
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.rating) queryParams.append('rating', params.rating.toString());
    if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

    const response = await fetch(
      `${API_BASE_URL}/reviews/practitioner/${practitionerId}?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch practitioner reviews');
    }

    const data = await response.json();
    return data.data;
  },

  // Get practitioner stats only (lightweight call for selection UI)
  async getPractitionerStats(practitionerId: string): Promise<ReviewStats> {
    console.log('Fetching stats for practitioner:', practitionerId);
    const response = await fetch(
      `${API_BASE_URL}/reviews/practitioner/${practitionerId}?limit=0`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    console.log('Review stats response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Review stats error:', errorText);
      throw new Error('Failed to fetch practitioner stats');
    }

    const data = await response.json();
    console.log('Review stats data:', data);
    return data.data.stats;
  },

  // Get patient's own reviews
  async getMyReviews(params?: {
    page?: number;
    limit?: number;
  }): Promise<{
    reviews: Review[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalReviews: number;
      hasNext: boolean;
      hasPrev: boolean;
    };
  }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await fetch(
      `${API_BASE_URL}/reviews/patient/my-reviews?${queryParams.toString()}`,
      {
        method: 'GET',
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch my reviews');
    }

    const data = await response.json();
    return data.data;
  },

  // Update a review
  async updateReview(reviewId: string, updates: Partial<CreateReviewRequest>): Promise<Review> {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(updates),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to update review');
    }

    return data.data;
  },

  // Delete a review
  async deleteReview(reviewId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/reviews/${reviewId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.message || 'Failed to delete review');
    }
  }
};

// Utility functions
export const reviewUtils = {
  // Format review date
  formatReviewDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  },

  // Get aspect name display
  getAspectName(aspect: string): string {
    const aspects: Record<string, string> = {
      effectiveness: 'Treatment Effectiveness',
      communication: 'Communication',
      comfort: 'Comfort & Environment',
      value: 'Value for Money'
    };
    return aspects[aspect] || aspect;
  },

  // Calculate overall rating from aspects
  calculateOverallRating(aspects: { effectiveness: number; communication: number; comfort: number; value: number }): number {
    const { effectiveness, communication, comfort, value } = aspects;
    return Math.round(((effectiveness + communication + comfort + value) / 4) * 10) / 10;
  },

  // Get rating color
  getRatingColor(rating: number): string {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 3.5) return 'text-yellow-600';
    if (rating >= 2.5) return 'text-orange-600';
    return 'text-red-600';
  },

  // Truncate review text
  truncateReview(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  }
};