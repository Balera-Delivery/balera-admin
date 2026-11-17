import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { dashboardApi } from '../api/services/dashboardApi';
import { customerApi } from '../api/services/customerApi';
import { riderApi } from '../api/services/riderApi';
import { deliveryApi } from '../api/services/deliveryApi';
import { settingsApi } from '../api/services/settingsApi';
import { checkBackendHealth } from '../api/client';
import { onDeliveryUpdate, onAdminNotification } from '../services/socket';

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

// Helper to normalize payment option into one of 3 customer options (Telebirr, CBE, Awash Bank)
export const normalizePaymentOption = (method) => {
  if (!method) return 'Telebirr';
  const str = String(method).toLowerCase().trim();
  if (str.includes('cbe') || str.includes('commercial') || str.includes('ethiopia')) {
    return 'Commercial Bank of Ethiopia (CBE)';
  }
  if (str.includes('awash')) {
    return 'Awash Bank';
  }
  return 'Telebirr';
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
const formatBackendDelivery = (d, i = 0) => {
  if (!d) return null;

  // Real coordinates only (a point is left out when the server has none)
  const point = (lat, lng) => {
    const a = Number(lat);
    const b = Number(lng);
    return Number.isFinite(a) && Number.isFinite(b) && a !== 0 && b !== 0 ? [a, b] : null;
  };
  const pickupPoint = point(d.pickupLatitude, d.pickupLongitude);
  const destPoint = point(d.destinationLatitude, d.destinationLongitude);

  // Real OTP only (never show a made-up code)
  let otpCodeString = null;
  if (d.otp && typeof d.otp === 'object' && d.otp.otpCode) {
    otpCodeString = String(d.otp.otpCode);
  } else if (d.otpCode) {
    otpCodeString = String(d.otpCode);
  } else if (d.otp && typeof d.otp === 'string') {
    otpCodeString = d.otp;
  }

  // Tracking ID
  const trackingNumber = d.trackingCode || d.trackingNumber || d.id;
  const displayId = trackingNumber 
    ? (trackingNumber.startsWith('#') ? trackingNumber : `#${trackingNumber}`)
    : (d.id?.startsWith('DLV') ? (d.id.startsWith('#') ? d.id : `#${d.id}`) : `#DLV-${String(i+1).padStart(4, '0')}`);

  // Payment & Receipt Details (Normalized strictly to Telebirr, CBE, or Awash Bank)
  const receiptUrl = d.receiptUrl || d.order?.receiptUrl || d.paymentReceipt || d.receipt || null;
  const rawPaymentMethod = d.paymentMethod || d.order?.paymentMethod || 'Telebirr';
  const paymentMethod = normalizePaymentOption(rawPaymentMethod);
  const paymentStatus = d.paymentStatus || d.order?.paymentStatus || (receiptUrl ? 'Paid (Pending Verification)' : 'Pending');

  // Food Order & Restaurant Data extraction
  let restaurant = d.order?.restaurant || d.restaurant || null;
  let orderItems = Array.isArray(d.order?.items)
    ? d.order.items
    : Array.isArray(d.items)
    ? d.items
    : [];

  const combinedText = `${d.pickupLocation || ''} ${d.itemDescription || ''} ${d.itemType || ''}`;

  // Parse items from text if orderItems array is empty (e.g. "2x Faxiraa (600 Birr) - SANA'A RESTAURANT")
  if (orderItems.length === 0 && d.itemDescription) {
    const dishMatch = d.itemDescription.match(/(\d+)\s*x\s*([^(]+?)(?:\s*\((?:ETB\s*|Birr\s*)?(\d+(?:\.\d+)?)\s*(?:Birr|ETB)?\))?(?:\s*-\s*(.+))?$/i);
    if (dishMatch) {
      const qty = parseInt(dishMatch[1], 10) || 1;
      const itemName = dishMatch[2].trim();
      const rawTotal = dishMatch[3] ? parseFloat(dishMatch[3]) : 0;
      const unitPrice = rawTotal > 0 ? (rawTotal / qty) : 0;
      orderItems = [{
        id: `dish-1`,
        name: itemName,
        quantity: qty,
        price: unitPrice,
        subtotal: rawTotal > 0 ? rawTotal : (unitPrice * qty),
        notes: '',
        category: 'Partner Special'
      }];
    }
  }

  const isFoodOrder =
    (d.itemType &&
      (d.itemType.toLowerCase().includes('food') ||
        d.itemType.toLowerCase().includes('restaurant') ||
        d.itemType.toLowerCase().includes('meal'))) ||
    !!restaurant ||
    orderItems.length > 0 ||
    /restaurant|hotel|caffee|cafe|lodge|faxiraa|tibs|burger|pizza|doro|firfir|haniid/i.test(combinedText);

  const subtotal = d.order?.subtotal !== undefined
    ? Number(d.order.subtotal)
    : orderItems.reduce((acc, it) => acc + (Number(it.price || 0) * Number(it.quantity || 1)), 0);

  const deliveryFee = d.order?.deliveryFee !== undefined
    ? Number(d.order.deliveryFee)
    : (restaurant?.deliveryFee ? Number(restaurant.deliveryFee) : Number(d.fee || 0));

  const legacyTotal = d.order?.totalAmount !== undefined
    ? Number(d.order.totalAmount)
    : (subtotal > 0 ? (subtotal + deliveryFee) : (Number(d.amount ? String(d.amount).replace(/[^0-9.]/g, '') : 0) || 0));
  // Server-calculated checkout total (new orders) is what the customer actually paid.
  const totalAmount = d.totalAmount != null ? Number(d.totalAmount) : legacyTotal;
  const discount = Number(d.discount ?? d.order?.discount ?? 0) || 0;
  const promoCode = d.promoCode || d.order?.promoCode || null;

  // Pickup stops: one entry per restaurant in the order (multi-restaurant carts),
  // each with its dishes and subtotal. Older orders fall back to the order's single restaurant.
  const stopMap = new Map();
  for (const it of orderItems) {
    const r = it.restaurant || null;
    const name = it.restaurantName || r?.name || restaurant?.name || 'Partner Restaurant';
    const key = it.restaurantId || r?.id || name;
    if (!stopMap.has(key)) {
      stopMap.set(key, {
        restaurantId: it.restaurantId || r?.id || restaurant?.id || null,
        name,
        address: r?.address || (stopMap.size === 0 ? restaurant?.address : '') || '',
        phone: r?.phone1 || (stopMap.size === 0 ? restaurant?.phone1 : '') || '',
        items: [],
        subtotal: 0,
      });
    }
    const stop = stopMap.get(key);
    const lineTotal = Number(it.subtotal ?? (Number(it.price || 0) * Number(it.quantity || 1))) || 0;
    stop.items.push({ name: it.name || it.foodItem?.name || 'Dish', quantity: Number(it.quantity || 1), price: Number(it.price || 0), subtotal: lineTotal, notes: it.notes || '' });
    stop.subtotal += lineTotal;
  }
  const pickupStops = [...stopMap.values()];

  return {
    id: displayId,
    backendId: d.id,
    trackingNumber: d.trackingNumber || d.trackingCode || d.id,
    customerId: d.customerId,
    customerName: d.customer?.fullName || d.customerName || 'Customer',
    customerPhone: d.customer?.phoneNumber || d.customerPhone || '',
    pickupLocation: d.pickupLocation || (restaurant ? `${restaurant.name}${restaurant.address ? `, ${restaurant.address}` : ''}` : '—'),
    pickupAddressDetail: d.pickupAddressDetail || d.pickupLocation || '',
    destination: d.destination || '—',
    destinationAddressDetail: d.destinationAddressDetail || d.destination || '',
    status: normalizeDeliveryStatus(d.status),
    riderId: d.riderId || d.rider?.id || null,
    riderName: d.rider?.fullName || d.riderName || null,
    riderPhone: d.rider?.phoneNumber || d.riderPhone || null,
    riderVehicle: d.rider?.vehicleInfo || d.riderVehicle || null,
    time: d.createdAt ? new Date(d.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—',
    date: d.createdAt ? new Date(d.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
    createdAtRaw: d.createdAt || null,
    finishedAtRaw: d.completedAt || d.deliveredAt || d.updatedAt || null,
    itemType: d.itemType || (isFoodOrder ? 'Food' : 'Package'),
    itemDescription: d.itemDescription || (isFoodOrder && restaurant ? `Food Order from ${restaurant.name}` : 'Package Delivery'),
    receiverName: d.receiverName || '',
    receiverPhone: d.receiverPhone || '',
    specialInstructions: d.specialInstructions || '',
    amount: `ETB ${totalAmount.toFixed(2)}`,
    fee: d.deliveryFee != null ? Number(d.deliveryFee) : deliveryFee,
    subtotal: subtotal,
    totalAmount: totalAmount,
    discount,
    promoCode,
    // Every restaurant the rider must pick up from (with dishes & subtotal)
    pickupStops,
    otp: otpCodeString,
    // Payment and uploaded receipt
    paymentMethod,
    paymentStatus,
    receiptUrl,
    // Only real map points (empty when the server has no coordinates)
    routeCoordinates: pickupPoint && destPoint ? [pickupPoint, destPoint] : [pickupPoint, destPoint].filter(Boolean),
    riderPosition: point(d.rider?.currentLatitude ?? d.rider?.latitude, d.rider?.currentLongitude ?? d.rider?.longitude),
    distance: d.distanceKm ? `${d.distanceKm} km` : null,
    statusLogs: Array.isArray(d.statusLogs) ? d.statusLogs : [],
    // Rich Food & Restaurant metadata
    isFoodOrder,
    order: d.order || null,
    restaurant: restaurant ? {
      id: restaurant.code || restaurant.id,
      backendId: restaurant.id,
      code: restaurant.code || restaurant.id,
      name: restaurant.name,
      category: restaurant.category || 'Cafe & Restaurant',
      cuisineType: restaurant.cuisineType || 'Local & Traditional',
      phone1: restaurant.phone1 || '',
      phone2: restaurant.phone2 || '',
      address: restaurant.address || '',
      rating: restaurant.rating ?? null,
      deliveryFee: restaurant.deliveryFee ?? null,
      deliveryTime: restaurant.deliveryTime || '',
      banner: restaurant.banner || '',
      avatar: restaurant.avatar || '',
      status: restaurant.status || 'Active',
    } : null,
    orderItems: orderItems.map(it => ({
      id: it.id,
      foodItemId: it.foodItemId,
      name: it.name || it.foodItem?.name || 'Dish Item',
      price: Number(it.price !== undefined ? it.price : (it.foodItem?.price || 0)),
      quantity: Number(it.quantity || 1),
      subtotal: Number(it.subtotal !== undefined ? it.subtotal : (Number(it.price || it.foodItem?.price || 0) * Number(it.quantity || 1))),
      notes: it.notes || '',
      image: it.foodItem?.image || '',
      tag: it.foodItem?.tag || '',
      category: it.foodItem?.category || '',
    })),
  };
};

// Payout row from the server -> what the Rider Payments page shows.
// The reference is saved as "Method | Reference" when the admin records a payout.
const formatPayout = (p) => {
  const [method, ref] = String(p.reference || '').includes(' | ')
    ? p.reference.split(' | ')
    : ['—', p.reference || '—'];
  const amountNum = Number(p.amount) || 0;
  return {
    id: p.id,
    riderId: p.riderId,
    riderName: p.riderName,
    riderPhone: p.riderPhone,
    amountNum,
    amount: `ETB ${amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    paymentMethod: method,
    referenceNumber: ref,
    totalDeliveries: p.deliveriesCount,
    period: p.paidAt ? new Date(p.paidAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
    status: 'Paid',
  };
};

export const DeliveryProvider = ({ children }) => {
  // Lists start empty and are filled only with real data from the server
  const [customers, setCustomers] = useState([]);
  const [riders, setRiders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [payments, setPayments] = useState([]); // payout history (real, from the server)
  const [payoutsSummary, setPayoutsSummary] = useState([]); // earnings / paid / owed per rider
  const [backendStatus, setBackendStatus] = useState({ isOnline: false, checking: true });

  const [settings, setSettings] = useState({
    companyName: '',
    companyEmail: '',
    companyPhone: '',
    // Pricing settings used by the backend PricingService (keys must match the backend)
    delivery_fee: 100,
    extra_stop_fee: 30,
    currency: 'ETB - Ethiopian Birr',
    city: '',
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
      if (Array.isArray(backendDeliveries)) {
        setDeliveries(backendDeliveries.map((d, i) => formatBackendDelivery(d, i)));
      }

      // 2. Fetch Customers
      const custRes = await customerApi.getCustomers({ limit: 100 });
      const backendCustomers = custRes.customers || custRes.data?.customers || custRes.data;
      if (Array.isArray(backendCustomers)) {
        setCustomers(backendCustomers.map((c, i) => ({
          id: c.id || `CUS-${String(i+1).padStart(3, '0')}`,
          name: c.fullName || c.name,
          phone: c.phoneNumber || c.phone,
          email: c.email || '',
          address: c.address || '',
          totalDeliveries: c.totalDeliveries || c._count?.deliveries || 0,
          completedDeliveries: c.completedDeliveries || 0,
          cancelledDeliveries: c.cancelledDeliveries || 0,
          inProgressDeliveries: c.inProgressDeliveries || 0,
          status: c.status === 'SUSPENDED' ? 'Inactive' : 'Active',
          joinedDate: c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
          createdAtRaw: c.createdAt || null,
        })));
      }

      // 3. Fetch Riders
      const riderRes = await riderApi.getRiders({ limit: 100 });
      const backendRiders = riderRes.riders || riderRes.data?.riders || riderRes.data;
      if (Array.isArray(backendRiders)) {
        setRiders(backendRiders.map((r, i) => ({
          id: r.id || `RID-${String(i+1).padStart(3, '0')}`,
          name: r.fullName || r.name,
          phone: r.phoneNumber || r.phone,
          email: r.email,
          vehicle: (r.vehicleInfo || r.vehicle || '—').split(' Plate ')[0],
          licensePlate: r.licensePlate || (r.vehicleInfo || '').split(' Plate ')[1] || '',
          status: r.availabilityStatus === 'ONLINE' || r.status === 'Online' ? 'Online' : 'Offline',
          accountStatus: r.isDeactivated ? 'Deactivated' : normalizeRiderAccountStatus(r.accountStatus),
          totalDeliveries: r.totalDeliveries || r._count?.deliveries || 0,
          completedDeliveries: r.completedDeliveries || 0,
          cancelledDeliveries: r.cancelledDeliveries || 0,
          inProgressDeliveries: r.inProgressDeliveries || 0,
          joinedDate: r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—',
          createdAtRaw: r.createdAt || null,
          currentLocation: [r.latitude || 9.0200, r.longitude || 38.7700],
          activeDeliveryId: r.activeDeliveryId || null,
        })));
      }

      // 4. Fetch Platform Settings
      try {
        const settingsRes = await settingsApi.getSettings();
        if (settingsRes && settingsRes.data) {
          // Backend returns rows [{ key, value }]; convert them to a { key: value } map.
          const rows = settingsRes.data;
          const loaded = Array.isArray(rows)
            ? rows.reduce((acc, row) => {
                if (row && row.key) acc[row.key] = row.value;
                return acc;
              }, {})
            : rows;
          setSettings(prev => ({ ...prev, ...loaded }));
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

    // Instant WebSocket trigger on new delivery or status change
    const unsubUpdate = onDeliveryUpdate(() => {
      syncWithBackend();
    });
    const unsubNotif = onAdminNotification(() => {
      syncWithBackend();
    });

    return () => {
      clearInterval(interval);
      unsubUpdate?.();
      unsubNotif?.();
    };
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

    // Real comparisons (no invented percentages)
    const startOfDay = (offsetDays = 0) => {
      const d = new Date();
      d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + offsetDays);
      return d.getTime();
    };
    const today = startOfDay(0);
    const yesterday = startOfDay(-1);
    const tomorrow = startOfDay(1);
    const inRange = (raw, from, to) => {
      if (!raw) return false;
      const t = new Date(raw).getTime();
      return t >= from && t < to;
    };
    const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).getTime();

    const todayDeliveries = deliveries.filter(d => inRange(d.createdAtRaw, today, tomorrow)).length;
    const yesterdayDeliveries = deliveries.filter(d => inRange(d.createdAtRaw, yesterday, today)).length;
    const isDone = (d) => d.status === 'Completed';
    const completedToday = deliveries.filter(d => isDone(d) && inRange(d.finishedAtRaw, today, tomorrow)).length;
    const completedYesterday = deliveries.filter(d => isDone(d) && inRange(d.finishedAtRaw, yesterday, today)).length;
    const newCustomersThisMonth = customers.filter(c => inRange(c.createdAtRaw, monthStart, tomorrow)).length;
    const newRidersThisMonth = riders.filter(r => inRange(r.createdAtRaw, monthStart, tomorrow)).length;
    const diff = (a, b) => (a - b > 0 ? `+${a - b}` : `${a - b}`);

    return {
      totalCustomers,
      newCustomersThisMonth,
      totalRiders,
      onlineRiders: onlineRiders,
      offlineRiders: offlineRiders,
      pendingApprovalRiders,
      newRidersThisMonth,
      todayDeliveries,
      todayDeliveriesChange: diff(todayDeliveries, yesterdayDeliveries),
      todayDeliveriesUp: todayDeliveries >= yesterdayDeliveries,
      completedToday,
      completedTodayChange: diff(completedToday, completedYesterday),
      completedTodayUp: completedToday >= completedYesterday,
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
      await customerApi.createCustomer({
        fullName: customerData.name,
        phoneNumber: customerData.phone,
        email: customerData.email || undefined,
        password: customerData.password, // set by the admin in the form (no built-in password)
        address: customerData.address || undefined,
      });
    } catch (e) {
      return { success: false, message: e.response?.data?.error?.[0]?.message || e.response?.data?.message || e.message };
    }
    await syncWithBackend();
    return { success: true };
  };

  const toggleCustomerStatus = async (id) => {
    const currentCust = customers.find(c => c.id === id);
    const nextStatus = currentCust?.status === 'Active' ? 'Inactive' : 'Active';
    try {
      await customerApi.updateCustomerStatus(id, nextStatus === 'Active' ? 'ACTIVE' : 'SUSPENDED');
    } catch (e) {
      return { success: false, message: e.response?.data?.error?.[0]?.message || e.response?.data?.message || e.message };
    }
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, status: nextStatus } : c));
    return { success: true, status: nextStatus };
  };

  // Removes the customer's personal data on the server (their past orders are kept anonymously)
  const deleteCustomer = async (id) => {
    try {
      await customerApi.deleteCustomer(id);
    } catch (e) {
      return { success: false, message: e.response?.data?.error?.[0]?.message || e.response?.data?.message || e.message };
    }
    setCustomers(prev => prev.filter(c => c.id !== id));
    return { success: true };
  };

  // Rider Management APIs
  const addRider = async (riderData) => {
    try {
      const res = await riderApi.createRider({
        fullName: riderData.name,
        email: riderData.email,
        phoneNumber: riderData.phone,
        password: riderData.password,
        vehicleInfo: riderData.licensePlate ? `${riderData.vehicle} Plate ${riderData.licensePlate}` : riderData.vehicle,
      });
      const created = res.data?.rider || res.data || res.rider || {};
      const newRider = created;
      await syncWithBackend();
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
      return { success: false, message: e.response?.data?.error?.[0]?.message || e.response?.data?.message || e.message };
    }
    setRiders(prev => prev.map(r => r.id === id ? { ...r, accountStatus: 'Active' } : r));
    setTimeout(syncWithBackend, 400);
    return { success: true };
  };

  // Suspend an active rider, or make a suspended rider active again
  const toggleRiderActive = async (id) => {
    const rider = riders.find(r => r.id === id);
    if (!rider) return { success: false, message: 'Rider not found.' };
    const nextStatus = rider.accountStatus === 'Active' ? 'Suspended' : 'Active';
    try {
      if (rider.accountStatus === 'Pending Approval') await riderApi.approveRider(id);
      else await riderApi.updateRiderStatus(id, nextStatus === 'Active' ? 'ACTIVE' : 'SUSPENDED');
    } catch (e) {
      return { success: false, message: e.response?.data?.error?.[0]?.message || e.response?.data?.message || e.message };
    }
    setRiders(prev => prev.map(r => r.id === id
      ? { ...r, accountStatus: nextStatus, status: nextStatus === 'Suspended' ? 'Offline' : r.status }
      : r));
    return { success: true, status: nextStatus };
  };

  // Deactivate an active rider, or activate a deactivated one again (saved on the server).
  const toggleRiderDeactivation = async (id) => {
    const rider = riders.find(r => r.id === id);
    if (!rider) return { success: false, message: 'Rider not found.' };
    const deactivate = rider.accountStatus !== 'Deactivated';
    try {
      await riderApi.toggleDeactivation(id, deactivate);
    } catch (e) {
      return { success: false, message: e.response?.data?.message || e.message };
    }
    setRiders(prev => prev.map(r => r.id === id
      ? { ...r, accountStatus: deactivate ? 'Deactivated' : 'Active', status: deactivate ? 'Offline' : r.status }
      : r));
    return { success: true, deactivated: deactivate };
  };

  // Save rider details with the field names the server expects, then the account status if it changed
  const editRider = async (id, updatedData) => {
    const rider = riders.find(r => r.id === id);
    if (!rider) return { success: false, message: 'Rider not found.' };
    const plate = (updatedData.licensePlate || '').trim();
    try {
      await riderApi.updateRider(id, {
        fullName: updatedData.name,
        phoneNumber: updatedData.phone,
        vehicleInfo: plate ? `${updatedData.vehicle} Plate ${plate}` : updatedData.vehicle,
      });
      const want = updatedData.accountStatus;
      if (want && want !== rider.accountStatus) {
        if (want === 'Deactivated') {
          await riderApi.toggleDeactivation(id, true);
        } else {
          if (rider.accountStatus === 'Deactivated') await riderApi.toggleDeactivation(id, false);
          await riderApi.updateRiderStatus(id, want === 'Active' ? 'ACTIVE' : 'SUSPENDED');
        }
      }
    } catch (e) {
      return { success: false, message: e.response?.data?.error?.[0]?.message || e.response?.data?.message || e.message };
    }
    await syncWithBackend();
    return { success: true };
  };

  const deleteRider = async (id) => {
    try {
      await riderApi.deleteRider(id);
    } catch (e) {
      return { success: false, message: e.response?.data?.error?.[0]?.message || e.response?.data?.message || e.message };
    }
    setRiders(prev => prev.filter(r => r.id !== id));
    return { success: true };
  };

  const fetchPayouts = useCallback(async () => {
    try {
      const [summaryRes, historyRes] = await Promise.all([
        riderApi.getPayoutsSummary(),
        riderApi.getPayoutHistory(),
      ]);
      if (Array.isArray(summaryRes?.data)) setPayoutsSummary(summaryRes.data);
      if (Array.isArray(historyRes?.data)) setPayments(historyRes.data.map(formatPayout));
    } catch (e) {
      console.warn('Backend payouts notice:', e.message);
    }
  }, []);

  // Load payouts when the admin opens, then refresh them every 30 seconds
  useEffect(() => {
    fetchPayouts();
    const t = setInterval(fetchPayouts, 30000);
    return () => clearInterval(t);
  }, [fetchPayouts]);

  // Settle all unpaid completed deliveries of a rider (saved on the server)
  const markRiderPaidFromApi = async (riderId, paymentData) => {
    const method = paymentData.paymentMethod || 'Telebirr';
    const ref = (paymentData.reference || '').trim() || `PAY-${Date.now()}`;
    const res = await riderApi.markRiderPaid(riderId, { payoutReference: `${method} | ${ref}` });
    if (!res?.data?.count) {
      throw new Error(res?.data?.message || 'This rider has no unpaid completed deliveries.');
    }
    await fetchPayouts();
    return res.data;
  };

  // Set a rider Online / Offline and save it, so the auto-refresh doesn't switch it back.
  const toggleRiderOnline = async (id) => {
    const rider = riders.find(r => r.id === id);
    if (!rider) return { success: false, message: 'Rider not found.' };
    const next = rider.status === 'Online' ? 'Offline' : 'Online';
    setRiders(prev => prev.map(r => r.id === id ? { ...r, status: next } : r));
    try {
      await riderApi.setAvailability(id, next.toUpperCase());
      return { success: true, status: next };
    } catch (e) {
      // Undo on failure (e.g. a suspended or deactivated rider can't go online)
      setRiders(prev => prev.map(r => r.id === id ? { ...r, status: rider.status } : r));
      return { success: false, message: e.response?.data?.message || e.message };
    }
  };

  // Delivery Dispatch & Assignment APIs (shown only after the server saves it)
  const assignRider = async (deliveryId, riderId) => {
    const selectedRider = riders.find(r => r.id === riderId);
    if (!selectedRider) return { success: false, message: 'Rider not found.' };
    try {
      await deliveryApi.assignRider(deliveryId, riderId);
    } catch (e) {
      return { success: false, message: e.response?.data?.error?.[0]?.message || e.response?.data?.message || e.message };
    }
    setDeliveries(prev => prev.map(d => (d.id === deliveryId || d.backendId === deliveryId)
      ? { ...d, status: 'Assigned', riderId: selectedRider.id, riderName: selectedRider.name, riderPhone: selectedRider.phone, riderVehicle: selectedRider.vehicle }
      : d));
    setTimeout(syncWithBackend, 500);
    return { success: true };
  };

  const cancelDelivery = async (deliveryId, reason = 'Cancelled by Admin') => {
    try {
      await deliveryApi.cancelDelivery(deliveryId, reason);
    } catch (e) {
      // Don't show "Cancelled" if the server didn't cancel it
      return { success: false, message: e.response?.data?.message || e.message };
    }

    setDeliveries(prev => prev.map(d => {
      if (d.id === deliveryId || d.backendId === deliveryId) {
        return { ...d, status: 'Cancelled', specialInstructions: `${d.specialInstructions || ''} [Cancelled: ${reason}]` };
      }
      return d;
    }));

    setTimeout(syncWithBackend, 500);
    return { success: true };
  };

  // Admin moves a delivery forward (support override). Shown only after the server saves it.
  const changeDeliveryStatus = async (deliveryId, newStatus, notes = '') => {
    try {
      await deliveryApi.updateDeliveryStatus(deliveryId, newStatus, notes);
    } catch (e) {
      return { success: false, message: e.response?.data?.message || e.message };
    }
    setDeliveries(prev => prev.map(d =>
      (d.id === deliveryId || d.backendId === deliveryId) ? { ...d, status: newStatus } : d));
    setTimeout(syncWithBackend, 500);
    return { success: true };
  };

  // Settings: save only the values the admin changed (empty fields are skipped), one by one;
  // stops at the first failure and reports it
  const updateSettings = async (newSettings) => {
    const changed = Object.entries(newSettings).filter(([key, value]) =>
      value !== undefined && value !== null && String(value).trim() !== '' &&
      String(value) !== String(settings[key] ?? ''));
    try {
      for (const [key, value] of changed) {
        await settingsApi.updateSetting(key, String(value).trim());
      }
    } catch (e) {
      return { success: false, message: e.response?.data?.error?.[0]?.message || e.response?.data?.message || e.message };
    }
    setSettings(prev => ({ ...prev, ...Object.fromEntries(changed) }));
    return { success: true, saved: changed.length };
  };

  // Update & Verify Payment Status
  const updatePaymentStatus = async (deliveryId, paymentStatus) => {
    try {
      await deliveryApi.updatePaymentStatus(deliveryId, paymentStatus);
    } catch (e) {
      return { success: false, message: e.response?.data?.error?.[0]?.message || e.response?.data?.message || e.message };
    }
    setDeliveries(prev => prev.map(d =>
      (d.id === deliveryId || d.backendId === deliveryId || d.trackingNumber === deliveryId) ? { ...d, paymentStatus } : d));
    setTimeout(syncWithBackend, 500);
    return { success: true };
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
      deleteCustomer,
      addRider,
      approveRider,
      editRider,
      deleteRider,
      toggleRiderDeactivation,
      payoutsSummary,
      fetchPayouts,
      markRiderPaidFromApi,
      toggleRiderOnline,
      toggleRiderActive,
      assignRider,
      changeDeliveryStatus,
      cancelDelivery,
      updatePaymentStatus,
      updateSettings,
    }}>
      {children}
    </DeliveryContext.Provider>
  );
};

export const useDelivery = () => useContext(DeliveryContext);
