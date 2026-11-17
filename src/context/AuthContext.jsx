import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/services/authApi';

const AuthContext = createContext();

const REFRESHED_AT_KEY = 'balerra_admin_token_refreshed_at';
const REFRESH_EVERY_MS = 6 * 60 * 60 * 1000; // get a fresh token at most every 6 hours

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('balerra_admin_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return null;
  });

  const [token, setToken] = useState(() => localStorage.getItem('balerra_admin_token') || null);
  // Signed in only with a real token from the login page (no automatic sign-in)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    const t = localStorage.getItem('balerra_admin_token');
    return !!t && !t.startsWith('demo-');
  });

  // Stay signed in: the login is saved in this browser (it survives closing the website).
  // The server token lasts 7 days, so while the admin keeps using the dashboard we swap it
  // for a fresh one: when the page opens, when the tab comes back into view, and every few hours.
  useEffect(() => {
    if (!isAuthenticated) return undefined;

    const refreshSession = async () => {
      if (!localStorage.getItem('balerra_admin_token')) return;
      try {
        const res = await authApi.refreshSession();
        const fresh = res?.data?.token;
        const raw = res?.data?.admin;
        if (fresh) {
          localStorage.setItem('balerra_admin_token', fresh);
          localStorage.setItem(REFRESHED_AT_KEY, String(Date.now()));
          setToken(fresh);
        }
        if (raw) {
          const userObj = {
            id: raw.id,
            name: raw.fullName || raw.name || 'Administrator',
            role: raw.role || 'SUPER_ADMIN',
            email: raw.email,
            avatar: null,
          };
          setAdminUser(userObj);
          localStorage.setItem('balerra_admin_user', JSON.stringify(userObj));
        }
      } catch (err) {
        // An expired/invalid session (401) is handled by the API client: it opens the login page.
        console.warn('Session refresh notice:', err.message);
      }
    };

    const refreshIfDue = () => {
      const last = Number(localStorage.getItem(REFRESHED_AT_KEY) || 0);
      if (Date.now() - last > REFRESH_EVERY_MS) refreshSession();
    };

    refreshSession(); // once when the dashboard opens
    const timer = setInterval(refreshIfDue, 15 * 60 * 1000);
    const onVisible = () => { if (document.visibilityState === 'visible') refreshIfDue(); };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      clearInterval(timer);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [isAuthenticated]);

  // If the admin signs out in one tab, sign out the other open tabs too
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'balerra_admin_token' && !e.newValue) {
        setToken(null);
        setAdminUser(null);
        setIsAuthenticated(false);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const login = async (email, password, remember = true) => {
    try {
      const res = await authApi.adminLogin(email, password);
      
      const authToken = res.data?.token || res.token;
      if (!authToken) {
        return { success: false, message: 'Sign in failed. Please try again.' };
      }
      const raw = res.data?.admin || res.data?.user || res.user || {};
      const user = {
        id: raw.id,
        name: raw.fullName || raw.name || 'Administrator',
        role: raw.role || 'SUPER_ADMIN',
        email: raw.email || email,
        avatar: null,
      };

      setToken(authToken);
      setAdminUser(user);
      setIsAuthenticated(true);

      // Saved in this browser so the admin stays signed in after closing the website
      localStorage.setItem('balerra_admin_token', authToken);
      localStorage.setItem(REFRESHED_AT_KEY, String(Date.now()));
      localStorage.setItem('balerra_admin_user', JSON.stringify(user));
      return { success: true };
    } catch (backendError) {
      console.warn('Backend login request error:', backendError.message);
      
      const errMsg = backendError.response?.data?.message || backendError.message || 'Invalid credentials';
      return { success: false, message: errMsg };
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (e) {
      // ignore
    }
    setToken(null);
    setAdminUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('balerra_admin_token');
    localStorage.removeItem('balerra_admin_user');
    localStorage.removeItem(REFRESHED_AT_KEY);
  };

  const updateProfile = (updatedData) => {
    setAdminUser(prev => {
      const next = { ...prev, ...updatedData };
      localStorage.setItem('balerra_admin_user', JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider value={{ adminUser, token, isAuthenticated, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
