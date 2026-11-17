import React, { useState, useEffect } from 'react';
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
  PanelLeftOpen,
  X
} from 'lucide-react';
import { BalerraLogo } from '../common/BalerraLogo';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

// True on screens 1024px and wider (desktop), where the sidebar is always shown
const useIsDesktop = () => {
  const query = '(min-width: 1024px)';
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = (e) => setIsDesktop(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return isDesktop;
};

export const Sidebar = ({ mobileOpen = false, onClose = () => {} }) => {
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

  const isDesktop = useIsDesktop();
  // The small icon-only sidebar is a desktop option; the phone drawer always shows labels
  const collapsed = isDesktop && isCollapsed;

  // Close the phone drawer with the Escape key, and stop the page behind it from scrolling
  useEffect(() => {
    if (!mobileOpen || isDesktop) return undefined;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [mobileOpen, isDesktop, onClose]);

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
    <>
    {/* Dark background behind the phone drawer (tap to close) */}
    {mobileOpen && !isDesktop && (
      <div
        className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-[1px] lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />
    )}
    <aside
      aria-label="Main menu"
      className={`bg-[#0A1938] border-r border-[#152B5B] flex flex-col h-dvh select-none transition-all duration-300 ease-in-out shrink-0 text-slate-200
        fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
        lg:sticky lg:top-0 lg:z-30 lg:translate-x-0 lg:shadow-none lg:max-w-none ${collapsed ? 'lg:w-20' : 'lg:w-64'}`}
    >
      {/* Brand Header & Toggle */}
      <div className={`h-16 lg:h-20 flex items-center border-b border-[#152B5B] ${
        collapsed ? 'justify-center px-2' : 'justify-between px-5'
      }`}>
        <NavLink to="/" className="flex items-center gap-3 overflow-hidden" title="Balerra Delivery">
          <BalerraLogo size={collapsed ? 'small' : 'default'} showText={!collapsed} dark={true} />
        </NavLink>

        {/* Phone: close the drawer */}
        {!isDesktop && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {isDesktop && !collapsed && (
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
      <div className={`flex-1 py-5 space-y-1.5 overflow-y-auto ${collapsed ? 'px-2' : 'px-3'}`}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                `flex items-center rounded-xl text-sm font-semibold transition-all duration-150 relative group ${
                  collapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/35 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
                    <div className="relative">
                      <Icon className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive ? 'text-white' : 'text-blue-300/75 group-hover:text-white'
                      }`} />
                      {/* Collapsed notification dot badge */}
                      {collapsed && item.badge > 0 && (
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0A1938]" />
                      )}
                    </div>
                    {!collapsed && <span>{item.label}</span>}
                  </div>

                  {!collapsed && item.badge > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-rose-500 text-white">
                      {item.badge}
                    </span>
                  )}

                  {/* Floating tooltip when collapsed */}
                  {collapsed && (
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
      <div className={`p-3 border-t border-[#152B5B] space-y-1 ${collapsed ? 'px-2' : 'px-3'}`}>
        {/* Expand button when collapsed */}
        {isDesktop && collapsed && (
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
            collapsed ? 'justify-center p-2.5' : 'gap-3 px-3.5 py-2.5'
          }`}
          title={collapsed ? 'Logout' : undefined}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {!collapsed && <span>Logout</span>}

          {/* Floating tooltip when collapsed */}
          {collapsed && (
            <div className="fixed left-20 ml-2 px-3 py-1.5 bg-[#071329] border border-blue-900/60 text-white text-xs font-semibold rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              Logout
            </div>
          )}
        </button>
      </div>
    </aside>
    </>
  );
};
