import { apiClient } from '../client';

export const INITIAL_PROMOTIONS = [];

export const promotionsApi = {
  // Every call goes to the server; errors are passed on so the page can show them
  // (a promotion that only exists in this browser could never be used by customers).
  getPromotions: async (params = {}) => {
    const res = await apiClient.get('/promotions', { params });
    return Array.isArray(res.data?.data) ? res.data.data : [];
  },

  getPromotionById: async (id) => {
    const res = await apiClient.get(`/promotions/${id}`);
    return res.data?.data;
  },

  createPromotion: async (promoData) => {
    const res = await apiClient.post('/promotions', promoData);
    return res.data?.data;
  },

  updatePromotion: async (id, updatedData) => {
    const res = await apiClient.put(`/promotions/${id}`, updatedData);
    return res.data?.data;
  },

  toggleStatus: async (id) => {
    const res = await apiClient.patch(`/promotions/${id}/toggle`);
    return res.data?.data;
  },

  deletePromotion: async (id) => {
    const res = await apiClient.delete(`/promotions/${id}`);
    return res.data;
  },

  /**
   * Validate promo code (Used at checkout)
   */
  validatePromotion: async (validationPayload) => {
    try {
      const res = await apiClient.post('/promotions/validate', validationPayload);
      return res.data?.data;
    } catch (e) {
      const msg = e.response?.data?.message || e.message;
      return { valid: false, message: msg };
    }
  }
};
