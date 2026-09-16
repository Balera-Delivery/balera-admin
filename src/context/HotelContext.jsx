import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { initialHotels } from '../data/hotelData';
import { hotelApi } from '../api/services/hotelApi';

const HotelContext = createContext();

const STORAGE_KEY = 'balera_hotels_data_v1';

// Helper to normalize backend restaurant object for frontend UI
const normalizeHotel = (h) => {
  const hotelId = h.code || h.id;
  const backendId = h.id;

  return {
    id: hotelId,
    backendId: backendId,
    code: h.code || hotelId,
    name: h.name || 'Partner Restaurant',
    aliases: Array.isArray(h.aliases) ? h.aliases : [],
    category: h.category || 'Cafe & Restaurant',
    cuisineType: h.cuisineType || 'Local & Traditional Cuisine',
    phone1: h.phone1 || '',
    phone2: h.phone2 || '',
    address: h.address || 'Bale Robe, Ethiopia',
    latitude: h.latitude || null,
    longitude: h.longitude || null,
    rating: Number(h.rating) || 4.8,
    totalReviews: Number(h.totalReviews) || 0,
    deliveryTime: h.deliveryTime || '25 - 40 min',
    deliveryFee: Number(h.deliveryFee) || 60,
    priceRange: h.priceRange || '$$',
    status: h.status || 'Active',
    openingHours: h.openingHours || '07:00 AM - 10:00 PM',
    isPartner: h.isPartner !== undefined ? h.isPartner : true,
    banner: h.banner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    avatar: h.avatar || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80',
    foods: Array.isArray(h.foods)
      ? h.foods.map((f) => ({
          id: f.code || f.id,
          backendId: f.id,
          code: f.code || f.id,
          restaurantId: f.restaurantId || backendId,
          name: f.name || 'Dish Item',
          category: f.category || 'Main Dishes',
          price: Number(f.price) || 0,
          description: f.description || '',
          isAvailable: f.isAvailable !== undefined ? f.isAvailable : true,
          tag: f.tag || '',
          image: f.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
        }))
      : [],
  };
};

