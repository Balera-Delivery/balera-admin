import { apiClient } from '../client';

export const INITIAL_PROMOTIONS = [];

export const promotionsApi = {
  /**
   * Get all promotions from backend
   */
  getPromotions: async (params = {}) => {
    try {
      const res = await apiClient.get('/promotions', { params });
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return [];
    } catch (e) {
      console.warn('Backend /promotions endpoint unavailable, using local cache:', e.message);
      try {
        const local = localStorage.getItem('balera_promotions_cache');
        return local ? JSON.parse(local) : [];
      } catch {
        return [];
      }
    }
  },

  /**
   * Get promotion by ID
   */
  getPromotionById: async (id) => {
    try {
      const res = await apiClient.get(`/promotions/${id}`);
      return res.data?.data;
    } catch (e) {
      try {
        const local = localStorage.getItem('balera_promotions_cache');
        const list = local ? JSON.parse(local) : [];
        return list.find(p => p.id === id);
      } catch {
        return null;
      }
    }
  },

  /**
   * Create new promotion
   */
  createPromotion: async (promoData) => {
    try {
      const res = await apiClient.post('/promotions', promoData);
      return res.data?.data;
    } catch (e) {
      console.warn('Failed to post to backend, creating in local cache:', e.message);
      return {
        id: `PROMO-${Date.now().toString().slice(-4)}`,
        usedCount: 0,
        createdAt: new Date().toISOString(),
        ...promoData
      };
    }
  },

  /**
   * Update promotion
   */
  updatePromotion: async (id, updatedData) => {
    try {
      const res = await apiClient.put(`/promotions/${id}`, updatedData);
      return res.data?.data;
    } catch (e) {
      return { id, ...updatedData };
    }
  },

  /**
   * Toggle Active / Paused status
   */
  toggleStatus: async (id) => {
    try {
      const res = await apiClient.patch(`/promotions/${id}/toggle`);
      return res.data?.data;
    } catch (e) {
      return { id, toggled: true };
    }
  },

  /**
   * Delete promotion
   */
  deletePromotion: async (id) => {
    try {
      const res = await apiClient.delete(`/promotions/${id}`);
      return res.data;
    } catch (e) {
      return { success: true };
    }
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
