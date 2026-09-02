import React, { useState, useEffect } from 'react';
import { Calendar, Download, TrendingUp, CheckCircle, XCircle, Clock, ChevronDown, RefreshCw } from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { DeliveriesLineChart } from '../components/charts/DeliveriesLineChart';
import { StatusDonutChart } from '../components/charts/StatusDonutChart';
import { reportsChartData, reportsStatusBreakdown } from '../data/mockData';
import { useDelivery } from '../context/DeliveryContext';
import { reportsApi } from '../api/services/reportsApi';

export const Reports = () => {
  const { riders } = useDelivery();
  const [period, setPeriod] = useState('all');
  const [dateRange, setDateRange] = useState('May 1 - May 10, 2024');
  const [reportData, setReportData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchReport = async () => {
      setIsLoading(true);
      try {
        const res = await reportsApi.getReports(period);
        if (res && res.data) {
          setReportData(res.data);
        }
      } catch (err) {
        console.warn('Backend reports notice:', err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [period]);

  const kpis = [
    {
      title: 'Total Deliveries',
      value: reportData?.totalDeliveries?.toLocaleString() || '1,248',
      change: '+15.3%',
      isPositive: true,
      subtitle: 'vs previous period',
    },
    {
      title: 'Completed',
      value: reportData?.completedCount?.toLocaleString() || '1,102',
      change: '88.3%',
      isPositive: true,
      subtitle: '+5.2% completion rate',
    },
    {
      title: 'Cancelled',
      value: reportData?.cancelledCount?.toLocaleString() || '46',
      change: '3.7%',
      isPositive: false,
      subtitle: '-1.1% cancellation rate',
    },
    {
      title: 'In Progress',
      value: reportData?.inProgressCount?.toLocaleString() || '100',
      change: '8.0%',
      isPositive: true,
      subtitle: 'Active volume',
    },
  ];

  const handleExport = () => {
    alert('Exporting Balerra Delivery Performance Report (CSV/PDF)...');
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Date Range Picker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Reports</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Delivery performance reports and business intelligence</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm outline-none cursor-pointer"
          >
            <option value="all">All Time</option>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>

          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="w-4 h-4 text-brand-600" />
            <span>{dateRange}</span>
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {kpis.map((kpi, idx) => (
          <StatCard key={idx} {...kpi} />
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Deliveries Over Time Line Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900">Deliveries Over Time</h3>
            <span className="text-xs font-semibold text-brand-600 bg-brand-50 px-2.5 py-1 rounded-full">
              Daily Trends
            </span>
          </div>
          <DeliveriesLineChart data={reportsChartData} />
        </div>

        {/* Right: Deliveries by Status Donut Chart (5 cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-slate-900">Deliveries by Status</h3>
            <span className="text-xs text-slate-400">Total 1,248</span>
          </div>

          <StatusDonutChart data={reportsStatusBreakdown} />

          {/* Legend */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            {reportsStatusBreakdown.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                  <span className="text-slate-600">{item.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-900">{item.value}</span>
                  <span className="text-slate-400 text-[11px]">({item.percentage})</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Top Performing Riders Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Rider Performance Summary</h3>
          <span className="text-xs text-slate-400">Top active couriers</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Rider</th>
                <th className="px-6 py-3.5">Vehicle</th>
                <th className="px-6 py-3.5">Total Trips</th>
                <th className="px-6 py-3.5">Completed</th>
                <th className="px-6 py-3.5">Success Rate</th>
                <th className="px-6 py-3.5">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {riders.map(r => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-3.5 font-bold text-slate-900 flex items-center gap-2.5">
                    <img src={r.avatar} alt={r.name} className="w-7 h-7 rounded-full object-cover" />
                    <span>{r.name}</span>
                  </td>
                  <td className="px-6 py-3.5 text-slate-600">{r.vehicle}</td>
                  <td className="px-6 py-3.5 font-bold text-slate-900">{r.totalDeliveries}</td>
                  <td className="px-6 py-3.5 text-emerald-600 font-bold">{r.completedDeliveries}</td>
                  <td className="px-6 py-3.5">
                    <span className="font-bold text-slate-900">
                      {Math.round((r.completedDeliveries / (r.totalDeliveries || 1)) * 100)}%
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-amber-500 font-bold">{r.rating} ★</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
