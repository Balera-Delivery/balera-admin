import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Eye, UserPlus, ArrowUpDown } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { AssignRiderModal } from '../components/modals/AssignRiderModal';
import { useDelivery } from '../context/DeliveryContext';

export const DeliveryRequests = () => {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  
  const { deliveries } = useDelivery();
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [dateFilter, setDateFilter] = useState('May 10, 2024');
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedDeliveryToAssign, setSelectedDeliveryToAssign] = useState(null);

  const navigate = useNavigate();

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter(d => {
      const matchesSearch = 
        d.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.pickupLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.destination.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = 
        statusFilter === 'All Status' ||
        (statusFilter === 'In Progress' && ['Accepted', 'Picked Up', 'On the Way', 'Delivered'].includes(d.status)) ||
        d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [deliveries, searchQuery, statusFilter]);

  const statuses = ['All Status', 'Pending', 'Assigned', 'In Progress', 'Completed', 'Cancelled'];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Delivery Requests</h2>
        <p className="text-xs font-medium text-slate-400 mt-0.5">Manage and dispatch customer delivery requests</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Status Dropdown */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 text-slate-700"
            >
              {statuses.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Date Picker Button */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">Date:</span>
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{dateFilter}</span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Customer</th>
                <th className="px-6 py-3.5">Pickup</th>
                <th className="px-6 py-3.5">Destination</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Time</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredDeliveries.map((delivery) => (
                <tr key={delivery.id} className="hover:bg-slate-50/80 transition-colors">
                  <td 
                    onClick={() => navigate(`/deliveries/${delivery.backendId || delivery.id.replace('#', '')}`)}
                    className="px-6 py-4 font-bold text-brand-600 cursor-pointer"
                  >
                    {delivery.id}
                  </td>
                  <td 
                    onClick={() => navigate(`/deliveries/${delivery.backendId || delivery.id.replace('#', '')}`)}
                    className="px-6 py-4 font-bold text-slate-900 cursor-pointer"
                  >
                    {delivery.customerName}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{delivery.pickupLocation}</td>
                  <td className="px-6 py-4 text-slate-600">{delivery.destination}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={delivery.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{delivery.time}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {delivery.status === 'Pending' && (
                        <button
                          onClick={() => setSelectedDeliveryToAssign(delivery)}
                          className="px-3 py-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-lg text-xs font-bold transition-colors inline-flex items-center gap-1.5"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign</span>
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/deliveries/${delivery.backendId || delivery.id.replace('#', '')}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="View Delivery Details & Route Map"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-medium">
                    No delivery requests match your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {filteredDeliveries.length} of {deliveries.length} requests</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
              &lt;
            </button>
            <button className="px-3 py-1 rounded-lg bg-brand-600 text-white font-bold">
              1
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Quick Assign Modal */}
      <AssignRiderModal
        isOpen={!!selectedDeliveryToAssign}
        onClose={() => setSelectedDeliveryToAssign(null)}
        delivery={selectedDeliveryToAssign}
      />
    </div>
  );
};
