import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { NotificationProvider } from './context/NotificationContext';
import { HotelProvider } from './context/HotelContext';
import { AdminLayout } from './components/layout/AdminLayout';

// Application Pages
import { Login } from './pages/Login';
import { DashboardOverview } from './pages/DashboardOverview';
import { Hotels } from './pages/Hotels';
import { HotelDetails } from './pages/HotelDetails';
import { Customers } from './pages/Customers';
import { CustomerDetails } from './pages/CustomerDetails';
import { Riders } from './pages/Riders';
import { RiderDetails } from './pages/RiderDetails';
import { DeliveryRequests } from './pages/DeliveryRequests';
import { DeliveryRequestDetails } from './pages/DeliveryRequestDetails';
import { ActiveDeliveryMonitoring } from './pages/ActiveDeliveryMonitoring';
import { Reports } from './pages/Reports';
import { RiderPayments } from './pages/RiderPayments';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

export default function App() {
  return (
    <AuthProvider>
      <DeliveryProvider>
        <HotelProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Routes>
                {/* Screen 01: Login */}
                <Route path="/login" element={<Login />} />

                {/* Admin Portal Protected Routes */}
                <Route element={<AdminLayout />}>
                  {/* Screen 02: Overview Dashboard */}
                  <Route path="/" element={<DashboardOverview />} />

                  {/* Hotels & Restaurants Management */}
                  <Route path="/hotels" element={<Hotels />} />
                  <Route path="/hotels/:id" element={<HotelDetails />} />

                  {/* Screen 03 & 04: Customer Directory & Details */}
                  <Route path="/customers" element={<Customers />} />
                  <Route path="/customers/:id" element={<CustomerDetails />} />

                  {/* Screen 05 & 06: Rider Management & Performance Profile */}
                  <Route path="/riders" element={<Riders />} />
                  <Route path="/riders/:id" element={<RiderDetails />} />

                  {/* Screen 07, 08, 09: Delivery Requests, Details & Assignment */}
                  <Route path="/deliveries" element={<DeliveryRequests />} />
                  <Route path="/deliveries/:id" element={<DeliveryRequestDetails />} />

                  {/* Screen 10: Active Delivery Live Monitoring */}
                  <Route path="/active-deliveries" element={<ActiveDeliveryMonitoring />} />

                  {/* Screen 11: Reports & Analytics */}
                  <Route path="/reports" element={<Reports />} />

                  {/* Screen 12: Rider Monthly Payments */}
                  <Route path="/payments" element={<RiderPayments />} />

                  {/* Screen 13: System Notifications */}
                  <Route path="/notifications" element={<Notifications />} />

                  {/* Screen 14: Settings & Configuration */}
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </NotificationProvider>
        </HotelProvider>
      </DeliveryProvider>
    </AuthProvider>
  );
}

