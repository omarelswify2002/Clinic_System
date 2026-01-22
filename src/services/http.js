import { API_CONFIG } from './api/config';
import { storage } from '../shared/utils';

class HttpClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };

    // Initialize with stored token if available
    this.initializeAuth();
  }

  initializeAuth() {
    const token = storage.get('auth_token');
    if (token) {
      this.setAuthToken(token);
    }
  }

  setAuthToken(token) {
    if (token) {
      this.defaultHeaders['Authorization'] = `Bearer ${token}`;
      storage.set('auth_token', token);
    } else {
      delete this.defaultHeaders['Authorization'];
      storage.remove('auth_token');
    }
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      ...options,
      headers: {
        ...this.defaultHeaders,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);

      // Handle different response types
      const contentType = response.headers.get('content-type');
      let data;

      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      if (!response.ok) {
        // Extract error message from response
        let errorMessage = data?.message || data?.error || `HTTP Error: ${response.status}`;

        // If there are validation details, include them
        if (data?.details && Array.isArray(data.details)) {
          errorMessage = `${errorMessage}: ${data.details.join(', ')}`;
        }

        console.error('API Error Response:', {
          status: response.status,
          url,
          data,
          errorMessage
        });
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('HTTP Request failed:', error);
      throw error;
    }
  }

  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'GET' });
  }

  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: 'DELETE' });
  }
}

// Initialize with base URL from config
export const httpClient = new HttpClient(API_CONFIG.BASE_URL);

