import { apiClient } from '../client';

export const hotelApi = {
  /**
   * Get all partner establishments, menus & statistics
   */
  getHotels: async ({ search = '', category = '', status = '', page = 1, limit = 100 } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (category && category !== 'All') params.category = category;
    if (status && status !== 'All') params.status = status;

    const res = await apiClient.get('/admin/restaurants', { params });
    return res.data;
  },

  /**
   * Get complete hotel/restaurant profile and menu items
   */
  getHotelById: async (id) => {
    const res = await apiClient.get(`/admin/restaurants/${id}`);
    return res.data;
  },

  /**
   * Register new partner establishment
   */
  createHotel: async (hotelData) => {
    const res = await apiClient.post('/admin/restaurants', hotelData);
    return res.data;
  },

  /**
   * Update hotel/restaurant details
   */
  updateHotel: async (id, updatedData) => {
    const res = await apiClient.put(`/admin/restaurants/${id}`, updatedData);
    return res.data;
  },

  /**
   * Toggle Active / Inactive status
   */
  toggleHotelStatus: async (id, status) => {
    const res = await apiClient.patch(`/admin/restaurants/${id}/status`, { status });
    return res.data;
  },

  /**
   * Quick update hotel phone numbers
   */
  updateHotelPhones: async (id, phone1, phone2) => {
    const res = await apiClient.patch(`/admin/restaurants/${id}/phones`, { phone1, phone2 });
    return res.data;
  },

  /**
   * Delete hotel & restaurant profile
   */
  deleteHotel: async (id) => {
    const res = await apiClient.delete(`/admin/restaurants/${id}`);
    return res.data;
  },

  /**
   * Add new food dish to a restaurant
   */
  addFoodItem: async (hotelId, foodData) => {
    const res = await apiClient.post(`/admin/restaurants/${hotelId}/foods`, foodData);
    return res.data;
  },

  /**
   * Update food dish item
   */
  updateFoodItem: async (foodId, foodData) => {
    const res = await apiClient.put(`/admin/foods/${foodId}`, foodData);
    return res.data;
  },

  /**
   * Toggle food item in-stock / out-of-stock
   */
  toggleFoodAvailability: async (foodId, isAvailable) => {
    const res = await apiClient.patch(`/admin/foods/${foodId}/availability`, { isAvailable });
    return res.data;
  },

  /**
   * Delete food dish item
   */
  deleteFoodItem: async (foodId) => {
    const res = await apiClient.delete(`/admin/foods/${foodId}`);
    return res.data;
  },

  /**
   * Master foods explorer across all establishments
   */
  getMasterFoods: async ({ search = '', restaurantId = '', category = '', isAvailable, page = 1, limit = 100 } = {}) => {
    const params = { page, limit };
    if (search) params.search = search;
    if (restaurantId && restaurantId !== 'All') params.restaurantId = restaurantId;
    if (category && category !== 'All') params.category = category;
    if (isAvailable !== undefined) params.isAvailable = isAvailable;

    const res = await apiClient.get('/admin/foods', { params });
    return res.data;
  },

  /**
   * Seed / Sync Default Bale Robe Establishments into Database
   */
  seedDefaults: async (force = false) => {
    const res = await apiClient.post('/admin/restaurants/seed-defaults', { force });
    return res.data;
  },
};
