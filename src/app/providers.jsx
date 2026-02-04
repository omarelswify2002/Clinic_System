import { RouterProvider } from 'react-router-dom';
import { router } from './router';
import { useEffect } from 'react';
import { useAuthStore } from './store';
import { httpClient } from '../services/http';

export default function AppProviders() {
  const token = useAuthStore((state) => state.token);

  // Restore token to httpClient on app load
  useEffect(() => {
    if (token) {
      httpClient.setAuthToken(token);
    }
  }, [token]);

  return <RouterProvider router={router} />;
}