import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DeliveryProvider } from './context/DeliveryContext';
import { NotificationProvider } from './context/NotificationContext';
import { HotelProvider } from './context/HotelContext';
import { AdminLayout } from './components/layout/AdminLayout';
// The login page loads right away; every other page loads only when it is opened (faster start)
import { Login } from './pages/Login';
const DashboardOverview = lazy(() => import('./pages/DashboardOverview').then((m) => ({ default: m.DashboardOverview })));
const Hotels = lazy(() => import('./pages/Hotels').then((m) => ({ default: m.Hotels })));
const HotelDetails = lazy(() => import('./pages/HotelDetails').then((m) => ({ default: m.HotelDetails })));
const Customers = lazy(() => import('./pages/Customers').then((m) => ({ default: m.Customers })));
const CustomerDetails = lazy(() => import('./pages/CustomerDetails').then((m) => ({ default: m.CustomerDetails })));
const Riders = lazy(() => import('./pages/Riders').then((m) => ({ default: m.Riders })));
const RiderDetails = lazy(() => import('./pages/RiderDetails').then((m) => ({ default: m.RiderDetails })));
const DeliveryRequests = lazy(() => import('./pages/DeliveryRequests').then((m) => ({ default: m.DeliveryRequests })));
const DeliveryRequestDetails = lazy(() => import('./pages/DeliveryRequestDetails').then((m) => ({ default: m.DeliveryRequestDetails })));
const ActiveDeliveryMonitoring = lazy(() => import('./pages/ActiveDeliveryMonitoring').then((m) => ({ default: m.ActiveDeliveryMonitoring })));
const Reports = lazy(() => import('./pages/Reports').then((m) => ({ default: m.Reports })));
const RiderPayments = lazy(() => import('./pages/RiderPayments').then((m) => ({ default: m.RiderPayments })));
const Promotions = lazy(() => import('./pages/Promotions').then((m) => ({ default: m.Promotions })));
const Notifications = lazy(() => import('./pages/Notifications').then((m) => ({ default: m.Notifications })));
const Settings = lazy(() => import('./pages/Settings').then((m) => ({ default: m.Settings })));

const PageLoader = () => (
  <div className="flex items-center justify-center py-24" role="status" aria-label="Loading">
    <div className="w-8 h-8 rounded-full border-4 border-brand-100 border-t-brand-600 animate-spin" />
  </div>
);


export default function App() {
  return (
    <AuthProvider>
      <DeliveryProvider>
        <HotelProvider>
          <NotificationProvider>
            <BrowserRouter>
              <Suspense fallback={<PageLoader />}>
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

                  {/* Promotions & Discounts Management */}
                  <Route path="/promotions" element={<Promotions />} />

                  {/* Screen 13: System Notifications */}
                  <Route path="/notifications" element={<Notifications />} />

                  {/* Screen 14: Settings & Configuration */}
                  <Route path="/settings" element={<Settings />} />
                </Route>

                {/* Catch-all redirect */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Suspense>
            </BrowserRouter>
          </NotificationProvider>
        </HotelProvider>
      </DeliveryProvider>
    </AuthProvider>
  );
}

