import { apiClient } from '../client';

export const deliveryApi = {
  // List & Filter All Platform Deliveries
  getDeliveries: async ({ status = '', search = '', customerId = '', riderId = '', startDate = '', endDate = '', page = 1, limit = 50 } = {}) => {
    const params = { page, limit };
    if (status && status !== 'All Status') params.status = status;
    if (search) params.search = search;
    if (customerId) params.customerId = customerId;
    if (riderId) params.riderId = riderId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await apiClient.get('/admin/deliveries', { params });
    return res.data;
  },

  // Get Complete Delivery Details & Step-by-Step Status Audit Trail
  getDeliveryById: async (id) => {
    // Strip leading '#' if present
    const cleanId = String(id).replace('#', '');
    const res = await apiClient.get(`/admin/deliveries/${cleanId}`);
    return res.data;
  },

  // Assign Delivery to Online Rider
  assignRider: async (deliveryId, riderId) => {
    const cleanId = String(deliveryId).replace('#', '');
    const res = await apiClient.put(`/admin/deliveries/${cleanId}/assign`, { riderId });
    return res.data;
  },

  // Reassign Delivery to Another Online Rider
  reassignRider: async (deliveryId, riderId) => {
    const cleanId = String(deliveryId).replace('#', '');
    const res = await apiClient.put(`/admin/deliveries/${cleanId}/reassign`, { riderId });
    return res.data;
  },

  // Cancel Delivery by Admin
  cancelDelivery: async (deliveryId, reason = 'Admin cancelled via dashboard') => {
    const cleanId = String(deliveryId).replace('#', '');
    const res = await apiClient.post(`/admin/deliveries/${cleanId}/cancel`, { reason });
    return res.data;
  },

  // Update & Verify Customer Payment Status
  updatePaymentStatus: async (deliveryId, paymentStatus) => {
    const cleanId = String(deliveryId).replace('#', '');
    const res = await apiClient.patch(`/admin/deliveries/${cleanId}/payment-status`, { paymentStatus });
    return res.data;
  },

  // Update Delivery Status (Admin / Support Override)
  updateDeliveryStatus: async (deliveryId, status, notes = '') => {
    const cleanId = String(deliveryId).replace('#', '');
    const res = await apiClient.patch(`/admin/deliveries/${cleanId}/status`, { status, notes });
    return res.data;
  },
};
