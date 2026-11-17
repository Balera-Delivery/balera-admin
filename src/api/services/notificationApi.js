import { apiClient } from '../client';

export const notificationApi = {
  // Get User Notifications Feed (Bell Icon 🔔)
  getNotifications: async ({ page = 1, limit = 50 } = {}) => {
    const res = await apiClient.get('/notifications', { params: { page, limit } });
    return res.data;
  },

  // Mark Single Notification as Read
  markAsRead: async (id) => {
    const res = await apiClient.put(`/notifications/${id}/read`);
    return res.data;
  },

  // Mark All Notifications as Read
  markAllAsRead: async () => {
    const res = await apiClient.put('/notifications/read-all');
    return res.data;
  },

  // Delete Single Notification
  deleteNotification: async (id) => {
    const res = await apiClient.delete(`/notifications/${id}`);
    return res.data;
  },

  // Clear All Notifications
  clearAllNotifications: async () => {
    const res = await apiClient.delete('/notifications');
    return res.data;
  },

  // Admin Send Broadcast or Targeted Notification
  sendNotification: async ({ targetRole = 'ALL', targetUserId = null, title, message }) => {
    const payload = { targetRole, title, message };
    if (targetUserId) payload.targetUserId = targetUserId;
    const res = await apiClient.post('/notifications/send', payload);
    return res.data;
  },
};
