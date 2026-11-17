import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useDelivery } from '../../context/DeliveryContext';

export const AddCustomerModal = ({ isOpen, onClose }) => {
  const { addCustomer } = useDelivery();
  const empty = { name: '', phone: '', email: '', address: '', password: '' };
  const [formData, setFormData] = useState(empty);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const handleClose = () => {
    setFormData(empty);
    setError('');
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;
    if (formData.password.length < 6) {
      setError('The password must be at least 6 characters.');
      return;
    }
    setIsSaving(true);
    setError('');
    const res = await addCustomer(formData);
    setIsSaving(false);
    if (res?.success) handleClose();
    else setError(res?.message || 'Could not add the customer.');
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Add New Customer">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div role="alert" className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700">{error}</div>
        )}
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            placeholder="e.g. Abebe Bekele"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
          <input
            type="text"
            required
            placeholder="e.g. 0912345678"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
          <input
            type="email"
            placeholder="e.g. abebe@gmail.com"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address</label>
          <input
            type="text"
            placeholder="e.g. Near Bale Robe University"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">Password for the customer app *</label>
          <input
            type="text"
            required
            minLength={6}
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
          />
          <p className="mt-1 text-[11px] text-slate-400">Give this password to the customer so they can sign in.</p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/30 transition-all disabled:opacity-60"
          >
            {isSaving ? 'Adding…' : 'Add Customer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
