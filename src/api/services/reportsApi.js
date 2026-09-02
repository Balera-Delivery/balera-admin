import { apiClient } from '../client';

export const reportsApi = {
  // Generate Daily, Weekly, Monthly & Rider Performance Reports
  getReports: async (period = 'all') => {
    const res = await apiClient.get('/admin/reports', { params: { period } });
    return res.data;
  },
};
