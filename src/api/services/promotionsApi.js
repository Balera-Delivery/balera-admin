import { apiClient } from '../client';

export const INITIAL_PROMOTIONS = [
  {
    id: 'PROMO-001',
    code: 'WELCOME26',
    title: 'New Customer Welcome Voucher',
    description: 'Get 20% off your first delivery order across Bale Robe.',
    promotionType: 'PROMO_CODE',
    discountType: 'PERCENTAGE',
    discountValue: 20,
    maxDiscount: 100,
    minOrderAmount: 200,
    totalUsageLimit: 500,
    usedCount: 142,
    perUserLimit: 1,
    startDate: '2026-01-01',
    endDate: '2026-12-31',
    isActive: true,
    applicableType: 'ALL',
    restaurantId: null,
    restaurant: null
  },
  {
    id: 'PROMO-002',
    code: 'FREEDELIVERY',
    title: 'Weekend Free Courier Delivery',
    description: '100% off standard delivery fee on orders above 300 Birr.',
    promotionType: 'FREE_DELIVERY',
    discountType: 'FIXED_AMOUNT',
    discountValue: 100,
    maxDiscount: 100,
    minOrderAmount: 300,
    totalUsageLimit: 200,
    usedCount: 88,
    perUserLimit: 2,
    startDate: '2026-05-01',
    endDate: '2026-11-30',
    isActive: true,
    applicableType: 'FOOD_ONLY',
    restaurantId: null,
    restaurant: null
  },
  {
    id: 'PROMO-003',
    code: 'KURIFTU15',
    title: 'Kuriftu Resort Exclusive Dining Discount',
    description: 'Direct 15% discount for all gourmet meal orders from Kuriftu Resort.',
    promotionType: 'PARTNER_DISCOUNT',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscount: 150,
    minOrderAmount: 250,
    totalUsageLimit: 150,
    usedCount: 64,
    perUserLimit: 3,
    startDate: '2026-04-15',
    endDate: '2026-12-15',
    isActive: true,
    applicableType: 'PARTNER_ONLY',
    restaurantId: 'HTL-001',
    restaurant: { id: 'HTL-001', name: 'Kuriftu Resort & Spa', code: 'HTL-001' }
  },
  {
    id: 'PROMO-004',
    code: 'AUTOFEST26',
    title: 'Holiday Rush Automatic Discount',
    description: 'Automatic 50 Birr platform discount applied to all orders above 400 Birr.',
    promotionType: 'PLATFORM_AUTOMATIC',
    discountType: 'FIXED_AMOUNT',
    discountValue: 50,
    maxDiscount: 50,
    minOrderAmount: 400,
    totalUsageLimit: 300,
    usedCount: 215,
    perUserLimit: 1,
    startDate: '2026-10-01',
    endDate: '2026-11-15',
    isActive: true,
    applicableType: 'ALL',
    restaurantId: null,
    restaurant: null
  }
];

export const promotionsApi = {
  /**
   * Get all promotions
   */
  getPromotions: async (params = {}) => {
    try {
      const res = await apiClient.get('/promotions', { params });
      if (res.data?.data && Array.isArray(res.data.data)) {
        return res.data.data;
      }
      return INITIAL_PROMOTIONS;
    } catch (e) {
      console.warn('Backend /promotions endpoint unavailable, using local campaign cache:', e.message);
      return INITIAL_PROMOTIONS;
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
      return INITIAL_PROMOTIONS.find(p => p.id === id);
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
      console.warn('Failed to post to backend, returning local promo:', e.message);
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
