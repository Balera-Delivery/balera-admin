import { apiClient } from '../client';

export const authApi = {
  // Admin Login
  adminLogin: async (email, password) => {
    const res = await apiClient.post('/auth/admin/login', { email, password });
    return res.data;
  },

  // Get current user profile
  getMe: async () => {
    const res = await apiClient.get('/auth/me');
    return res.data;
  },

  // Change admin password
  changePassword: async (currentPassword, newPassword) => {
    const res = await apiClient.put('/auth/change-password', {
      currentPassword,
      newPassword,
    });
    return res.data;
  },

  // Logout session
  logout: async () => {
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignore network errors on logout
    }
  },
};
