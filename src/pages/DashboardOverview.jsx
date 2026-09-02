import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Bike, Package, CheckCircle2, Clock, UserCheck, ArrowRight } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { StatusBadge } from '../components/common/StatusBadge';
import { useDelivery } from '../context/DeliveryContext';

export const DashboardOverview = () => {
  const { stats, deliveries } = useDelivery();
  const navigate = useNavigate();

  // Top 4 overview cards
  const topKpis = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toLocaleString(),
      change: stats.customerGrowth,
      isPositive: true,
      subtitle: 'vs last month',
      icon: Users,
    },
    {
      title: 'Total Riders',
      value: stats.totalRiders.toLocaleString(),
      change: stats.riderGrowth,
      isPositive: true,
      subtitle: 'vs last month',
      icon: Bike,
    },
    {
      title: "Today's Deliveries",
      value: stats.todayDeliveries.toLocaleString(),
      change: stats.todayDeliveriesGrowth,
      isPositive: true,
      subtitle: 'vs yesterday',
      icon: Package,
    },
    {
      title: 'Completed Today',
      value: stats.completedToday.toLocaleString(),
      change: stats.completedGrowth,
      isPositive: true,
      subtitle: 'vs yesterday',
      icon: CheckCircle2,
    },
  ];

  // 4 Delivery Request status breakdown cards
  const statusPills = [
    { label: 'Pending', count: stats.pendingCount, color: 'text-amber-600 bg-amber-50 border-amber-200', dot: 'bg-amber-500' },
    { label: 'Assigned', count: stats.assignedCount, color: 'text-blue-600 bg-blue-50 border-blue-200', dot: 'bg-blue-500' },
    { label: 'In Progress', count: stats.inProgressCount, color: 'text-orange-600 bg-orange-50 border-orange-200', dot: 'bg-orange-500' },
    { label: 'Completed Today', count: stats.completedCount, color: 'text-emerald-600 bg-emerald-50 border-emerald-200', dot: 'bg-emerald-500' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {topKpis.map((kpi, idx) => (
          <StatCard key={idx} {...kpi} />
        ))}
      </div>

      {/* Delivery Requests Status Row */}
      <div>
        <h3 className="text-sm font-bold text-slate-800 mb-3">Delivery Requests</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {statusPills.map((pill, idx) => (
            <div 
              key={idx}
              onClick={() => navigate('/deliveries')}
              className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow transition-all cursor-pointer flex items-center justify-between border-slate-200`}
            >
              <div>
                <p className="text-xs font-semibold text-slate-500">{pill.label}</p>
                <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{pill.count}</h4>
              </div>
              <span className={`w-3 h-3 rounded-full ${pill.dot}`}></span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Delivery Requests Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">Recent Delivery Requests</h3>
          <button
            onClick={() => navigate('/deliveries')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

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
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {deliveries.slice(0, 5).map((delivery) => (
                <tr
                  key={delivery.id}
                  onClick={() => navigate(`/deliveries/${delivery.backendId || delivery.id.replace('#', '')}`)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4 font-bold text-brand-600">{delivery.id}</td>
                  <td className="px-6 py-4 text-slate-900 font-semibold">{delivery.customerName}</td>
                  <td className="px-6 py-4 text-slate-600">{delivery.pickupLocation}</td>
                  <td className="px-6 py-4 text-slate-600">{delivery.destination}</td>
                  <td className="px-6 py-4">
                    <StatusBadge status={delivery.status} />
                  </td>
                  <td className="px-6 py-4 text-slate-400 font-medium">{delivery.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* View All Requests Footer Link */}
        <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 text-center">
          <button
            onClick={() => navigate('/deliveries')}
            className="text-xs font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1.5"
          >
            <span>View All Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
