import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Bike, 
  Package, 
  Navigation, 
  BarChart3, 
  CreditCard, 
  Bell, 
  UtensilsCrossed,
  Tag,
  Settings, 
  LogOut,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { BalerraLogo } from '../common/BalerraLogo';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export const Sidebar = () => {
  const { logout } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();

  const [isCollapsed, setIsCollapsed] = useState(() => {
    try {
      return localStorage.getItem('balera_sidebar_collapsed') === 'true';
    } catch {
      return false;
    }
  });

  const toggleCollapse = () => {
    setIsCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('balera_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Partner Management', path: '/hotels', icon: UtensilsCrossed },
    { label: 'Customers', path: '/customers', icon: Users },
    { label: 'Riders', path: '/riders', icon: Bike },
    { label: 'Delivery Requests', path: '/deliveries', icon: Package },
    { label: 'Active Deliveries', path: '/active-deliveries', icon: Navigation },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Rider Payments', path: '/payments', icon: CreditCard },
    { label: 'Promotions', path: '/promotions', icon: Tag },
    { label: 'Notifications', path: '/notifications', icon: Bell, badge: unreadCount },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <aside
      className={`bg-[#0A1938] border-r border-[#152B5B] flex flex-col h-screen sticky top-0 z-30 select-none transition-all duration-300 ease-in-out shrink-0 text-slate-200 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header & Toggle */}
      <div className={`h-20 flex items-center border-b border-[#152B5B] ${
        isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
      }`}>
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden" title="Balerra Delivery">
          <BalerraLogo size={isCollapsed ? 'small' : 'default'} showText={!isCollapsed} dark={true} />
        </NavLink>

        {!isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            title="Collapse sidebar"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Navigation List */}
      <div className={`flex-1 py-5 space-y-1.5 overflow-y-auto ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-sm font-semibold transition-all duration-150 relative group ${
                  isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/35 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="relative">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-blue-300/75 group-hover:text-white'
                      }`} />
                      {/* Collapsed notification dot badge */}
                      {isCollapsed && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0A1938]" />
                      )}
                    </div>
                    {!isCollapsed && <span>{item.label}</span>}
                  </div>

                  {!isCollapsed && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}

                  {/* Floating tooltip when collapsed */}
                  {isCollapsed && (
                    <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#071329] border border-blue-900/60 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 flex items-center gap-1.5">
                      <span>{item.label}</span>
                      {item.badge > 0 && (
                        <span className="px-1.5 py-0.2 text-[10px] font-bold rounded-full bg-rose-500 text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Footer: Expand Toggle + Logout */}
      <div className={`p-3 border-t border-[#152B5B] space-y-1 ${isCollapsed ? 'px-2' : 'px-3'}`}>
        {/* Expand button when collapsed */}
        {isCollapsed && (
          <button
            onClick={toggleCollapse}
            className="w-full flex items-center justify-center p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors relative group cursor-pointer"
            title="Expand sidebar"
          >
            <PanelLeftOpen className="w-4 h-4" />
            <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#071329] border border-blue-900/60 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Expand sidebar
            </div>
          </button>
        )}

        <button
          onClick={handleLogout}
          className={`w-full flex items-center rounded-xl text-sm font-semibold text-rose-400 hover:text-rose-200 hover:bg-rose-500/15 transition-colors relative group cursor-pointer ${
            isCollapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
          }`}
          title={isCollapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!isCollapsed && <span>Logout</span>}

          {/* Floating tooltip when collapsed */}
          {isCollapsed && (
            <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#071329] border border-blue-900/60 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
  );
};
