import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { initialStats, initialCustomers, initialRiders, initialDeliveries, initialPayments } from '../data/mockData';
import { dashboardApi } from '../api/services/dashboardApi';
import { customerApi } from '../api/services/customerApi';
import { riderApi } from '../api/services/riderApi';
import { deliveryApi } from '../api/services/deliveryApi';
import { settingsApi } from '../api/services/settingsApi';
import { checkBackendHealth } from '../api/client';

const DeliveryContext = createContext();

// Helper to normalize delivery status
export const normalizeDeliveryStatus = (s) => {
  if (!s) return 'Pending';
  const upper = String(s).toUpperCase();
  switch (upper) {
    case 'PENDING': return 'Pending';
    case 'ASSIGNED': return 'Assigned';
    case 'ACCEPTED': return 'Accepted';
    case 'ARRIVED_AT_PICKUP': return 'Arrived at Pickup';
    case 'PICKED_UP': return 'Picked Up';
    case 'ON_THE_WAY': return 'On the Way';
    case 'DELIVERED': return 'Delivered';
    case 'COMPLETED': return 'Completed';
    case 'CANCELLED': return 'Cancelled';
    default: return s;
  }
};

// Helper to normalize rider account status
export const normalizeRiderAccountStatus = (s) => {
  if (!s) return 'Active';
  const upper = String(s).toUpperCase();
  if (upper === 'PENDING_APPROVAL') return 'Pending Approval';
  if (upper === 'SUSPENDED') return 'Suspended';
  return 'Active';
};

// Helper to format backend delivery into frontend model
export const formatBackendDelivery = (d, i = 0) => {
  const safeNum = (val, fallback) => {
    const n = Number(val);
    return (!isNaN(n) && n !== 0) ? n : fallback;
  };

  const pickupLat = safeNum(d.pickupLatitude, 9.0054);
  const pickupLng = safeNum(d.pickupLongitude, 38.7885);
  const destLat = safeNum(d.destinationLatitude, 9.0345);
  const destLng = safeNum(d.destinationLongitude, 38.7512);

  // Safely extract OTP code string (avoiding rendering raw objects in React)
  let otpCodeString = '4921';
  if (d.otp && typeof d.otp === 'object') {
    otpCodeString = d.otp.otpCode || '4921';
  } else if (d.otpCode) {
    otpCodeString = String(d.otpCode);
  } else if (d.otp && typeof d.otp === 'string') {
    otpCodeString = d.otp;
  }

  // Tracking ID
  const displayId = d.trackingNumber 
    ? (d.trackingNumber.startsWith('#') ? d.trackingNumber : `#${d.trackingNumber}`)
    : (d.id?.startsWith('DLV') ? (d.id.startsWith('#') ? d.id : `#${d.id}`) : `#DLV-${String(i+1).padStart(4, '0')}`);

  return {
    id: displayId,
    backendId: d.id,
    trackingNumber: d.trackingNumber || d.id,
    customerId: d.customerId,
    customerName: d.customer?.fullName || d.customerName || 'Valued Customer',
    customerPhone: d.customer?.phoneNumber || d.customerPhone || '+251 91 100 0000',
    pickupLocation: d.pickupLocation || 'Bole, Addis Ababa',
    pickupAddressDetail: d.pickupAddressDetail || d.pickupLocation || 'Addis Ababa',
    destination: d.destination || 'Piassa, Addis Ababa',
    destinationAddressDetail: d.destinationAddressDetail || d.destination || 'Addis Ababa',
    status: normalizeDeliveryStatus(d.status),
    riderId: d.riderId || d.rider?.id || null,
    riderName: d.rider?.fullName || d.riderName || null,
    riderPhone: d.rider?.phoneNumber || d.riderPhone || null,
    riderVehicle: d.rider?.vehicleInfo || d.riderVehicle || null,
    time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '10:00 AM',
    date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
    itemType: d.itemType || 'Parcel',
    itemDescription: d.itemDescription || 'Package Delivery',
    receiverName: d.receiverName || 'Recipient',
    receiverPhone: d.receiverPhone || '+251 92 200 0000',
    specialInstructions: d.specialInstructions || '',
    amount: `ETB ${Number(d.fee || 120).toFixed(2)}`,
    fee: Number(d.fee || 120),
    otp: otpCodeString,
    routeCoordinates: [
      [pickupLat, pickupLng],
      [destLat, destLng]
    ],
    riderPosition: d.rider?.latitude ? [Number(d.rider.latitude), Number(d.rider.longitude)] : null,
    distance: d.distanceKm ? `${d.distanceKm} km` : '5.8 km',
    statusLogs: Array.isArray(d.statusLogs) ? d.statusLogs : [],
  };
};

