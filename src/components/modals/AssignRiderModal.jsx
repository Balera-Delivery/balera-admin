import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { StatusBadge } from '../common/StatusBadge';
import { useDelivery } from '../../context/DeliveryContext';
import { useNotifications } from '../../context/NotificationContext';
import { dashboardApi } from '../../api/services/dashboardApi';
import { Bike, CheckCircle2, User, MapPin, Compass, Navigation } from 'lucide-react';

export const AssignRiderModal = ({ isOpen, onClose, delivery }) => {
  const { riders, assignRider } = useDelivery();
  const { addNotification } = useNotifications();
  const [selectedRiderId, setSelectedRiderId] = useState(delivery?.riderId || '');
  const [nearbyRiders, setNearbyRiders] = useState([]);
  const [isLoadingNearby, setIsLoadingNearby] = useState(false);

  // Fetch proximity dispatch list if coordinates are available
  useEffect(() => {
    if (!isOpen || !delivery) return;

    const fetchNearby = async () => {
      setIsLoadingNearby(true);
      try {
        const pickup = delivery.routeCoordinates?.[0];
        const res = await dashboardApi.getNearbyRiders({
          deliveryId: delivery.backendId || delivery.id?.replace('#', ''),
          pickupLat: pickup?.[0],
          pickupLng: pickup?.[1],
          radiusKm: 50,
        });

        const sorted = res.riders || res.data?.riders || res.data;
        if (Array.isArray(sorted) && sorted.length > 0) {
          setNearbyRiders(sorted);
        }
      } catch (err) {
        console.warn('Nearby proximity dispatch notice:', err.message);
      } finally {
        setIsLoadingNearby(false);
      }
    };

    fetchNearby();
  }, [isOpen, delivery]);

  if (!delivery) return null;

  const handleAssign = async () => {
    if (!selectedRiderId) return;
    const targetId = delivery.backendId || delivery.id;
    const success = await assignRider(targetId, selectedRiderId);
    if (success) {
      const rider = riders.find(r => r.id === selectedRiderId);
      addNotification({
        title: `Rider ${rider?.name || 'Selected'} assigned to delivery ${delivery.id}`,
        type: 'rider',
        iconColor: 'text-brand-600 bg-brand-50'
      });
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Assign Delivery Rider (Proximity Dispatch)" maxWidth="max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Request Info */}
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <span className="text-xs font-bold text-slate-400">Request Info</span>
            <span className="text-sm font-extrabold text-brand-600">{delivery.id}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <span className="text-slate-400 font-medium block">Customer</span>
              <p className="font-bold text-slate-800 mt-0.5">{delivery.customerName}</p>
              <p className="text-slate-500">{delivery.customerPhone}</p>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-200">
              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5"></span>
                <div>
                  <span className="text-slate-400 font-medium">Pickup</span>
                  <p className="font-semibold text-slate-800">{delivery.pickupLocation}</p>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <span className="w-2 h-2 rounded-full bg-rose-500 mt-1.5"></span>
                <div>
                  <span className="text-slate-400 font-medium">Destination</span>
                  <p className="font-semibold text-slate-800">{delivery.destination}</p>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Delivery Fee</span>
              <span className="text-sm font-extrabold text-slate-900">{delivery.amount}</span>
            </div>
          </div>
        </div>

        {/* Right: Rider Selection List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-brand-600" />
              <span>Available Riders</span>
            </h4>
            <span className="text-[11px] text-slate-400">
              {riders.filter(r => r.status === 'Online').length} Online
            </span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {riders.map((rider) => {
              const isSelected = selectedRiderId === rider.id;
              const isOnline = rider.status === 'Online';
              const distanceKm = nearbyRiders.find(nr => nr.id === rider.id)?.distanceKm;

              return (
                <div
                  key={rider.id}
                  onClick={() => setSelectedRiderId(rider.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/60 ring-2 ring-brand-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={rider.avatar}
                        alt={rider.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${isOnline ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs font-bold text-slate-900">{rider.name}</p>
                      </div>
                      <p className="text-[11px] text-slate-500">{rider.vehicle} • {rider.phone}</p>
                      {distanceKm !== undefined && (
                        <span className="text-[10px] text-brand-600 font-bold block">
                          📍 {distanceKm} km from pickup
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={rider.status} />
                    <input
                      type="radio"
                      name="selected_rider"
                      checked={isSelected}
                      onChange={() => setSelectedRiderId(rider.id)}
                      className="w-4 h-4 text-brand-600 accent-brand-600 cursor-pointer"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-5 mt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          Cancel
        </button>
        <button
          type="button"
          disabled={!selectedRiderId}
          onClick={handleAssign}
          className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 disabled:opacity-50 rounded-xl shadow-sm shadow-brand-500/30 transition-all"
        >
          Confirm Assignment
        </button>
      </div>
    </Modal>
  );
};
