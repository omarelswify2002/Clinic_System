import { API_CONFIG } from './config';
import { mockAuthService } from '../mock';
import { httpClient } from '../http';

// Real API implementation (to be used when backend is ready)
const realAuthApi = {
  login: (username, password) => 
    httpClient.post('/auth/login', { username, password }),
  
  logout: () => 
    httpClient.post('/auth/logout'),
  
  getCurrentUser: () => 
    httpClient.get('/auth/me'),
  
  verifyToken: (token) => 
    httpClient.post('/auth/verify', { token }),
};

// Export the appropriate implementation based on config
export const authApi = new Proxy({}, {
  get: (target, prop) => {
    const service = API_CONFIG.USE_MOCK ? mockAuthService : realAuthApi;
    return service[prop];
  }
});

