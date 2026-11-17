import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';

const routeTitleMap = {
  '/': { title: 'Dashboard', subtitle: 'Overview of all delivery operations' },
  '/hotels': { title: 'Partners', subtitle: 'Partner restaurants and menus' },
  '/customers': { title: 'Customers', subtitle: 'Manage all customers' },
  '/riders': { title: 'Riders', subtitle: 'Manage all riders' },
  '/deliveries': { title: 'Delivery Requests', subtitle: 'All delivery requests' },
  '/active-deliveries': { title: 'Active Deliveries', subtitle: 'Real-time tracking of active deliveries' },
  '/reports': { title: 'Reports', subtitle: 'Delivery performance reports' },
  '/payments': { title: 'Rider Payments', subtitle: 'Manage rider monthly payments' },
  '/promotions': { title: 'Promotions', subtitle: 'Manage vouchers, free delivery campaigns, and restaurant deals' },
  '/notifications': { title: 'Notifications', subtitle: 'System Notifications' },
  '/settings': { title: 'Settings', subtitle: 'Configure platform settings and company details' },
};

export const AdminLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  // Phone / tablet: the menu is a slide-in drawer opened from the ☰ button
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Close the drawer whenever the page changes
  useEffect(() => {
    setIsMobileNavOpen(false);
  }, [location.pathname]);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }

  // Determine current page header meta
  let currentMeta = routeTitleMap[location.pathname];
  if (!currentMeta) {
    if (location.pathname.startsWith('/customers/')) {
      currentMeta = { title: 'Customer Details', subtitle: 'View customer profile and order history' };
    } else if (location.pathname.startsWith('/riders/')) {
      currentMeta = { title: 'Rider Details', subtitle: 'View rider performance and assignment history' };
    } else if (location.pathname.startsWith('/hotels/')) {
      currentMeta = { title: 'Partner Details', subtitle: 'Restaurant profile and menu' };
    } else if (location.pathname.startsWith('/deliveries/')) {
      currentMeta = { title: 'Delivery Request Details', subtitle: 'Track and manage delivery request' };
    } else {
      currentMeta = { title: 'Balera Delivery Admin', subtitle: 'Management Dashboard' };
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar mobileOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          onMenuClick={() => setIsMobileNavOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
