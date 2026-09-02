import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useDelivery } from '../../context/DeliveryContext';

export const ChangeStatusModal = ({ isOpen, onClose, delivery }) => {
  const { changeDeliveryStatus } = useDelivery();
  const [newStatus, setNewStatus] = useState(delivery?.status || 'Pending');

  if (!delivery) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    changeDeliveryStatus(delivery.backendId || delivery.id, newStatus);
    onClose();
  };

  const statuses = [
    'Pending',
    'Assigned',
    'Accepted',
    'Picked Up',
    'On the Way',
    'Delivered',
    'Completed',
    'Cancelled'
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Status: ${delivery.id}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Select New Status</label>
          <select
            value={newStatus}
            onChange={(e) => setNewStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          >
            {statuses.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <p className="text-xs text-slate-500">
          Updating status will notify both customer and assigned rider and update operational reports in real time.
        </p>

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
            Update Status
          </button>
        </div>
      </form>
    </Modal>
  );
};
