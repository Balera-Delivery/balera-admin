import { apiClient } from '../client';

export const dashboardApi = {
  // Get Real-time System Metrics & Summary
  getDashboardStats: async () => {
    const res = await apiClient.get('/admin/dashboard');
    return res.data;
  },

  // 🗺️ Live Fleet City Map: Real-time Riders & Active Delivery Pins
  getLiveMap: async () => {
    const res = await apiClient.get('/admin/map/live');
    return res.data;
  },

  // 📍 Proximity Dispatch: Find Closest Online Riders to Pickup Point
  getNearbyRiders: async ({ deliveryId, pickupLat, pickupLng, radiusKm = 50 } = {}) => {
    const params = {};
    if (deliveryId) params.deliveryId = deliveryId;
    if (pickupLat !== undefined) params.pickupLat = pickupLat;
    if (pickupLng !== undefined) params.pickupLng = pickupLng;
    if (radiusKm) params.radiusKm = radiusKm;

    const res = await apiClient.get('/admin/riders/nearby', { params });
    return res.data;
  },
};
