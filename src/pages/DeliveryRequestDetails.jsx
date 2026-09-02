import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  User, 
  Phone, 
  MapPin, 
  Package, 
  Clock, 
  DollarSign, 
  ShieldAlert, 
  KeyRound, 
  UserCheck, 
  CheckCircle2, 
  History,
  AlertCircle,
  FileText
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { DeliveryRouteMap } from '../components/maps/DeliveryRouteMap';
import { AssignRiderModal } from '../components/modals/AssignRiderModal';
import { ChangeStatusModal } from '../components/modals/ChangeStatusModal';
import { useDelivery } from '../context/DeliveryContext';

export const DeliveryRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { deliveries, cancelDelivery, fetchDeliveryById } = useDelivery();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [fetchedDelivery, setFetchedDelivery] = useState(null);
  const [loading, setLoading] = useState(false);

  // Match against local deliveries array
  const localDelivery = deliveries.find(d => 
    d.id === id || 
    d.id === `#${id}` || 
    d.id.replace('#', '') === id || 
    d.backendId === id ||
    d.trackingNumber === id ||
    d.trackingNumber === `#${id}`
  );

  const delivery = localDelivery || fetchedDelivery;

  // If not found in context, fetch directly from backend API
  useEffect(() => {
    if (!localDelivery && id) {
      setLoading(true);
      fetchDeliveryById(id).then(res => {
        if (res) setFetchedDelivery(res);
        setLoading(false);
      });
    }
  }, [id, localDelivery, fetchDeliveryById]);

  if (loading) {
    return (
      <div className="p-12 text-center space-y-3">
        <div className="w-8 h-8 border-4 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-500">Loading delivery details from server...</p>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
        <h3 className="text-base font-bold text-slate-800">Delivery Request Not Found</h3>
        <p className="text-xs text-slate-500">
          The requested delivery (<span className="font-mono">{id}</span>) could not be located in active records.
        </p>
        <button 
          onClick={() => navigate('/deliveries')} 
          className="px-4 py-2 text-xs font-bold text-white bg-brand-600 rounded-xl shadow-sm hover:bg-brand-700 transition-all"
        >
          Return to Deliveries
        </button>
      </div>
    );
  }

  const pickupCoord = delivery.routeCoordinates?.[0] || [9.0054, 38.7885];
  const destCoord = delivery.routeCoordinates?.[delivery.routeCoordinates.length - 1] || [9.0345, 38.7512];

  // OTP safe string extraction
  const otpDisplay = typeof delivery.otp === 'object' 
    ? (delivery.otp?.otpCode || '4921')
    : (delivery.otp || '4921');

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold">
        <Link to="/deliveries" className="hover:text-brand-600 transition-colors">Delivery Requests</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-700">{delivery.id}</span>
      </div>

      {/* Main Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Details & Actions */}
        <div className="lg:col-span-5 space-y-5">
          {/* Card Header & Status */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">{delivery.id}</h2>
                {delivery.backendId && (
                  <span className="text-[10px] text-slate-400 font-mono block">UUID: {delivery.backendId}</span>
                )}
              </div>
              <StatusBadge status={delivery.status} />
            </div>

            {/* Customer Details */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Customer</span>
              <p className="text-sm font-bold text-slate-900">{delivery.customerName}</p>
              <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                {delivery.customerPhone}
              </p>
            </div>

            {/* Pickup & Destination */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-xs mt-0.5">
                  P
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Pickup Location</span>
                  <p className="text-xs font-bold text-slate-900">{delivery.pickupLocation}</p>
                  {delivery.pickupAddressDetail && (
                    <p className="text-[11px] text-slate-500">{delivery.pickupAddressDetail}</p>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-xs mt-0.5">
                  D
                </div>
                <div>
                  <span className="text-[11px] font-bold text-slate-400 uppercase">Destination</span>
                  <p className="text-xs font-bold text-slate-900">{delivery.destination}</p>
                  {delivery.destinationAddressDetail && (
                    <p className="text-[11px] text-slate-500">{delivery.destinationAddressDetail}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Item & Price Details */}
            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Item Type</span>
                <p className="font-bold text-slate-800 mt-0.5">{delivery.itemType}</p>
                {delivery.itemDescription && (
                  <p className="text-[11px] text-slate-500 mt-0.5">{delivery.itemDescription}</p>
                )}
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Delivery Fee</span>
                <p className="font-extrabold text-brand-600 text-sm mt-0.5">{delivery.amount}</p>
              </div>
            </div>

            {/* Recipient Details */}
            {(delivery.receiverName || delivery.receiverPhone) && (
              <div className="pt-3 border-t border-slate-100 text-xs">
                <span className="text-slate-400 font-medium block">Recipient Details</span>
                <p className="font-bold text-slate-800 mt-0.5">{delivery.receiverName} ({delivery.receiverPhone})</p>
                {delivery.specialInstructions && (
                  <p className="text-[11px] text-slate-500 mt-1 italic bg-slate-50 p-2 rounded-lg">
                    Note: "{delivery.specialInstructions}"
                  </p>
                )}
              </div>
            )}

            {/* Request Time & OTP Status */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500">
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Request Time:
                </span>
                <span className="font-semibold text-slate-700">{delivery.date} - {delivery.time}</span>
              </div>

              {otpDisplay && (
                <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-200/70">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-600 text-[11px]">
                    <KeyRound className="w-3.5 h-3.5 text-brand-600" />
                    Delivery OTP (Security Code):
                  </span>
                  <span className="font-mono font-bold text-slate-900 tracking-widest text-sm bg-white px-2 py-0.5 rounded border border-slate-200">
                    {otpDisplay}
                  </span>
                </div>
              )}
            </div>

            {/* Assigned Rider Info (if assigned) */}
            {delivery.riderName && (
              <div className="pt-3 border-t border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Assigned Rider</span>
                <div className="flex items-center justify-between bg-blue-50/50 p-3 rounded-xl border border-blue-100">
                  <div>
                    <p className="text-xs font-bold text-slate-900">{delivery.riderName}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{delivery.riderPhone} • {delivery.riderVehicle}</p>
                  </div>
                  <button
                    onClick={() => setIsAssignModalOpen(true)}
                    className="text-xs font-bold text-brand-600 hover:text-brand-700"
                  >
                    Reassign
                  </button>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="w-full py-2.5 px-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/25 transition-all text-center"
              >
                {delivery.riderName ? 'Reassign Rider' : 'Assign Rider'}
              </button>

              <button
                onClick={() => setIsStatusModalOpen(true)}
                className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition-colors text-center"
              >
                Change Status
              </button>

              {delivery.status !== 'Cancelled' && delivery.status !== 'Completed' && (
                <button
                  onClick={() => {
                    const reason = prompt('Reason for cancelling this delivery:');
                    if (reason !== null) {
                      cancelDelivery(delivery.id, reason || 'Cancelled by admin');
                    }
                  }}
                  className="w-full sm:w-auto py-2.5 px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors text-center"
                  title="Cancel Delivery"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Route Map & Step-by-Step Status Audit Trail */}
        <div className="lg:col-span-7 space-y-5">
          {/* Interactive Route Map */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col h-[380px]">
            <div className="flex items-center justify-between pb-3 px-2">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Route & Live Location Map
              </h3>
              <span className="text-xs font-semibold text-slate-400">
                Est. Distance: {delivery.distance || '5.8 km'}
              </span>
            </div>

            <div className="flex-1 rounded-xl overflow-hidden">
              <DeliveryRouteMap
                pickup={pickupCoord}
                destination={destCoord}
                riderPosition={delivery.riderPosition}
                routeCoordinates={delivery.routeCoordinates}
                pickupLabel={delivery.pickupLocation}
                destinationLabel={delivery.destination}
              />
            </div>
          </div>

          {/* Status Audit Trail Timeline (from backend statusLogs) */}
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 mb-4">
              <History className="w-4 h-4 text-brand-600" />
              <span>Step-by-Step Delivery Audit Trail</span>
            </h3>

            <div className="space-y-4 relative before:absolute before:inset-0 before:left-3 before:w-0.5 before:bg-slate-200">
              {delivery.statusLogs && delivery.statusLogs.length > 0 ? (
                delivery.statusLogs.map((log, idx) => (
                  <div key={log.id || idx} className="relative flex items-start gap-4 pl-7">
                    <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-brand-600 border-2 border-white ring-2 ring-brand-100 flex-shrink-0"></div>
                    <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{log.status}</span>
                        <span className="text-[10px] text-slate-400">
                          {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="text-slate-600 mt-1 text-[11px]">{log.notes}</p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="relative flex items-start gap-4 pl-7">
                  <div className="absolute left-1.5 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-100 flex-shrink-0"></div>
                  <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-200/70 text-xs">
                    <span className="font-bold text-slate-900">{delivery.status}</span>
                    <p className="text-slate-500 text-[11px] mt-0.5">Current delivery operational state</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AssignRiderModal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        delivery={delivery}
      />

      <ChangeStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        delivery={delivery}
      />
    </div>
  );
};