export const DeliveryProvider = ({ children }) => {
  const [customers, setCustomers] = useState(initialCustomers);
  const [riders, setRiders] = useState(initialRiders);
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [payments, setPayments] = useState(initialPayments);
  const [backendStatus, setBackendStatus] = useState({ isOnline: false, checking: true });

  const [settings, setSettings] = useState({
    companyName: 'Balerra Delivery Service',
    companyEmail: 'info@balerra.com',
    companyPhone: '+251 911 234 567',
    defaultDeliveryFee: 100,
    currency: 'ETB - Ethiopian Birr',
    city: 'Bale / Addis Ababa, Ethiopia',
    operatingHours: '06:00 AM - 10:00 PM',
    autoAssignRider: false,
    requireOtpVerification: true,
    emailNotifications: true,
    smsNotifications: true,
  });

  // Synchronize with backend endpoints
  const syncWithBackend = useCallback(async () => {
    setBackendStatus(prev => ({ ...prev, checking: true }));
    const health = await checkBackendHealth();
    setBackendStatus({ isOnline: health.isOnline, checking: false });

    if (!health.isOnline) {
      return;
    }

    try {
      // 1. Fetch Deliveries
      const delivRes = await deliveryApi.getDeliveries({ limit: 100 });
      const backendDeliveries = delivRes.deliveries || delivRes.data?.deliveries || delivRes.data;
      if (Array.isArray(backendDeliveries) && backendDeliveries.length > 0) {
        setDeliveries(backendDeliveries.map((d, i) => formatBackendDelivery(d, i)));
      }

      // 2. Fetch Customers
      const custRes = await customerApi.getCustomers({ limit: 100 });
      const backendCustomers = custRes.customers || custRes.data?.customers || custRes.data;
      if (Array.isArray(backendCustomers) && backendCustomers.length > 0) {
        setCustomers(backendCustomers.map((c, i) => ({
          id: c.id || `CUS-${String(i+1).padStart(3, '0')}`,
          name: c.fullName || c.name,
          phone: c.phoneNumber || c.phone,
          email: c.email || `${c.phoneNumber}@balerra.com`,
          address: c.address || 'Addis Ababa, Ethiopia',
          totalDeliveries: c.totalDeliveries || c._count?.deliveries || 0,
          completedDeliveries: c.completedDeliveries || 0,
          cancelledDeliveries: c.cancelledDeliveries || 0,
          inProgressDeliveries: c.inProgressDeliveries || 0,
          status: c.status === 'SUSPENDED' ? 'Inactive' : 'Active',
          joinedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Jan 12, 2024',
          avatar: c.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        })));
      }

      // 3. Fetch Riders
      const riderRes = await riderApi.getRiders({ limit: 100 });
      const backendRiders = riderRes.riders || riderRes.data?.riders || riderRes.data;
      if (Array.isArray(backendRiders) && backendRiders.length > 0) {
        setRiders(backendRiders.map((r, i) => ({
          id: r.id || `RID-${String(i+1).padStart(3, '0')}`,
          name: r.fullName || r.name,
          phone: r.phoneNumber || r.phone,
          email: r.email,
          vehicle: r.vehicleInfo || r.vehicle || 'TVS Motorcycle',
          licensePlate: r.licensePlate || 'AB-12345',
          status: r.availabilityStatus === 'ONLINE' || r.status === 'Online' ? 'Online' : 'Offline',
          accountStatus: normalizeRiderAccountStatus(r.accountStatus),
          totalDeliveries: r.totalDeliveries || 0,
          completedDeliveries: r.completedDeliveries || 0,
          cancelledDeliveries: r.cancelledDeliveries || 0,
          inProgressDeliveries: r.inProgressDeliveries || 0,
          rating: r.rating || 4.8,
          joinedDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Feb 15, 2024',
          avatar: r.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
          currentLocation: [r.latitude || 9.0200, r.longitude || 38.7700],
          activeDeliveryId: r.activeDeliveryId || null,
        })));
      }

      // 4. Fetch Platform Settings
      try {
        const settingsRes = await settingsApi.getSettings();
        if (settingsRes && settingsRes.data) {
          setSettings(prev => ({ ...prev, ...settingsRes.data }));
        }
      } catch (e) {
        // settings fallback
      }

    } catch (err) {
      console.warn('Backend sync failed, maintaining current state:', err.message);
    }
  }, []);

  // Mount sync + Auto-poll every 8 seconds for live customer delivery & rider updates
  useEffect(() => {
    syncWithBackend();
    const interval = setInterval(syncWithBackend, 8000);
    return () => clearInterval(interval);
  }, [syncWithBackend]);

  // Fetch individual delivery directly from backend (for deep links and refreshes)
  const fetchDeliveryById = async (id) => {
    try {
      const res = await deliveryApi.getDeliveryById(id);
      const data = res.delivery || res.data?.delivery || res.data;
      if (data) {
        const formatted = formatBackendDelivery(data);
        // Update local state if not exists
        setDeliveries(prev => {
          const exists = prev.some(d => d.backendId === formatted.backendId || d.id === formatted.id);
          if (!exists) {
            return [formatted, ...prev];
          }
          return prev.map(d => (d.backendId === formatted.backendId || d.id === formatted.id) ? formatted : d);
        });
        return formatted;
      }
    } catch (e) {
      console.warn('fetchDeliveryById notice:', e.message);
    }
    return null;
  };

  // Dynamically calculate metrics
  const stats = useMemo(() => {
    const totalCustomers = customers.length;
    const totalRiders = riders.length;
    const onlineRiders = riders.filter(r => r.status === 'Online').length;
    const offlineRiders = riders.filter(r => r.status === 'Offline').length;
    const pendingApprovalRiders = riders.filter(r => r.accountStatus === 'Pending Approval').length;

    const pending = deliveries.filter(d => d.status === 'Pending').length;
    const assigned = deliveries.filter(d => d.status === 'Assigned').length;
    const inProgress = deliveries.filter(d => ['Accepted', 'Picked Up', 'On the Way', 'Delivered', 'Arrived at Pickup'].includes(d.status)).length;
    const completed = deliveries.filter(d => d.status === 'Completed').length;
    const cancelled = deliveries.filter(d => d.status === 'Cancelled').length;

    return {
      totalCustomers: totalCustomers || 1248,
      customerGrowth: '+12.5%',
      totalRiders: totalRiders || 356,
      onlineRiders: onlineRiders,
      offlineRiders: offlineRiders,
      pendingApprovalRiders,
      riderGrowth: '+8.2%',
      todayDeliveries: deliveries.length,
      todayDeliveriesGrowth: '+18.3%',
      completedToday: completed,
      completedGrowth: '+15.7%',
      pendingCount: pending,
      assignedCount: assigned,
      inProgressCount: inProgress,
      completedCount: completed,
      cancelledCount: cancelled,
    };
  }, [customers, riders, deliveries]);

  // Customer Management APIs
  const addCustomer = async (customerData) => {
    try {
      const res = await customerApi.createCustomer({
        fullName: customerData.name,
        phoneNumber: customerData.phone,
        email: customerData.email,
        password: customerData.password || 'CustomerPass@123',
        address: customerData.address,
      });
      const created = res.customer || res.data || {};
      const newCustomer = {
        id: created.id || `CUS-00${customers.length + 1}`,
        name: customerData.name,
        phone: customerData.phone,
        email: customerData.email,
        address: customerData.address,
        totalDeliveries: 0,
        completedDeliveries: 0,
        cancelledDeliveries: 0,
        inProgressDeliveries: 0,
        status: 'Active',
        joinedDate: 'Today',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      };
      setCustomers(prev => [newCustomer, ...prev]);
      return { success: true, customer: newCustomer };
    } catch (err) {
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create customer';
      return { success: false, message: errMsg };
    }
  };

  const toggleCustomerStatus = async (id) => {
    const currentCust = customers.find(c => c.id === id);
    const nextStatus = currentCust?.status === 'Active' ? 'Inactive' : 'Active';
    const apiStatus = nextStatus === 'Active' ? 'ACTIVE' : 'SUSPENDED';

    try {
      await customerApi.updateCustomerStatus(id, apiStatus);
    } catch (e) {
      console.warn('Backend updateCustomerStatus notice:', e.message);
    }

    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
  };

  // Rider Management APIs
  const addRider = async (riderData) => {
    try {
      const res = await riderApi.createRider({
        fullName: riderData.name,
        email: riderData.email,
        phoneNumber: riderData.phone,
        password: riderData.password,
        vehicleInfo: `${riderData.vehicle} Plate ${riderData.licensePlate || 'AB-12345'}`,
      });
      const created = res.data?.rider || res.data || res.rider || {};
      const newRider = {
        id: created.id || `RID-00${riders.length + 1}`,
        name: riderData.name,
        phone: riderData.phone,
        email: riderData.email,
        vehicle: riderData.vehicle,
        licensePlate: riderData.licensePlate || 'AB-12345',
        status: 'Offline',
        accountStatus: 'Active',
        totalDeliveries: 0,
        completedDeliveries: 0,
        cancelledDeliveries: 0,
        inProgressDeliveries: 0,
        rating: 5.0,
        joinedDate: 'Today',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        currentLocation: [9.0200, 38.7600],
        activeDeliveryId: null,
      };
      setRiders(prev => [newRider, ...prev]);
      setTimeout(syncWithBackend, 400);
      return { success: true, rider: newRider };
    } catch (err) {
      console.error('Backend createRider error:', err.response?.data || err.message);
      const errMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'Failed to create rider account on backend';
      return { success: false, message: errMsg };
    }
  };

  // Admin approves self-registered rider
  const approveRider = async (id) => {
    try {
      await riderApi.approveRider(id);
    } catch (e) {
      console.warn('Backend approveRider notice:', e.message);
    }

    setRiders(prev => prev.map(r => r.id === id ? { ...r, accountStatus: 'Active' } : r));
    setTimeout(syncWithBackend, 400);
    return true;
  };

  const toggleRiderActive = async (id) => {
    const rider = riders.find(r => r.id === id);
    const nextStatus = rider?.accountStatus === 'Active' ? 'Suspended' : 'Active';
    const apiStatus = nextStatus === 'Active' ? 'ACTIVE' : 'SUSPENDED';

    try {
      if (rider?.accountStatus === 'Pending Approval') {
        await riderApi.approveRider(id);
      } else {
        await riderApi.updateRiderStatus(id, apiStatus);
      }
    } catch (e) {
      console.warn('Backend updateRiderStatus notice:', e.message);
    }

    setRiders(prev => prev.map(r => r.id === id ? { ...r, accountStatus: nextStatus } : r));
  };

  const toggleRiderOnline = (id) => {
    setRiders(prev => prev.map(r => r.id === id ? { ...r, status: r.status === 'Online' ? 'Offline' : 'Online' } : r));
  };

  // Delivery Dispatch & Assignment APIs
  const assignRider = async (deliveryId, riderId) => {
    const selectedRider = riders.find(r => r.id === riderId);
    if (!selectedRider) return false;

    try {
      await deliveryApi.assignRider(deliveryId, riderId);
    } catch (e) {
      console.warn('Backend assignRider notice, updating local state:', e.message);
    }

    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId || d.backendId === deliveryId) {
        return {
          ...d,
          status: 'Assigned',
          riderId: selectedRider.id,
          riderName: selectedRider.name,
          riderPhone: selectedRider.phone,
          riderVehicle: selectedRider.vehicle,
          riderPosition: selectedRider.currentLocation,
        };
      }
      return d;
    }));

    setRiders(prev => prev.map(r => {
      if (r.id === riderId) {
        return { ...r, activeDeliveryId: deliveryId };
      }
      return r;
    }));

    // Trigger sync to get updated statusLogs from backend
    setTimeout(syncWithBackend, 500);

    return true;
  };

  const cancelDelivery = async (deliveryId, reason = 'Cancelled by Admin') => {
    try {
      await deliveryApi.cancelDelivery(deliveryId, reason);
    } catch (e) {
      console.warn('Backend cancelDelivery notice:', e.message);
    }

    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId || d.backendId === deliveryId) {
        return { ...d, status: 'Cancelled', specialInstructions: `${d.specialInstructions || ''} [Cancelled: ${reason}]` };
      }
      return d;
    }));

    setTimeout(syncWithBackend, 500);
  };

  const changeDeliveryStatus = (deliveryId, newStatus) => {
    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId || d.backendId === deliveryId) {
        return { ...d, status: newStatus };
      }
      return d;
    }));
  };

  // Payments
  const addPayment = (paymentData) => {
    const nextId = `PAY-00${payments.length + 1}`;
    const newPayment = {
      id: nextId,
      status: 'Paid',
      paymentDate: 'Today',
      period: 'May 2024',
      ...paymentData
    };
    setPayments(prev => [newPayment, ...prev]);
    return newPayment;
  };

  const markPaymentPaid = (id) => {
    setPayments(prev => prev.map(p => p.id === id ? { ...p, status: 'Paid', paymentDate: 'Today' } : p));
  };

  // Settings
  const updateSettings = async (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    try {
      for (const [key, value] of Object.entries(newSettings)) {
        await settingsApi.updateSetting(key, String(value));
      }
    } catch (e) {
      console.warn('Backend updateSettings notice:', e.message);
    }
  };

  return (
    <DeliveryContext.Provider value={{
      customers,
      riders,
      deliveries,
      payments,
      stats,
      settings,
      backendStatus,
      syncWithBackend,
      fetchDeliveryById,
      addCustomer,
      toggleCustomerStatus,
      addRider,
      approveRider,
      toggleRiderOnline,
      toggleRiderActive,
      assignRider,
      changeDeliveryStatus,
      cancelDelivery,
      addPayment,
      markPaymentPaid,
      updateSettings,
    }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => useContext(DeliveryContext);
