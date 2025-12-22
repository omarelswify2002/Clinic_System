import { mockUsers } from './mockData';
import { storage } from '../../shared/utils';

const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const mockAuthService = {
  async login(username, password) {
    await delay();
    
    const user = mockUsers.find(
      u => u.username === username && u.password === password
    );

    if (!user) {
      throw new Error('Invalid credentials');
    }

    const { password: _, ...userWithoutPassword } = user;
    const token = `mock_token_${user.id}_${Date.now()}`;
    
    storage.set('auth_token', token);
    storage.set('current_user', userWithoutPassword);

    return {
      user: userWithoutPassword,
      token,
    };
  },

  async logout() {
    await delay(200);
    storage.remove('auth_token');
    storage.remove('current_user');
    return { success: true };
  },

  async getCurrentUser() {
    await delay(200);
    const user = storage.get('current_user');
    const token = storage.get('auth_token');
    
    if (!user || !token) {
      return null;
    }

    return { user, token };
  },

  async verifyToken(token) {
    await delay(200);
    return token && token.startsWith('mock_token_');
  },
};

