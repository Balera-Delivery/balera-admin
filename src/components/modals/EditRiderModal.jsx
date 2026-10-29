import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useDelivery } from '../../context/DeliveryContext';
import { User, Phone, Bike, ShieldCheck, Check, AlertCircle } from 'lucide-react';

export const EditRiderModal = ({ isOpen, onClose, rider }) => {
  const { editRider } = useDelivery();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    vehicle: 'TVS Motorcycle',
    licensePlate: '',
    accountStatus: 'Active',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (rider) {
      setFormData({
        name: rider.name || '',
        phone: rider.phone || '',
        vehicle: rider.vehicle || 'TVS Motorcycle',
        licensePlate: rider.licensePlate || '',
        accountStatus: rider.accountStatus || 'Active',
      });
      setErrorMessage('');
      setSuccess(false);
    }
  }, [rider, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMessage('Full name and phone number are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await editRider(rider.id, {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        vehicle: formData.vehicle,
        licensePlate: formData.licensePlate.trim(),
        accountStatus: formData.accountStatus,
      });
      setSuccess(true);
      setTimeout(() => {
        setIsSubmitting(false);
        onClose();
      }, 700);
    } catch (err) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to update rider profile.');
    }
  };

  if (!rider) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Rider: ${rider.name}`} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {success && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>Rider profile updated successfully!</span>
          </div>
        )}

        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              placeholder="e.g. Dawit Bekele"
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
          <div className="relative">
            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
              placeholder="+251911000001"
            />
          </div>
        </div>

        {/* Vehicle Type */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Vehicle Type</label>
          <div className="relative">
            <Bike className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              value={formData.vehicle}
              onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            >
              <option value="TVS Motorcycle">TVS Motorcycle</option>
              <option value="Bajaj Boxer">Bajaj Boxer</option>
              <option value="Honda Ace 125">Honda Ace 125</option>
              <option value="Electric Scooter">Electric Scooter</option>
              <option value="Bicycle">Bicycle</option>
            </select>
          </div>
        </div>

        {/* License Plate */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">License Plate</label>
          <input
            type="text"
            value={formData.licensePlate}
            onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono uppercase"
            placeholder="e.g. 3-AA-12345"
          />
        </div>

        {/* Account Status */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Account Status</label>
          <select
            value={formData.accountStatus}
            onChange={(e) => setFormData({ ...formData, accountStatus: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold"
          >
            <option value="Active">Active (Can receive orders & log in)</option>
            <option value="Suspended">Suspended (Temporarily restricted)</option>
            <option value="Deactivated">Deactivated (Disabled)</option>
          </select>
        </div>

        {/* Actions */}
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
            className="px-5 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-brand-500/25 transition-all disabled:opacity-50"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
