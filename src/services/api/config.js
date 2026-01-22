// API Configuration
export const API_CONFIG = {
  USE_MOCK: false, // Set to true to use mock data instead of real backend
  BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  TIMEOUT: 30000,
};

export const setUseMock = (useMock) => {
  API_CONFIG.USE_MOCK = useMock;
};

