import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Request Interceptor: attach the admin's JWT (from a real sign-in only)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('balerra_admin_token');
    if (token && !config.url?.includes('/auth/admin/login')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: when the session is no longer valid, sign out and go to the login page
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const url = error.config?.url || '';
    if (error.response?.status === 401 && !url.includes('/auth/admin/login')) {
      localStorage.removeItem('balerra_admin_token');
      localStorage.removeItem('balerra_admin_user');
      localStorage.removeItem('balerra_admin_token_refreshed_at');
      if (window.location.pathname !== '/login') {
        localStorage.setItem('balerra_admin_return_to', window.location.pathname + window.location.search);
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

// Health check to check if backend is reachable
export const checkBackendHealth = async () => {
  try {
    const res = await apiClient.get('/health', { timeout: 4000 });
    return { isOnline: true, data: res.data };
  } catch (err) {
    return { isOnline: false, error: err.message };
  }
};
