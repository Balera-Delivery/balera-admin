import { apiClient } from '../client';

export const settingsApi = {
  // Get Platform Settings
  getSettings: async () => {
    const res = await apiClient.get('/admin/settings');
    return res.data;
  },

  // Update Platform Setting
  updateSetting: async (key, value) => {
    const res = await apiClient.put('/admin/settings', { key, value });
    return res.data;
  },
};
