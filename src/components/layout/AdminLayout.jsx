import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '../../context/AuthContext';

const routeTitleMap = {
  '/': { title: 'Dashboard', subtitle: 'Overview of all delivery operations' },
  '/customers': { title: 'Customers', subtitle: 'Manage all customers' },
  '/riders': { title: 'Riders', subtitle: 'Manage all riders' },
  '/deliveries': { title: 'Delivery Requests', subtitle: 'All delivery requests' },
  '/active-deliveries': { title: 'Active Delivery Monitoring', subtitle: 'Real-time tracking of active deliveries' },
  '/reports': { title: 'Reports', subtitle: 'Delivery performance reports' },
  '/payments': { title: 'Rider Payments', subtitle: 'Manage rider monthly payments' },
  '/notifications': { title: 'Notifications', subtitle: 'System Notifications' },
  '/settings': { title: 'Settings', subtitle: 'Configure platform settings and company details' },
};

export const AdminLayout = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Determine current page header meta
  let currentMeta = routeTitleMap[location.pathname];
  if (!currentMeta) {
    if (location.pathname.startsWith('/customers/')) {
      currentMeta = { title: 'Customer Details', subtitle: 'View customer profile and order history' };
    } else if (location.pathname.startsWith('/riders/')) {
      currentMeta = { title: 'Rider Details', subtitle: 'View rider performance and assignment history' };
    } else if (location.pathname.startsWith('/deliveries/')) {
      currentMeta = { title: 'Delivery Request Details', subtitle: 'Track and manage delivery request' };
    } else {
      currentMeta = { title: 'Balerra Delivery Admin', subtitle: 'Management Dashboard' };
    }
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={currentMeta.title} subtitle={currentMeta.subtitle} />
        
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
