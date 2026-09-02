import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Navigation, Bike, MapPin, Eye, ArrowRight, Radio, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { LiveFleetMap } from '../components/maps/LiveFleetMap';
import { useDelivery } from '../context/DeliveryContext';
import { dashboardApi } from '../api/services/dashboardApi';

export const ActiveDeliveryMonitoring = () => {
  const { deliveries, riders, backendStatus } = useDelivery();
  const navigate = useNavigate();
  const [liveFleetData, setLiveFleetData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Poll or fetch live map data
  const fetchLiveFleet = async () => {
    setIsRefreshing(true);
    try {
      const res = await dashboardApi.getLiveMap();
      if (res && (res.data || res.riders)) {
        setLiveFleetData(res.data || res);
      }
    } catch (e) {
      console.warn('Backend getLiveMap notice:', e.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveFleet();
    const interval = setInterval(fetchLiveFleet, 15000); // 15s refresh
    return () => clearInterval(interval);
  }, []);

  // Filter deliveries that are currently active in transit
  const activeDeliveries = useMemo(() => {
    return deliveries.filter(d => ['Assigned', 'Accepted', 'Picked Up', 'On the Way', 'Delivered', 'Arrived at Pickup'].includes(d.status));
  }, [deliveries]);

  const [selectedDeliveryId, setSelectedDeliveryId] = useState(activeDeliveries[0]?.id || '#DLV-00126');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Active Delivery Monitoring</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Real-time GPS fleet tracking across Addis Ababa and Bale</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3.5 py-2 rounded-xl text-xs font-bold border border-emerald-200 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live GPS Sync Active</span>
          </div>

          <button
            onClick={fetchLiveFleet}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl shadow-sm transition-all"
            title="Refresh fleet GPS positions"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Grid: Map on Left (8 cols) + Active Deliveries Queue on Right (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Fleet Map */}
        <div className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm h-[620px] flex flex-col">
          <div className="flex items-center justify-between pb-3 px-2">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Live Fleet Map
            </h3>
            <span className="text-xs text-slate-400 font-semibold">
              {riders.filter(r => r.status === 'Online').length} couriers online & transmitting coordinates
            </span>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden">
            <LiveFleetMap
              activeDeliveries={activeDeliveries}
              selectedDeliveryId={selectedDeliveryId}
              onSelectDelivery={(id) => setSelectedDeliveryId(id)}
            />
          </div>
        </div>

        {/* Right Panel: Active Deliveries Queue */}
        <div className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">
              Active Deliveries ({activeDeliveries.length})
            </h3>
            <span className="text-[11px] text-brand-600 font-semibold">Live Feed</span>
          </div>

          <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
            {activeDeliveries.map((delivery) => {
              const isSelected = delivery.id === selectedDeliveryId;

              return (
                <div
                  key={delivery.id}
                  onClick={() => setSelectedDeliveryId(delivery.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2.5 ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-brand-600 text-xs">{delivery.id}</span>
                    <StatusBadge status={delivery.status} />
                  </div>

                  {/* Rider Info */}
                  <div className="flex items-center gap-2 text-xs">
                    <Bike className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">
                      Rider: {delivery.riderName || 'Unassigned'}
                    </span>
                  </div>

                  {/* Pickup & Dropoff summary */}
                  <div className="text-[11px] text-slate-500 space-y-1 bg-slate-50 p-2.5 rounded-lg">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span className="truncate">{delivery.pickupLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                      <span className="truncate">{delivery.destination}</span>
                    </div>
                  </div>

                  {/* Action Link */}
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">{delivery.time}</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/deliveries/${delivery.id.replace('#', '')}`);
                      }}
                      className="font-bold text-brand-600 hover:text-brand-700 inline-flex items-center gap-1"
                    >
                      <span>Details</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}

            {activeDeliveries.length === 0 && (
              <div className="p-6 text-center text-slate-400 text-xs">
                No active deliveries currently in progress.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
