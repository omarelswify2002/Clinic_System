import { API_CONFIG } from './config';
import { mockAuthService } from '../mock';
import { httpClient } from '../http';
import { storage } from '../../shared/utils';

// Real API implementation (to be used when backend is ready)
const realAuthApi = {
  login: async (username, password) => {
    const response = await httpClient.post('/auth/login', { username, password });

    // Backend returns: { token, role, name }
    // Frontend expects: { user, token }
    const user = {
      id: username, // Backend doesn't return user ID in login
      username: response.name || username,
      name: response.name || username,
      role: response.role,
    };

    // Store user data
    storage.set('current_user', user);
    storage.set('auth_token', response.token);

    return {
      user,
      token: response.token,
    };
  },

  logout: async () => {
    // Backend doesn't have logout endpoint, just clear local storage
    storage.remove('auth_token');
    storage.remove('current_user');
    return { success: true };
  },

  getCurrentUser: async () => {
    const user = storage.get('current_user');
    const token = storage.get('auth_token');

    if (!user || !token) {
      return null;
    }

    // In a real app, you might want to verify the token with the backend
    // For now, just return stored data
    return { user, token };
  },

  verifyToken: async (token) => {
    // Backend doesn't have verify endpoint
    // Just check if token exists
    return !!token;
  },
};

// Export the appropriate implementation based on config
export const authApi = new Proxy({}, {
  get: (target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockAuthService : realAuthApi;
    return service[prop];
  }
});

