import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ChevronRight, Phone, Mail, MapPin, Calendar, ArrowLeft, PackageCheck } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDelivery } from '../context/DeliveryContext';

export const CustomerDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { customers, deliveries } = useDelivery();

  const customer = customers.find(c => c.id === id) || customers[0];
  const customerDeliveries = deliveries.filter(d => d.customerId === customer?.id || d.customerName === customer?.name);

  if (!customer) {
    return (
      <div className="p-8 text-center">
        <p className="text-sm text-slate-500">Customer not found.</p>
        <button onClick={() => navigate('/customers')} className="mt-4 text-xs font-bold text-brand-600">
          Back to Customers
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumbs & Header */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
        <Link to="/customers" className="hover:text-brand-600 transition-colors">Customers</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700">{customer.id}</span>
      </div>

      {/* Top 2 Cards: Left Profile + Right Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Profile Card */}
        <div className="md:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <img
            src={customer.avatar}
            alt={customer.name}
            className="w-20 h-20 rounded-2xl object-cover ring-4 ring-slate-100"
          />

          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-slate-900">{customer.name}</h2>
              <StatusBadge status={customer.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-mono">{customer.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{customer.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>Joined {customer.joinedDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Statistics Card */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-slate-50 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-400">Total Deliveries</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{customer.totalDeliveries}</p>
            </div>
            <div className="p-3 bg-emerald-50/50 rounded-xl">
              <span className="text-[11px] font-semibold text-emerald-600">Completed</span>
              <p className="text-xl font-bold text-emerald-700 mt-0.5">{customer.completedDeliveries}</p>
            </div>
            <div className="p-3 bg-rose-50/50 rounded-xl">
              <span className="text-[11px] font-semibold text-rose-600">Cancelled</span>
              <p className="text-xl font-bold text-rose-700 mt-0.5">{customer.cancelledDeliveries}</p>
            </div>
            <div className="p-3 bg-orange-50/50 rounded-xl">
              <span className="text-[11px] font-semibold text-orange-600">In Progress</span>
              <p className="text-xl font-bold text-orange-700 mt-0.5">{customer.inProgressDeliveries}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Customer's Deliveries Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Deliveries</h3>
          <span className="text-xs text-slate-400">{customerDeliveries.length} orders total</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Pickup</th>
                <th className="px-6 py-3.5">Destination</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {customerDeliveries.map((delivery) => (
                <tr
                  key={delivery.id}
                  onClick={() => navigate(`/deliveries/${delivery.id.replace('#', '')}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold text-brand-600">{delivery.id}</td>
                  <td className="px-6 py-4 text-slate-700">{delivery.pickupLocation}</td>
                  <td className="px-6 py-4 text-slate-700">{delivery.destination}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={delivery.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-400">{delivery.date}</td>
                </tr>
              ))}
              {customerDeliveries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No delivery records found for this customer.
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
