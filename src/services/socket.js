import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || (
  import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') 
    : 'http://localhost:5000'
);

let socket = null;

export const initSocket = () => {
  if (socket && socket.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socket.on('connect', () => {
    console.log('[Socket.io] Connected to server at', SOCKET_URL);
    // Join the admin monitoring room for live map and notifications
    socket.emit('admin:join');
  });

  socket.on('connect_error', (error) => {
    console.warn('[Socket.io Notice] Connection error:', error.message);
  });

  socket.on('disconnect', (reason) => {
    console.log('[Socket.io] Disconnected:', reason);
  });

  return socket;
};

export const getSocket = () => {
  if (!socket) {
    return initSocket();
  }
  return socket;
};

export const onRiderLocation = (callback) => {
  const s = getSocket();
  s.on('admin:rider:location', callback);
  return () => s.off('admin:rider:location', callback);
};

export const onDeliveryUpdate = (callback) => {
  const s = getSocket();
  s.on('admin:delivery:update', callback);
  return () => s.off('admin:delivery:update', callback);
};

export const onAdminNotification = (callback) => {
  const s = getSocket();
  s.on('admin:notification', callback);
  return () => s.off('admin:notification', callback);
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