export const HotelProvider = ({ children }) => {
  const [hotels, setHotels] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load hotels from storage:', e);
    }
    return initialHotels;
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendStats, setBackendStats] = useState(null);

  // Persist to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(hotels));
    } catch (e) {
      console.error('Failed to persist hotels to storage:', e);
    }
  }, [hotels]);

  // Fetch hotels from PostgreSQL backend on mount
  const fetchHotels = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await hotelApi.getHotels({ limit: 100 });
      if (res && res.data) {
        const rawList = res.data.restaurants || [];
        if (rawList.length > 0) {
          const normalized = rawList.map(normalizeHotel);
          setHotels(normalized);
          setIsBackendConnected(true);
          if (res.data.stats) {
            setBackendStats(res.data.stats);
          }
        } else {
          // Empty in DB: attempt auto-seed
          const seedRes = await hotelApi.seedDefaults(false);
          if (seedRes && seedRes.data) {
            const refreshRes = await hotelApi.getHotels({ limit: 100 });
            if (refreshRes?.data?.restaurants) {
              setHotels(refreshRes.data.restaurants.map(normalizeHotel));
              setIsBackendConnected(true);
            }
          }
        }
      }
    } catch (err) {
      console.warn('Backend hotels fetch notice (using offline/local cache):', err.message);
      setIsBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHotels();
  }, [fetchHotels]);

  // Hotel Actions
  const addHotel = useCallback(async (hotelData) => {
    setIsSyncing(true);
    const nextNum = hotels.length + 1;
    const tempId = `HTL-${String(nextNum).padStart(3, '0')}`;
    const localHotel = {
      id: tempId,
      backendId: tempId,
      code: tempId,
      name: hotelData.name || 'New Hotel & Restaurant',
      aliases: hotelData.aliases || [],
      category: hotelData.category || 'Cafe & Restaurant',
      cuisineType: hotelData.cuisineType || 'Local & Traditional Cuisine',
      phone1: hotelData.phone1 || '',
      phone2: hotelData.phone2 || '',
      address: hotelData.address || 'Bale Robe, Ethiopia',
      rating: Number(hotelData.rating) || 4.8,
      totalReviews: Number(hotelData.totalReviews) || 0,
      deliveryTime: hotelData.deliveryTime || '25 - 40 min',
      deliveryFee: Number(hotelData.deliveryFee) || 60,
      priceRange: hotelData.priceRange || '$$',
      status: hotelData.status || 'Active',
      openingHours: hotelData.openingHours || '07:00 AM - 10:00 PM',
      isPartner: true,
      banner: hotelData.banner || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      avatar: hotelData.avatar || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&auto=format&fit=crop&q=80',
      foods: hotelData.foods || [],
    };

    // Optimistic UI update
    setHotels((prev) => [localHotel, ...prev]);

    try {
      const res = await hotelApi.createHotel({
        name: localHotel.name,
        aliases: localHotel.aliases,
        category: localHotel.category,
        cuisineType: localHotel.cuisineType,
        phone1: localHotel.phone1,
        phone2: localHotel.phone2,
        address: localHotel.address,
        rating: localHotel.rating,
        totalReviews: localHotel.totalReviews,
        deliveryTime: localHotel.deliveryTime,
        deliveryFee: localHotel.deliveryFee,
        priceRange: localHotel.priceRange,
        status: localHotel.status,
        openingHours: localHotel.openingHours,
        isPartner: localHotel.isPartner,
        banner: localHotel.banner,
        avatar: localHotel.avatar,
      });

      if (res?.data) {
        const savedHotel = normalizeHotel(res.data);
        setHotels((prev) => prev.map((h) => (h.id === tempId ? savedHotel : h)));
        return savedHotel;
      }
    } catch (err) {
      console.error('Failed to create hotel on backend:', err);
    } finally {
      setIsSyncing(false);
    }

    return localHotel;
  }, [hotels.length]);

  const updateHotel = useCallback(async (id, updatedFields) => {
    setIsSyncing(true);
    // Optimistic update
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === id || h.backendId === id) {
          return { ...h, ...updatedFields };
        }
        return h;
      })
    );

    try {
      await hotelApi.updateHotel(id, updatedFields);
    } catch (err) {
      console.error('Failed to update hotel on backend:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const deleteHotel = useCallback(async (id) => {
    setIsSyncing(true);
    // Optimistic update
    setHotels((prev) => prev.filter((h) => h.id !== id && h.backendId !== id));

    try {
      await hotelApi.deleteHotel(id);
    } catch (err) {
      console.error('Failed to delete hotel on backend:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const toggleHotelStatus = useCallback(async (id) => {
    setIsSyncing(true);
    let targetStatus = 'Active';

    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === id || h.backendId === id) {
          targetStatus = h.status === 'Active' ? 'Inactive' : 'Active';
          return { ...h, status: targetStatus };
        }
        return h;
      })
    );

    try {
      await hotelApi.toggleHotelStatus(id, targetStatus);
    } catch (err) {
      console.error('Failed to toggle hotel status on backend:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const updateHotelPhones = useCallback(async (id, phone1, phone2) => {
    setIsSyncing(true);
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === id || h.backendId === id) {
          return {
            ...h,
            phone1: phone1 !== undefined ? phone1 : h.phone1,
            phone2: phone2 !== undefined ? phone2 : h.phone2,
          };
        }
        return h;
      })
    );

    try {
      await hotelApi.updateHotelPhones(id, phone1, phone2);
    } catch (err) {
      console.error('Failed to update hotel phones on backend:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  // Food Item Actions
  const addFoodItem = useCallback(async (hotelId, foodData) => {
    setIsSyncing(true);
    const tempFoodId = `FOOD-${String(hotelId).replace('HTL-', '')}-${Date.now().toString().slice(-4)}`;
    const newFood = {
      id: tempFoodId,
      backendId: tempFoodId,
      code: tempFoodId,
      restaurantId: hotelId,
      name: foodData.name || 'New Dish',
      category: foodData.category || 'Main Dishes',
      price: Number(foodData.price) || 0,
      description: foodData.description || '',
      isAvailable: foodData.isAvailable !== undefined ? foodData.isAvailable : true,
      tag: foodData.tag || '',
      image: foodData.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
    };

    // Optimistic UI update
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === hotelId || h.backendId === hotelId) {
          return {
            ...h,
            foods: [newFood, ...(h.foods || [])],
          };
        }
        return h;
      })
    );

    try {
      const res = await hotelApi.addFoodItem(hotelId, {
        name: newFood.name,
        category: newFood.category,
        price: newFood.price,
        description: newFood.description,
        isAvailable: newFood.isAvailable,
        tag: newFood.tag,
        image: newFood.image,
      });

      if (res?.data) {
        const savedFood = {
          id: res.data.code || res.data.id,
          backendId: res.data.id,
          code: res.data.code || res.data.id,
          restaurantId: res.data.restaurantId,
          name: res.data.name,
          category: res.data.category,
          price: Number(res.data.price),
          description: res.data.description,
          isAvailable: res.data.isAvailable,
          tag: res.data.tag,
          image: res.data.image,
        };

        setHotels((prev) =>
          prev.map((h) => {
            if (h.id === hotelId || h.backendId === hotelId) {
              return {
                ...h,
                foods: (h.foods || []).map((f) => (f.id === tempFoodId ? savedFood : f)),
              };
            }
            return h;
          })
        );
        return savedFood;
      }
    } catch (err) {
      console.error('Failed to add food item on backend:', err);
    } finally {
      setIsSyncing(false);
    }

    return newFood;
  }, []);

  const updateFoodItem = useCallback(async (hotelId, foodId, updatedFields) => {
    setIsSyncing(true);
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === hotelId || h.backendId === hotelId) {
          return {
            ...h,
            foods: (h.foods || []).map((f) => {
              if (f.id === foodId || f.backendId === foodId) {
                return {
                  ...f,
                  ...updatedFields,
                  price: updatedFields.price !== undefined ? Number(updatedFields.price) : f.price,
                };
              }
              return f;
            }),
          };
        }
        return h;
      })
    );

    try {
      await hotelApi.updateFoodItem(foodId, updatedFields);
    } catch (err) {
      console.error('Failed to update food item on backend:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const deleteFoodItem = useCallback(async (hotelId, foodId) => {
    setIsSyncing(true);
    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === hotelId || h.backendId === hotelId) {
          return {
            ...h,
            foods: (h.foods || []).filter((f) => f.id !== foodId && f.backendId !== foodId),
          };
        }
        return h;
      })
    );

    try {
      await hotelApi.deleteFoodItem(foodId);
    } catch (err) {
      console.error('Failed to delete food item on backend:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const toggleFoodAvailability = useCallback(async (hotelId, foodId) => {
    setIsSyncing(true);
    let targetAvailability = true;

    setHotels((prev) =>
      prev.map((h) => {
        if (h.id === hotelId || h.backendId === hotelId) {
          return {
            ...h,
            foods: (h.foods || []).map((f) => {
              if (f.id === foodId || f.backendId === foodId) {
                targetAvailability = !f.isAvailable;
                return { ...f, isAvailable: targetAvailability };
              }
              return f;
            }),
          };
        }
        return h;
      })
    );

    try {
      await hotelApi.toggleFoodAvailability(foodId, targetAvailability);
    } catch (err) {
      console.error('Failed to toggle food availability on backend:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const getHotelById = useCallback((id) => {
    if (!id) return null;
    const clean = decodeURIComponent(String(id)).toLowerCase().trim();
    return hotels.find(
      (h) =>
        (h.id && h.id.toLowerCase() === clean) ||
        (h.backendId && h.backendId.toLowerCase() === clean) ||
        (h.code && h.code.toLowerCase() === clean) ||
        (h.name && h.name.toLowerCase() === clean)
    );
  }, [hotels]);

  const resetToDefaults = useCallback(async () => {
    setIsSyncing(true);
    try {
      await hotelApi.seedDefaults(true);
      await fetchHotels();
    } catch (err) {
      console.warn('Reset to defaults backend notice:', err.message);
      setHotels(initialHotels);
      localStorage.removeItem(STORAGE_KEY);
    } finally {
      setIsSyncing(false);
    }
  }, [fetchHotels]);

  // Computed Metrics
  const stats = useMemo(() => {
    const totalHotels = hotels.length;
    const activeHotels = hotels.filter((h) => h.status === 'Active').length;
    let totalFoods = 0;
    let availableFoods = 0;
    let priceSum = 0;

    hotels.forEach((h) => {
      const items = h.foods || [];
      totalFoods += items.length;
      items.forEach((f) => {
        if (f.isAvailable) availableFoods++;
        priceSum += Number(f.price) || 0;
      });
    });

    const averageFoodPrice = totalFoods > 0 ? Math.round(priceSum / totalFoods) : 0;

    return {
      totalHotels,
      activeHotels,
      totalFoods,
      availableFoods,
      outOfStockFoods: totalFoods - availableFoods,
      averageFoodPrice,
    };
  }, [hotels]);

  return (
    <HotelContext.Provider
      value={{
        hotels,
        stats,
        backendStats,
        isLoading,
        isSyncing,
        isBackendConnected,
        fetchHotels,
        addHotel,
        updateHotel,
        deleteHotel,
        toggleHotelStatus,
        updateHotelPhones,
        addFoodItem,
        updateFoodItem,
        deleteFoodItem,
        toggleFoodAvailability,
        getHotelById,
        resetToDefaults,
      }}
    >
      {children}
    </HotelContext.Provider>
  );
};

export const useHotels = () => useContext(HotelContext);
