import { apiClient } from '../client';

export const riderApi = {
  // Search & List Riders
  getRiders: async ({ search = '', accountStatus = '', availabilityStatus = '', page = 1, limit = 50 } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (accountStatus) params.accountStatus = accountStatus;
    if (availabilityStatus) params.availabilityStatus = availabilityStatus;

    const res = await apiClient.get('/admin/riders', { params });
    return res.data;
  },

  // Admin Direct Rider Registration (Auto-approved)
  createRider: async (riderData) => {
    const res = await apiClient.post('/admin/riders', riderData);
    return res.data;
  },

  // Get Rider Details, Active Tasks & Performance Stats
  getRiderById: async (id) => {
    const res = await apiClient.get(`/admin/riders/${id}`);
    return res.data;
  },

  // Update Rider Information
  updateRider: async (id, updatedData) => {
    const res = await apiClient.put(`/admin/riders/${id}`, updatedData);
    return res.data;
  },

  // Approve Pending Rider Application (Switches to ACTIVE)
  approveRider: async (id) => {
    const res = await apiClient.patch(`/admin/riders/${id}/approve`);
    return res.data;
  },

  // Suspend or Reactivate Rider Account (ACTIVE / SUSPENDED)
  updateRiderStatus: async (id, status) => {
    const res = await apiClient.patch(`/admin/riders/${id}/status`, { status });
    return res.data;
  },

  // Toggle Rider Deactivation (Active <-> Inactive / Deactivated)
  toggleDeactivation: async (id) => {
    const res = await apiClient.patch(`/admin/riders/${id}/deactivate`);
    return res.data;
  },

  // Soft Delete Rider Account (preserves delivery history)
  deleteRider: async (id) => {
    const res = await apiClient.delete(`/admin/riders/${id}`);
    return res.data;
  },

  // Get Rider Payouts Summary across all riders
  getPayoutsSummary: async () => {
    const res = await apiClient.get('/admin/riders/payouts');
    return res.data;
  },

  // Get Single Rider Payout & Delivery History
  getRiderPayoutHistory: async (id) => {
    const res = await apiClient.get(`/admin/riders/${id}/payouts`);
    return res.data;
  },

  // Mark Rider as Paid
  markRiderPaid: async (id, paymentData) => {
    const res = await apiClient.post(`/admin/riders/${id}/pay`, paymentData);
    return res.data;
  },
};
