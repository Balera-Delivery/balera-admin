import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '../api/services/authApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [adminUser, setAdminUser] = useState(() => {
    const saved = localStorage.getItem('balerra_admin_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { return null; }
    }
    return {
      id: 'admin-001',
      name: 'Super Administrator',
      role: 'SUPER_ADMIN',
      email: 'admin@balera.com',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    };
  });

  const [token, setToken] = useState(() => localStorage.getItem('balerra_admin_token') || null);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Verify or auto-authenticate session on mount
  useEffect(() => {
    const initSession = async () => {
      let currentToken = localStorage.getItem('balerra_admin_token');

      // If token is missing or dummy demo token, acquire real JWT token from backend
      if (!currentToken || currentToken.startsWith('demo-')) {
        try {
          const loginRes = await authApi.adminLogin('admin@balera.com', 'AdminPassword@123');
          const realToken = loginRes.data?.token || loginRes.token;
          if (realToken) {
            currentToken = realToken;
            localStorage.setItem('balerra_admin_token', realToken);
            setToken(realToken);
            setIsAuthenticated(true);
          }
        } catch (e) {
          console.warn('Backend auto-login on mount notice:', e.message);
        }
      }

      if (!currentToken) return;

      try {
        const res = await authApi.getMe();
        if (res && res.data) {
          const userObj = {
            id: res.data.id || 'admin-001',
            name: res.data.fullName || res.data.name || 'Super Administrator',
            role: res.data.role || 'SUPER_ADMIN',
            email: res.data.email || 'admin@balera.com',
            avatar: res.data.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          };
          setAdminUser(userObj);
          localStorage.setItem('balerra_admin_user', JSON.stringify(userObj));
        }
      } catch (err) {
        console.warn('Backend session verification notice:', err.message);
      }
    };

    initSession();
  }, []);

  const login = async (email, password, remember = true) => {
    try {
      const res = await authApi.adminLogin(email, password);
      
      const authToken = res.data?.token || res.token || 'jwt-balerra-admin-token';
      const user = res.data?.admin || res.data?.user || res.user || {
        name: 'Super Administrator',
        role: 'SUPER_ADMIN',
        email: email,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      };

      setToken(authToken);
      setAdminUser(user);
      setIsAuthenticated(true);

      if (remember) {
        localStorage.setItem('balerra_admin_token', authToken);
        localStorage.setItem('balerra_admin_user', JSON.stringify(user));
      }
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
