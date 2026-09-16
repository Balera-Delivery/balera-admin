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
  AlertCircle,
  FileText,
  Building2,
  Utensils,
  UtensilsCrossed,
  PhoneCall,
  ExternalLink,
  ShoppingBag,
  Receipt,
  History,
  CreditCard,
  Download,
  ZoomIn,
  X,
  CheckCircle,
  Plus,
  Eye,
  FileImage
} from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { DeliveryRouteMap } from '../components/maps/DeliveryRouteMap';
import { AssignRiderModal } from '../components/modals/AssignRiderModal';
import { ChangeStatusModal } from '../components/modals/ChangeStatusModal';
import { useDelivery, normalizePaymentOption } from '../context/DeliveryContext';

export const DeliveryRequestDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { deliveries, cancelDelivery, fetchDeliveryById, updatePaymentStatus } = useDelivery();
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState(false);
  const [fetchedDelivery, setFetchedDelivery] = useState(null);
  const [loading, setLoading] = useState(false);

  const cleanParamId = id ? String(id).replace('#', '').trim() : '';

  // Match against local deliveries array
  const localDelivery = deliveries.find(d => {
    if (!d) return false;
    const cleanDId = String(d.id || '').replace('#', '').trim();
    const cleanBackendId = String(d.backendId || '').trim();
    const cleanTracking = String(d.trackingNumber || d.trackingCode || '').replace('#', '').trim();

    return (
      cleanDId === cleanParamId ||
      cleanBackendId === cleanParamId ||
      cleanTracking === cleanParamId ||
      String(d.id).toLowerCase() === String(id).toLowerCase() ||
      String(d.trackingNumber || '').toLowerCase() === String(id).toLowerCase()
    );
  });

  const delivery = localDelivery || fetchedDelivery;

  // If not found in context, fetch directly from backend API
  useEffect(() => {
    if (!localDelivery && cleanParamId) {
      setLoading(true);
      fetchDeliveryById(cleanParamId).then(res => {
        if (res) setFetchedDelivery(res);
        setLoading(false);
      });
    }
  }, [cleanParamId, localDelivery, fetchDeliveryById]);

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

  const handleVerifyPayment = async () => {
    setIsVerifyingPayment(true);
    const targetId = delivery.backendId || delivery.id;
    await updatePaymentStatus(targetId, 'VERIFIED_PAID');
    setIsVerifyingPayment(false);
  };

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

            {/* Item & Price Details / Food Order Information */}
            <div className="pt-3 border-t border-slate-100 text-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-slate-400 font-medium block">Item Type</span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {delivery.isFoodOrder ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <UtensilsCrossed className="w-3.5 h-3.5 text-amber-600" />
                        <span>Food Order (Partner Establishment)</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        <span>{delivery.itemType || 'Package Delivery'}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-slate-400 font-medium block">Total Charge / Fee</span>
                  <p className="font-extrabold text-brand-600 text-base mt-0.5">{delivery.amount}</p>
                </div>
              </div>

              {/* 1. CUSTOMER ORDERED ITEMS FIRST */}
              {delivery.orderItems && delivery.orderItems.length > 0 ? (
                <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-2.5">
                  <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Utensils className="w-3.5 h-3.5 text-brand-600" />
                      <span>Customer Ordered Dishes ({delivery.orderItems.length})</span>
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Kitchen Order Ticket</span>
                  </div>

                  <div className="space-y-2">
                    {delivery.orderItems.map((item, idx) => (
                      <div key={item.id || idx} className="bg-white p-3 rounded-xl border border-slate-200/70 shadow-2xs space-y-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center shadow-2xs shrink-0">
                              {item.quantity}x
                            </span>
                            <div>
                              <span className="font-bold text-xs text-slate-900 block">{item.name}</span>
                              {item.category && (
                                <span className="text-[10px] text-slate-400">{item.category}</span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-xs text-slate-900">ETB {Number(item.subtotal || (item.price * item.quantity)).toFixed(2)}</span>
                            <span className="text-[10px] text-slate-400 block">ETB {Number(item.price || 0).toFixed(2)} each</span>
                          </div>
                        </div>
                        {item.notes && (
                          <p className="text-[11px] text-amber-800 bg-amber-50/90 px-2.5 py-1 rounded-lg italic border border-amber-200/70 mt-1">
                            Note: "{item.notes}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pricing summary */}
                  <div className="pt-2 border-t border-slate-200/70 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-500">
                      <span>Food Items Subtotal:</span>
                      <span className="font-semibold text-slate-700">ETB {Number(delivery.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>Delivery Fee:</span>
                      <span className="font-semibold text-slate-700">ETB {Number(delivery.fee || 60).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1.5 border-t border-slate-200">
                      <span>Total Order Cost:</span>
                      <span className="text-brand-600">
                        {typeof delivery.totalAmount === 'number' 
                          ? `ETB ${delivery.totalAmount.toFixed(2)}` 
                          : (delivery.amount || `ETB ${(Number(delivery.subtotal || 0) + Number(delivery.fee || 60)).toFixed(2)}`)}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                /* NON-FOOD OR GENERAL DESCRIPTION */
                delivery.itemDescription && (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/70 space-y-1">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Item Description</span>
                    <p className="text-xs text-slate-800 font-medium">{delivery.itemDescription}</p>
                  </div>
                )
              )}

              {/* 2. PARTNER FOOD ESTABLISHMENT / HOTEL INFORMATION CARD */}
              {delivery.isFoodOrder && (
                <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/50 to-amber-50/40 rounded-2xl p-4 border border-amber-200/90 shadow-2xs space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      {delivery.restaurant?.avatar ? (
                        <img
                          src={delivery.restaurant.avatar}
                          alt={delivery.restaurant?.name}
                          className="w-11 h-11 rounded-xl object-cover border border-amber-200 shadow-2xs shrink-0"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm font-bold text-sm">
                          <Building2 className="w-5 h-5" />
                        </div>
                      )}
                      <div>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <h4 className="text-xs font-bold text-slate-900">
                            {delivery.restaurant?.name || 'Partner Food Establishment'}
                          </h4>
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white text-slate-700 border border-amber-200">
                            {delivery.restaurant?.category || 'Cafe & Restaurant'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{delivery.restaurant?.address || delivery.pickupLocation}</span>
                        </p>
                      </div>
                    </div>

                    <Link
                      to={delivery.restaurant ? `/hotels/${delivery.restaurant.code || delivery.restaurant.id}` : '/hotels'}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-white hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-[11px] font-bold shadow-2xs transition-all shrink-0"
                      title="View hotel profile and complete menu"
                    >
                      <span>Hotel Profile</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Quick Call Hotel Kitchen Actions & DB Phone Resolution */}
                  <div className="pt-2.5 border-t border-amber-200/70 space-y-2">
                    <p className="text-[10px] font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1">
                      <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                      <span>Direct Hotel / Restaurant Kitchen Contact:</span>
                    </p>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Phone 1 */}
                      {delivery.restaurant?.phone1 ? (
                        <a
                          href={`tel:${delivery.restaurant.phone1}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
                          title="Click to call primary kitchen phone"
                        >
                          <PhoneCall className="w-3.5 h-3.5" />
                          <span>Call Kitchen: {delivery.restaurant.phone1}</span>
                        </a>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100/80 border border-amber-300/80 text-amber-900 text-xs font-medium">
                          <span className="text-[11px] italic font-semibold">Phone 1: Empty (Not added)</span>
                          <Link
                            to={delivery.restaurant ? `/hotels/${delivery.restaurant.code || delivery.restaurant.id}` : '/hotels'}
                            className="text-brand-600 hover:text-brand-700 font-bold text-[11px] inline-flex items-center gap-0.5 hover:underline"
                          >
                            <Plus className="w-3 h-3" />
                            <span>Add on Hotel Page</span>
                          </Link>
                        </div>
                      )}

                      {/* Phone 2 */}
                      {delivery.restaurant?.phone2 ? (
                        <a
                          href={`tel:${delivery.restaurant.phone2}`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold shadow-sm transition-all"
                          title="Click to call secondary restaurant phone"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Alt Line: {delivery.restaurant.phone2}</span>
                        </a>
                      ) : (
                        <div className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-100/80 border border-slate-200 text-slate-600 text-xs">
                          <span className="text-[11px] italic">Phone 2: Empty</span>
                          <Link
                            to={delivery.restaurant ? `/hotels/${delivery.restaurant.code || delivery.restaurant.id}` : '/hotels'}
                            className="text-slate-700 hover:text-slate-900 font-bold text-[11px] hover:underline"
                          >
                            + Add
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 3. CUSTOMER PAYMENT & UPLOADED RECEIPT SECTION */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/70 pb-2">
                  <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-brand-600" />
                    <span>Customer Payment & Verification</span>
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    delivery.paymentStatus === 'VERIFIED_PAID' || delivery.paymentStatus === 'Paid'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                      : delivery.paymentStatus === 'PAID_PENDING_VERIFICATION' || delivery.paymentStatus?.includes('Pending')
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-blue-100 text-blue-800 border border-blue-200'
                  }`}>
                    {delivery.paymentStatus || 'Pending'}
                  </span>
                </div>

                {(() => {
                  const paymentName = normalizePaymentOption(delivery.paymentMethod);
                  const isCbe = paymentName.includes('CBE') || paymentName.includes('Commercial');
                  const isAwash = paymentName.includes('Awash');
                  const badgeColor = isCbe 
                    ? 'bg-purple-50 text-purple-800 border-purple-200' 
                    : isAwash 
                    ? 'bg-teal-50 text-teal-800 border-teal-200' 
                    : 'bg-blue-50 text-blue-800 border-blue-200';

                  return (
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span className="font-medium">Customer Payment Option:</span>
                      <span className={`font-bold px-2.5 py-1 rounded-lg border shadow-2xs ${badgeColor}`}>
                        {paymentName}
                      </span>
                    </div>
                  );
                })()}

                {/* Receipt Image / Proof Preview */}
                {delivery.receiptUrl ? (
                  <div className="space-y-2 pt-2 border-t border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Uploaded Payment Receipt:
                    </span>
                    <div className="flex items-center gap-3">
                      <div 
                        onClick={() => setIsReceiptModalOpen(true)}
                        className="relative w-20 h-20 rounded-xl overflow-hidden border border-slate-300 bg-slate-100 cursor-pointer group shadow-2xs shrink-0"
                      >
                        <img 
                          src={delivery.receiptUrl} 
                          alt="Customer Payment Receipt" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <ZoomIn className="w-5 h-5" />
                        </div>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        <button
                          onClick={() => setIsReceiptModalOpen(true)}
                          className="w-full py-1.5 px-3 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-600" />
                          <span>View Full Receipt</span>
                        </button>

                        {delivery.paymentStatus !== 'VERIFIED_PAID' && (
                          <button
                            onClick={handleVerifyPayment}
                            disabled={isVerifyingPayment}
                            className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-2xs flex items-center justify-center gap-1.5"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>{isVerifyingPayment ? 'Verifying...' : 'Verify Receipt (Enable Assign)'}</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 pt-2 border-t border-slate-200/70">
                    <div className="p-2.5 bg-white rounded-xl border border-slate-200 text-[11px] text-slate-500 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Receipt verification pending.</span>
                      </div>
                      {delivery.paymentStatus !== 'VERIFIED_PAID' && (
                        <button
                          onClick={handleVerifyPayment}
                          disabled={isVerifyingPayment}
                          className="py-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-all shadow-2xs inline-flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          <span>Verify Receipt</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
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

            {/* Action Buttons & Verification Lock Notice */}
            {(() => {
              const isReceiptVerified = delivery.paymentStatus === 'VERIFIED_PAID' || delivery.paymentStatus === 'Paid' || delivery.paymentStatus === 'Completed';
              const isAssigned = !!(delivery.riderName || delivery.riderId || (delivery.status !== 'Pending' && delivery.status !== 'Cancelled'));

              return (
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  {!isAssigned && !isReceiptVerified && (
                    <div className="p-2.5 bg-amber-50 border border-amber-200/80 rounded-xl text-amber-800 text-[11px] font-medium flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                      <span>Verify the customer payment receipt above to enable rider assignment.</span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => {
                        if (isAssigned || isReceiptVerified) {
                          setIsAssignModalOpen(true);
                        }
                      }}
                      disabled={!isAssigned && !isReceiptVerified}
                      className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2 ${
                        !isAssigned && !isReceiptVerified
                          ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          : 'bg-brand-600 hover:bg-brand-700 text-white shadow-sm shadow-brand-500/25 cursor-pointer'
                      }`}
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>{isAssigned ? 'Reassign Rider' : 'Assign Rider'}</span>
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
              );
            })()}
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

      {/* Receipt Viewer Modal */}
      {isReceiptModalOpen && delivery.receiptUrl && (
        <div 
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setIsReceiptModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-brand-600" />
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Customer Payment Receipt</h3>
                  <p className="text-[11px] text-slate-500">Order: {delivery.id} • {delivery.customerName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsReceiptModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-200 text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Receipt Image View */}
            <div className="p-4 bg-slate-900 flex items-center justify-center max-h-[65vh] overflow-auto">
              <img 
                src={delivery.receiptUrl} 
                alt="Payment Receipt" 
                className="max-h-[60vh] w-auto object-contain rounded-lg shadow-lg border border-slate-700"
              />
            </div>

            {/* Footer Actions */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500">Selected Option:</span>
                <span className="text-xs font-bold text-slate-800">{normalizePaymentOption(delivery.paymentMethod)}</span>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                  delivery.paymentStatus === 'VERIFIED_PAID' || delivery.paymentStatus === 'Paid'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-amber-100 text-amber-800'
                }`}>
                  {delivery.paymentStatus || 'Pending'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={delivery.receiptUrl}
                  download={`receipt_${delivery.trackingNumber || delivery.id || 'order'}.jpg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Download</span>
                </a>

                <a
                  href={delivery.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Tab</span>
                </a>

                {delivery.paymentStatus !== 'VERIFIED_PAID' && (
                  <button
                    onClick={async () => {
                      await handleVerifyPayment();
                      setIsReceiptModalOpen(false);
                    }}
                    className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
                  >
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>Verify & Mark Paid</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
