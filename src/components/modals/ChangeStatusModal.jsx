import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useDelivery } from '../../context/DeliveryContext';
import { KeyRound, Copy, Check } from 'lucide-react';

export const ChangeStatusModal = ({ isOpen, onClose, delivery }) => {
  const { changeDeliveryStatus } = useDelivery();
  const [newStatus, setNewStatus] = useState('Pending');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (delivery) {
      setNewStatus('');
      setNotes('');
      setCopiedOtp(false);
      setSubmitError('');
    }
  }, [delivery, isOpen]);

  if (!delivery) return null;

  // Extract OTP safely
  const otpCode = typeof delivery.otp === 'object'
    ? (delivery.otp?.otpCode || null)
    : (delivery.otp || null);

  const handleCopyOtp = () => {
    navigator.clipboard?.writeText(String(otpCode));
    setCopiedOtp(true);
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Only forward steps (assigning and cancelling have their own buttons)
  const flow = ['Assigned', 'Accepted', 'Arrived at Pickup', 'Picked Up', 'On the Way', 'Delivered', 'Completed'];
  const currentIndex = flow.indexOf(delivery.status);
  const statuses = currentIndex === -1 ? [] : flow.slice(currentIndex + 1);
  const canChange = !!delivery.riderId && statuses.length > 0;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!statuses.includes(newStatus)) {
      setSubmitError('Choose the new status.');
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    const res = await changeDeliveryStatus(delivery.backendId || delivery.id, newStatus, notes);
    setIsSubmitting(false);
    if (res?.success) onClose();
    else setSubmitError(res?.message || 'Could not change the status.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Support Override / Status: ${delivery.id}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Support OTP Display Box */}
        <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-amber-900">Customer Delivery OTP</p>
              <p className="text-[10px] text-amber-700">Provide to rider or customer if they cannot view it</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-extrabold text-sm bg-white px-2.5 py-1 rounded-lg border border-amber-200 text-amber-950 tracking-widest shadow-sm">
              {otpCode || 'Not available'}
            </span>
            <button
              type="button"
              disabled={!otpCode}
              onClick={handleCopyOtp}
              title="Copy OTP to clipboard"
              className="p-1.5 text-xs text-amber-700 hover:text-amber-900 hover:bg-amber-100/80 rounded-lg transition-colors"
            >
              {copiedOtp ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Delivery Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-medium text-slate-800"
          >
            <option value="" disabled>Choose the new status…</option>
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
          {!canChange && (
            <p className="mt-1.5 text-[11px] font-semibold text-amber-700">
              {!delivery.riderId
                ? 'Assign a rider first. Use "Assign Rider" for that.'
                : 'This delivery is finished, so its status can no longer change.'}
            </p>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Support Resolution Notes (Optional)</label>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Customer phoned in, confirmed arrival & payment verified"
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          />
        </div>

        <p className="text-[11.5px] text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          💡 <strong>Notice:</strong> Use this only when the rider app can't update the order. The customer and rider are notified, and the change is saved in the order history. <strong>Completed</strong> finishes the delivery without the OTP.
        </p>

        {submitError && (
          <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">
            {submitError}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || !canChange || !newStatus}
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/30 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Updating...' : 'Update status'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
