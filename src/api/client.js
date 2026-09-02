import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
});

// Helper to auto-authenticate admin if token is missing
let tokenPromise = null;
const getOrFetchAdminToken = async () => {
  let token = localStorage.getItem('balerra_admin_token');
  if (token && !token.startsWith('demo-')) {
    return token;
  }

  // Deduplicate concurrent token requests
  if (!tokenPromise) {
    tokenPromise = axios.post(`${API_BASE_URL}/auth/admin/login`, {
      email: 'admin@balera.com',
      password: 'AdminPassword@123'
    }).then(res => {
      const acquiredToken = res.data?.data?.token || res.data?.token;
      if (acquiredToken) {
        localStorage.setItem('balerra_admin_token', acquiredToken);
        return acquiredToken;
      }
      return null;
    }).catch(err => {
      console.warn('Auto admin login notice:', err.message);
      return null;
    }).finally(() => {
      tokenPromise = null;
    });
  }

  return tokenPromise;
};

// Request Interceptor: Attach JWT Token
apiClient.interceptors.request.use(
  async (config) => {
    // Skip token fetching for auth login and health routes
    if (config.url?.includes('/auth/admin/login') || config.url?.includes('/health')) {
      return config;
    }

    const token = await getOrFetchAdminToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 & Normalize Errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // If 401 received and not yet retried, refresh admin token and retry once
    if (error.response && error.response.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/admin/login')) {
      originalRequest._retry = true;
      localStorage.removeItem('balerra_admin_token');
      const newToken = await getOrFetchAdminToken();
      if (newToken) {
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
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
