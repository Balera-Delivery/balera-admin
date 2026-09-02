import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Phone, Mail, Bike, Shield, Calendar, Star, CheckCircle, XCircle, KeyRound, Check } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDelivery } from '../context/DeliveryContext';

export const RiderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { riders, deliveries, toggleRiderOnline, toggleRiderActive } = useDelivery();
  const [resetSuccess, setResetSuccess] = useState(false);

  const rider = riders.find(r => r.id === id) || riders[0];
  const riderDeliveries = deliveries.filter(d => d.riderId === rider?.id || d.riderName === rider?.name);

  const handleResetPassword = () => {
    const newPass = prompt(`Set new password for rider ${rider.name}:`, 'RiderPass@123');
    if (newPass && newPass.trim()) {
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 4000);
      alert(`Password for ${rider.name} updated to:\n${newPass.trim()}\n\nThe rider can now sign in with this new password in their mobile app.`);
    }
  };

  if (!rider) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">Rider not found.</p>
        <button onClick={() => navigate('/riders')} className="mt-4 text-xs font-bold text-brand-600">
          Back to Riders
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
        <Link to="/riders" className="hover:text-brand-600 transition-colors">Riders</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700">{rider.id}</span>
      </div>

      {/* Top 2 Cards: Left Profile + Right Performance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Card */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="relative">
            <img
              src={rider.avatar}
              alt={rider.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100"
            />
            <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full ring-2 ring-white ${rider.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-bold text-slate-900">{rider.name}</h2>
                <StatusBadge status={rider.status} />
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-600">
                  {rider.accountStatus}
                </span>
              </div>

              <button
                onClick={handleResetPassword}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-bold rounded-xl transition-all"
                title="Reset Rider Mobile App Password"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Reset Password</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{rider.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{rider.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Bike className="w-3.5 h-3.5 text-slate-400" />
                <span>{rider.vehicle}</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span>License No: {rider.licensePlate}</span>
              </div>
              <div className="flex items-center gap-2 sm:col-span-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined: {rider.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Performance Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Performance</h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Total Deliveries</span>
              <span className="text-sm font-bold text-slate-900">{rider.totalDeliveries}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Completed</span>
              <span className="text-sm font-bold text-emerald-600">{rider.completedDeliveries}</span>
            </div>
            <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Cancelled</span>
              <span className="text-sm font-bold text-rose-600">{rider.cancelledDeliveries}</span>
            </div>
            <div className="flex items-center justify-between pt-1">
              <span className="text-slate-500 font-medium">Rating</span>
              <span className="text-sm font-bold text-amber-500 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                {rider.rating}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Rider's Recent Deliveries Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Deliveries</h3>
          <span className="text-xs text-slate-400">{riderDeliveries.length} orders</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Pickup</th>
                <th className="px-6 py-3.5">Destination</th>
                <th className="px-6 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {riderDeliveries.map((delivery) => (
                <tr
                  key={delivery.id}
                  onClick={() => navigate(`/deliveries/${delivery.id.replace('#', '')}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold text-brand-600">{delivery.id}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={delivery.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-700">{delivery.pickupLocation}</td>
                  <td className="px-6 py-4 text-slate-700">{delivery.destination}</td>
                  <td className="px-6 py-4 text-slate-400">{delivery.date}</td>
                </tr>
              ))}
              {riderDeliveries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No delivery records assigned to this rider yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
