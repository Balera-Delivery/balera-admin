import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { AlertTriangle, Loader2, XCircle } from 'lucide-react';

const QUICK_REASONS = [
  'Customer asked to cancel',
  'Payment could not be verified',
  'Restaurant is closed / item unavailable',
  'No rider available',
];

/**
 * In-app box to cancel a delivery with a reason (instead of the browser pop-up).
 * `onConfirm(reason)` must return { success, message }.
 */
export const CancelDeliveryModal = ({ isOpen, onClose, onConfirm, deliveryId }) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setReason('');
      setError('');
      setBusy(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('Please choose or write a reason.');
      return;
    }
    setBusy(true);
    setError('');
    const res = await onConfirm(reason.trim());
    setBusy(false);
    if (res?.success) onClose();
    else setError(res?.message || 'Could not cancel this delivery.');
  };

  return (
    <Modal isOpen={isOpen} onClose={busy ? () => {} : onClose} title="Cancel delivery" maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-800">
            Delivery <span className="font-bold">{deliveryId}</span> will be cancelled. The customer and the rider
            will be notified. This cannot be undone.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold text-slate-700 mb-2">Reason</p>
          <div className="flex flex-wrap gap-2 mb-2.5">
            {QUICK_REASONS.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => { setReason(r); setError(''); }}
                className={`px-2.5 py-1.5 rounded-lg text-[11px] font-semibold border transition-colors ${
                  reason === r
                    ? 'bg-brand-50 border-brand-300 text-brand-700'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
          <textarea
            value={reason}
            onChange={(e) => { setReason(e.target.value); setError(''); }}
            rows={3}
            placeholder="Or write the reason here..."
            className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none resize-none"
          />
          {error && <p className="mt-1.5 text-[11px] font-semibold text-rose-600">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl disabled:opacity-50"
          >
            Keep delivery
          </button>
          <button
            type="submit"
            disabled={busy}
            className="py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-500/25 flex items-center justify-center gap-1.5 disabled:opacity-70"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
            <span>Cancel delivery</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
