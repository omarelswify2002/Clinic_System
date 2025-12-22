// API Configuration
export const API_CONFIG = {
  USE_MOCK: true, // Set to false when real backend is ready
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
  TIMEOUT: 30000,
};

export const setUseMock = (useMock) => {
  API_CONFIG.USE_MOCK = useMock;
};

