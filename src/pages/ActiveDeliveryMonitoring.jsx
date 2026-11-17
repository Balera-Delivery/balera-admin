import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Navigation, 
  Bike, 
  MapPin, 
  Eye, 
  ArrowRight, 
  Radio, 
  RefreshCw, 
  Search, 
  Crosshair, 
  Phone,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { LiveFleetMap } from '../components/maps/LiveFleetMap';
import { useDelivery } from '../context/DeliveryContext';
import { dashboardApi } from '../api/services/dashboardApi';
import { onRiderLocation, onDeliveryUpdate } from '../services/socket';

export const ActiveDeliveryMonitoring = () => {
  const { deliveries, riders, backendStatus } = useDelivery();
  const navigate = useNavigate();
  const [liveFleetData, setLiveFleetData] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isWsConnected, setIsWsConnected] = useState(true);

  // Search, filtering, and view state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [isMapExpanded, setIsMapExpanded] = useState(false);

  // Fetch initial live map data
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

    // ⚡ Real-Time WebSocket stream for live rider GPS locations
    const unsubRider = onRiderLocation((payload) => {
      setIsWsConnected(true);
      setLiveFleetData((prev) => {
        if (!prev) return prev;
        const currentRiders = prev.riders || [];
        const index = currentRiders.findIndex((r) => r.id === payload.riderId);
        if (index >= 0) {
          const updated = [...currentRiders];
          updated[index] = {
            ...updated[index],
            currentLatitude: payload.latitude,
            currentLongitude: payload.longitude,
            heading: payload.heading,
            lastLocationUpdate: payload.timestamp || new Date().toISOString(),
          };
          return { ...prev, riders: updated };
        }
        return prev;
      });
    });

    // ⚡ Real-Time WebSocket stream for delivery status transitions
    const unsubDelivery = onDeliveryUpdate(() => {
      fetchLiveFleet();
    });

    // Light background sync interval
    const interval = setInterval(fetchLiveFleet, 60000);

    return () => {
      unsubRider();
      unsubDelivery();
      clearInterval(interval);
    };
  }, []);

  // Filter deliveries that are currently active in transit
  const allActiveDeliveries = useMemo(() => {
    return deliveries.filter(d => 
      ['Assigned', 'Accepted', 'Picked Up', 'On the Way', 'Delivered', 'Arrived at Pickup'].includes(d.status)
    );
  }, [deliveries]);

  // Filtered list based on search and status tabs
  const filteredDeliveries = useMemo(() => {
    return allActiveDeliveries.filter(d => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch = !q || (
        d.id.toLowerCase().includes(q) ||
        (d.riderName && d.riderName.toLowerCase().includes(q)) ||
        (d.customerName && d.customerName.toLowerCase().includes(q)) ||
        (d.pickupLocation && d.pickupLocation.toLowerCase().includes(q)) ||
        (d.destination && d.destination.toLowerCase().includes(q))
      );

      const matchesStatus = statusFilter === 'All' || d.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [allActiveDeliveries, searchQuery, statusFilter]);

  const [selectedDeliveryId, setSelectedDeliveryId] = useState(
    allActiveDeliveries[0]?.id || '#DLV-00126'
  );

  const onlineRidersCount = riders.filter(r => r.status === 'Online').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-bold text-slate-900">Active Delivery Monitoring</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200/60">
              {allActiveDeliveries.length} Active in Transit
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time GPS fleet tracking and live interactive telemetry
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-bold border border-emerald-200/80 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span>Live GPS Sync</span>
          </div>

          <button
            onClick={fetchLiveFleet}
            className="p-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl shadow-2xs transition-all cursor-pointer"
            title="Refresh fleet GPS positions"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-brand-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Layout: Interactive Map + Delivery Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Fleet Map Container */}
        <div className={`${isMapExpanded ? 'lg:col-span-12' : 'lg:col-span-8'} bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col transition-all duration-300 ${isMapExpanded ? 'h-[750px]' : 'h-[640px]'}`}>
          <div className="flex items-center justify-between pb-3 px-1">
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Live Interactive Tracking
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                {onlineRidersCount} Couriers Online
              </span>
            </div>

            <button
              onClick={() => setIsMapExpanded(prev => !prev)}
              className="px-2.5 py-1 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
            >
              {isMapExpanded ? (
                <>
                  <Minimize2 className="w-3.5 h-3.5" />
                  <span>Standard View</span>
                </>
              ) : (
                <>
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span>Expand Map</span>
                </>
              )}
            </button>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden relative">
            <LiveFleetMap
              activeDeliveries={allActiveDeliveries}
              selectedDeliveryId={selectedDeliveryId}
              onSelectDelivery={(id) => setSelectedDeliveryId(id)}
              onViewDetails={(id) => navigate(`/deliveries/${id}`)}
              isFullscreen={isMapExpanded}
              onToggleFullscreen={() => setIsMapExpanded(prev => !prev)}
            />
          </div>
        </div>

        {/* Right Panel: Active Deliveries Queue & Filters */}
        <div className={`${isMapExpanded ? 'lg:col-span-12' : 'lg:col-span-4'} bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm space-y-3.5`}>
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-slate-900">
                Active Orders
              </h3>
              <span className="text-xs font-bold text-brand-600">
                ({filteredDeliveries.length})
              </span>
            </div>

            <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Feed
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search code, courier, or location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {['All', 'On the Way', 'Picked Up', 'Assigned'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                  statusFilter === status
                    ? 'bg-brand-600 text-white shadow-2xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                {status}
              </button>
            ))}
          </div>

          {/* Deliveries List Cards */}
          <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-0.5">
            {filteredDeliveries.map((delivery) => {
              const isSelected = delivery.id === selectedDeliveryId;

              return (
                <div
                  key={delivery.id}
                  onClick={() => setSelectedDeliveryId(delivery.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/50 ring-2 ring-brand-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-brand-600 text-xs tracking-wide">
                      {delivery.id}
                    </span>
                    <StatusBadge status={delivery.status} />
                  </div>

                  {/* Rider / Courier Info */}
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold truncate">
                      <Bike className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                      <span className="truncate">{delivery.riderName || 'Unassigned'}</span>
                    </div>

                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                      {delivery.estimatedTime || 'In Transit'}
                    </span>
                  </div>

                  {/* Locations */}
                  <div className="text-[11px] text-slate-600 space-y-1 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                      <span className="truncate font-medium">{delivery.pickupLocation}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0"></span>
                      <span className="truncate font-medium">{delivery.destination}</span>
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="pt-0.5 flex items-center justify-between text-xs">
                    <span className="text-[10px] text-slate-400 font-medium">
                      {delivery.time || 'Live'}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDeliveryId(delivery.id);
                        }}
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-md transition-colors flex items-center gap-1 ${
                          isSelected
                            ? 'bg-brand-600 text-white'
                            : 'text-brand-600 hover:bg-brand-50'
                        }`}
                      >
                        <Crosshair className="w-3 h-3" />
                        <span>Track</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/deliveries/${delivery.id.replace('#', '')}`);
                        }}
                        className="text-[11px] font-bold text-slate-500 hover:text-slate-800 flex items-center gap-0.5"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredDeliveries.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No matching deliveries found.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
