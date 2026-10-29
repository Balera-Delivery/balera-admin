import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useDelivery } from '../../context/DeliveryContext';
import { DollarSign, CheckCircle2, CreditCard, Hash, FileText } from 'lucide-react';

export const MarkRiderPaidModal = ({ isOpen, onClose, rider, balanceOwed = 0, completedDeliveries = 0 }) => {
  const { markRiderPaidFromApi } = useDelivery();
  const [formData, setFormData] = useState({
    amount: '',
    paymentMethod: 'Telebirr',
    reference: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (rider) {
      setFormData({
        amount: String(balanceOwed > 0 ? balanceOwed : 500),
        paymentMethod: 'Telebirr',
        reference: `SETTLE-${Date.now().toString().slice(-6)}`,
        notes: `Settlement for ${completedDeliveries} completed deliveries`,
      });
      setSuccess(false);
      setIsSubmitting(false);
    }
  }, [rider, balanceOwed, completedDeliveries, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || Number(formData.amount) <= 0) {
      alert('Please enter a valid payout amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await markRiderPaidFromApi(rider.id, {
        riderName: rider.name,
        amount: Number(formData.amount),
        totalDeliveries: completedDeliveries,
        paymentMethod: formData.paymentMethod,
        reference: formData.reference,
        notes: formData.notes,
      });

      setSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err) {
      setIsSubmitting(false);
      alert(err.message || 'Failed to record payout.');
    }
  };

  if (!rider) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Settle Payment: ${rider.name}`} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rider Summary Header */}
        <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-slate-900 block">{rider.name}</span>
            <span className="text-slate-500 font-mono">{rider.phone}</span>
          </div>
          <div className="text-right">
            <span className="text-slate-400 block text-[11px]">Outstanding Owed:</span>
            <span className="text-sm font-extrabold text-amber-600">ETB {balanceOwed.toLocaleString()}</span>
          </div>
        </div>

        {/* Amount to Pay */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Payout Amount (ETB) *</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-extrabold text-slate-400">ETB</span>
            <input
              type="number"
              required
              min="1"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full pl-12 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-bold text-slate-900"
            />
          </div>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Disbursement Channel *</label>
          <select
            value={formData.paymentMethod}
            onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-800"
          >
            <option value="Telebirr">Telebirr (Ethio Telecom)</option>
            <option value="Commercial Bank of Ethiopia (CBE)">Commercial Bank of Ethiopia (CBE)</option>
            <option value="CBE Birr">CBE Birr</option>
            <option value="Bank of Abyssinia">Bank of Abyssinia</option>
            <option value="Awash Bank">Awash Bank</option>
            <option value="Cash">Cash Handover</option>
          </select>
        </div>

        {/* Settlement Reference / Transaction ID */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Reference / Transaction ID *</label>
          <div className="relative">
            <Hash className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={formData.reference}
              onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
              placeholder="e.g. TB12345678"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Notes / Description (Optional)</label>
          <input
            type="text"
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            placeholder="e.g. Weekly settlement cleared"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-emerald-500/25 transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{isSubmitting ? 'Recording...' : success ? 'Recorded!' : 'Confirm & Mark Paid'}</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
