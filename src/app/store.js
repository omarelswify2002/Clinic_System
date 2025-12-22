import { create } from 'zustand';
import { authApi } from '../services/api';
import { SYNC_STATUS } from '../shared/constants';

// Auth Store
export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (username, password) => {
    set({ isLoading: true, error: null });
    try {
      const { user, token } = await authApi.login(username, password);
      set({ user, token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ error: error.message, isLoading: false });
      return { success: false, error: error.message };
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authApi.logout();
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Logout error:', error);
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const result = await authApi.getCurrentUser();
      if (result) {
        set({ user: result.user, token: result.token, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      set({ isLoading: false });
      console.error('Auth check error:', error);
    }
  },

  clearError: () => set({ error: null }),
}));

// System Store (for offline/online status)
export const useSystemStore = create((set) => ({
  syncStatus: navigator.onLine ? SYNC_STATUS.ONLINE : SYNC_STATUS.OFFLINE,
  lastSyncTime: null,
  notifications: [],

  setSyncStatus: (status) => set({ syncStatus: status }),

  setLastSyncTime: (time) => set({ lastSyncTime: time }),

  addNotification: (notification) => set((state) => ({
    notifications: [...state.notifications, { id: Date.now(), ...notification }]
  })),

  removeNotification: (id) => set((state) => ({
    notifications: state.notifications.filter(n => n.id !== id)
  })),

  clearNotifications: () => set({ notifications: [] }),

  // Initialize online/offline listeners
  initializeNetworkListeners: () => {
    const handleOnline = () => set({ syncStatus: SYNC_STATUS.ONLINE });
    const handleOffline = () => set({ syncStatus: SYNC_STATUS.OFFLINE });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },
}));

// UI Store (for global UI state)
export const useUIStore = create((set) => ({
  sidebarOpen: true,
  theme: 'light',
  
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setTheme: (theme) => set({ theme }),
}));

