import React, { useState } from 'react';
import { Search, Bell, ChevronDown, Check, RefreshCw, Radio, Trash2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useDelivery } from '../../context/DeliveryContext';
import { useNotifications } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';

export const Header = ({ title = 'Dashboard', subtitle = 'Overview of all delivery operations' }) => {
  const { adminUser } = useAuth();
  const { backendStatus, syncWithBackend } = useDelivery();
  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification } = useNotifications();
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      navigate(`/deliveries?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    await syncWithBackend();
    setTimeout(() => setIsSyncing(false), 500);
  };

  return (
    <header className="h-20 bg-white border-b border-slate-200/80 px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Title / Breadcrumb context */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs font-medium text-slate-400 mt-0.5">{subtitle}</p>
        )}
      </div>

      {/* Right controls: Backend Status, Search, Notification Bell, Admin Profile */}
      <div className="flex items-center gap-4">
        {/* Backend API Connectivity Indicator */}
        <div 
          onClick={handleSync}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer select-none ${
            backendStatus.isOnline
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
          }`}
          title="Click to refresh connection with Backend API (http://localhost:5000/api/v1)"
        >
          <span className={`w-2 h-2 rounded-full ${backendStatus.isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="hidden sm:inline">
            {backendStatus.isOnline ? 'Backend Connected (v1.1)' : 'Demo / Standby'}
          </span>
          <RefreshCw className={`w-3 h-3 ml-1 text-slate-400 ${isSyncing ? 'animate-spin' : ''}`} />
        </div>

        {/* Search Bar */}
        <div className="relative w-64 hidden md:block">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search deliveries, riders, customers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Notification Bell Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            )}
          </button>

          {/* Dropdown panel */}
          {showNotifs && (
            <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">Notifications</h4>
                  {unreadCount > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-brand-50 text-brand-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
                >
                  Mark all read
                </button>
              </div>

              <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto mt-2">
                {notifications.slice(0, 5).map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => {
                      markAsRead(notif.id);
                      navigate('/notifications');
                      setShowNotifs(false);
                    }}
                    className={`py-2.5 px-2 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors flex items-start justify-between gap-2 group ${
                      !notif.isRead ? 'bg-blue-50/40' : ''
                    }`}
                  >
                    <div className="flex-1">
                      <p className="text-xs font-medium text-slate-800 line-clamp-2">{notif.title}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">{notif.time}</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="p-1 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                      title="Delete notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="pt-2 mt-2 border-t border-slate-100 text-center">
                <button
                  onClick={() => {
                    navigate('/notifications');
                    setShowNotifs(false);
                  }}
                  className="text-xs font-semibold text-brand-600 hover:text-brand-700"
                >
                  View all notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Chip */}
        <div 
          onClick={() => navigate('/settings')}
          className="flex items-center gap-3 pl-3 border-l border-slate-200 cursor-pointer hover:opacity-90 transition-opacity"
        >
          <img
            src={adminUser?.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
            alt="Admin Avatar"
            className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-100"
          />
          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-900 leading-tight">
              {adminUser?.name || 'Admin'}
            </span>
            <span className="text-[11px] font-medium text-slate-400">
              {adminUser?.role || 'Super Admin'}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
