import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useDelivery } from '../../context/DeliveryContext';

export const AddPaymentModal = ({ isOpen, onClose }) => {
  const { riders, addPayment } = useDelivery();
  const [formData, setFormData] = useState({
    riderId: riders[0]?.id || '',
    totalDeliveries: 50,
    amount: '1,500.00',
    period: 'May 2024',
    paymentMethod: 'Telebirr',
    status: 'Paid'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const rider = riders.find(r => r.id === formData.riderId) || riders[0];
    addPayment({
      riderId: rider.id,
      riderName: rider.name,
      riderPhone: rider.phone,
      totalDeliveries: Number(formData.totalDeliveries),
      amount: formData.amount,
      period: formData.period,
      paymentMethod: formData.paymentMethod,
      status: formData.status
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Record Rider Payment">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select Rider *</label>
          <select
            value={formData.riderId}
            onChange={(e) => setFormData({ ...formData, riderId: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          >
            {riders.map(r => (
              <option key={r.id} value={r.id}>{r.name} ({r.phone})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Total Deliveries *</label>
            <input
              type="number"
              required
              value={formData.totalDeliveries}
              onChange={(e) => setFormData({ ...formData, totalDeliveries: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (ETB) *</label>
            <input
              type="text"
              required
              placeholder="e.g. 3,500.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            >
              <option value="Telebirr">Telebirr</option>
              <option value="CBE Birr">CBE Birr</option>
              <option value="Bank Transfer">Bank Transfer (CBE)</option>
              <option value="Cash Payout">Cash Payout</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            >
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/30 transition-all"
          >
            Save Payment Record
          </button>
        </div>
      </form>
    </Modal>
  );
};
