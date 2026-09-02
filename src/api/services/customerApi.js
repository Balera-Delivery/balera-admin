import { apiClient } from '../client';

export const customerApi = {
  // Search & List All Customers
  getCustomers: async ({ search = '', status = '', page = 1, limit = 50 } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (status && status !== 'All') params.status = status;

    const res = await apiClient.get('/admin/customers', { params });
    return res.data;
  },

  // Admin Direct Customer Registration
  createCustomer: async (customerData) => {
    const res = await apiClient.post('/admin/customers', customerData);
    return res.data;
  },

  // Get Customer Details & Entire Order History
  getCustomerById: async (id) => {
    const res = await apiClient.get(`/admin/customers/${id}`);
    return res.data;
  },

  // Update Customer Information
  updateCustomer: async (id, updatedData) => {
    const res = await apiClient.put(`/admin/customers/${id}`, updatedData);
    return res.data;
  },

  // Suspend or Reactivate Customer Account (ACTIVE / SUSPENDED)
  updateCustomerStatus: async (id, status) => {
    const res = await apiClient.patch(`/admin/customers/${id}/status`, { status });
    return res.data;
  },
};
