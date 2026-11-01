import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialNotifications } from '../data/mockData';
import { notificationApi } from '../api/services/notificationApi';
import { onAdminNotification } from '../services/socket';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState(initialNotifications);

  // Sync notifications with backend on mount
  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const res = await notificationApi.getNotifications({ limit: 50 });
        const items = res.notifications || res.data?.notifications || res.data;
        if (Array.isArray(items) && items.length > 0) {
          setNotifications(items.map(n => ({
            id: n.id || `NOTIF-${String(Date.now()).slice(-4)}`,
            title: n.title ? `${n.title}: ${n.message}` : n.message,
            time: n.createdAt ? new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recently',
            date: n.createdAt ? new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Today',
            type: n.targetRole === 'RIDER' ? 'rider' : (n.targetRole === 'CUSTOMER' ? 'request' : 'system'),
            isRead: n.isRead || false,
            iconColor: n.targetRole === 'RIDER' ? 'text-sky-600 bg-sky-50' : 'text-brand-600 bg-brand-50'
          })));
        }
      } catch (err) {
        console.warn('Backend notification fetch notice:', err.message);
      }
    };

    fetchNotifs();

    // ⚡ Real-Time WebSocket stream for instant admin notification alerts
    const unsub = onAdminNotification((notif) => {
      setNotifications((prev) => [
        {
          id: notif.id || `NOTIF-${String(Date.now()).slice(-4)}`,
          title: notif.title ? `${notif.title}: ${notif.message}` : notif.message,
          time: notif.createdAt
            ? new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'Just now',
          date: notif.createdAt
            ? new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            : 'Today',
          type: notif.userRole === 'RIDER' ? 'rider' : 'system',
          isRead: false,
          iconColor: 'text-brand-600 bg-brand-50',
        },
        ...prev,
      ]);
    });

    return () => unsub();
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAllAsRead = async () => {
    try {
      await notificationApi.markAllAsRead();
    } catch (e) {
      console.warn('Backend markAllAsRead notice:', e.message);
    }
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const markAsRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
    } catch (e) {
      console.warn('Backend markAsRead notice:', e.message);
    }
    setNotifications(prev => prev.map(n => n.id === id ? ({ ...n, isRead: true }) : n));
  };

  const deleteNotification = async (id) => {
    try {
      await notificationApi.deleteNotification(id);
    } catch (e) {
      console.warn('Backend deleteNotification notice:', e.message);
    }
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAllNotifications = async () => {
    try {
      await notificationApi.clearAllNotifications();
    } catch (e) {
      console.warn('Backend clearAllNotifications notice:', e.message);
    }
    setNotifications([]);
  };

  const addNotification = async ({ title, message, targetRole = 'ALL', type = 'info', iconColor }) => {
    try {
      await notificationApi.sendNotification({
        targetRole,
        title: title || 'Admin Notice',
        message: message || title,
      });
    } catch (err) {
      console.warn('Backend sendNotification notice:', err.message);
    }

    const newNotif = {
      id: `NOTIF-${String(Date.now()).slice(-4)}`,
      title: title || message,
      time: 'Just now',
      date: 'Today',
      type,
      isRead: false,
      iconColor: iconColor || 'text-brand-600 bg-brand-50'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      markAllAsRead,
      markAsRead,
      deleteNotification,
      clearAllNotifications,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);
