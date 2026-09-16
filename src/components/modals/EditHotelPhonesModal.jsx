import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useHotels } from '../../context/HotelContext';
import { Phone, Save, CheckCircle } from 'lucide-react';

export const EditHotelPhonesModal = ({ isOpen, onClose, hotel }) => {
  const { updateHotelPhones } = useHotels();

  const [phone1, setPhone1] = useState('');
  const [phone2, setPhone2] = useState('');

  useEffect(() => {
    if (hotel) {
      setPhone1(hotel.phone1 || '');
      setPhone2(hotel.phone2 || '');
    }
  }, [hotel]);

  if (!hotel) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    updateHotelPhones(hotel.id, phone1.trim(), phone2.trim());
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Contact Numbers: ${hotel.name}`} maxWidth="max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-brand-50 border border-brand-100 rounded-xl">
          <p className="text-xs text-brand-800">
            Set or update up to <strong>2 official phone numbers</strong> for dispatchers, delivery riders, and customers to reach <strong>{hotel.name}</strong>.
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number 1 (Primary Contact)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="e.g. +251 91 123 4567 or 0911234567"
                value={phone1}
                onChange={(e) => setPhone1(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone Number 2 (Secondary / Manager Contact)
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="tel"
                placeholder="e.g. +251 92 876 5432 or 0928765432"
                value={phone2}
                onChange={(e) => setPhone2(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/25 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Phone Numbers</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
