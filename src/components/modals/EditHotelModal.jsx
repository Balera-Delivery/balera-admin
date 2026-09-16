import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useHotels } from '../../context/HotelContext';
import { Building2, Phone, MapPin, Clock, Image as ImageIcon, Save, Upload, Check } from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Cafe & Restaurant',
  'Traditional Restaurant',
  'Meat & Grill House',
  'Hotel & Dining',
  'Fast Food & Burgers',
  'Pizza & Bakery',
  'Juice Bar & Healthy',
  'International Cuisine',
];

const PRESET_BANNERS = [
  { label: 'Restaurant & Dining', url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80' },
  { label: 'Traditional Ethiopian', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=800&auto=format&fit=crop&q=80' },
  { label: 'Grill & Tibs', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80' },
  { label: 'Pizza & Cafe', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800&auto=format&fit=crop&q=80' },
  { label: 'Burger & Diner', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80' },
  { label: 'Luxury Hotel', url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80' },
];

export const EditHotelModal = ({ isOpen, onClose, hotel }) => {
  const { updateHotel } = useHotels();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Cafe & Restaurant',
    cuisineType: '',
    phone1: '',
    phone2: '',
    address: '',
    openingHours: '07:00 AM - 10:00 PM',
    status: 'Active',
    banner: '',
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (hotel) {
      setFormData({
        name: hotel.name || '',
        category: hotel.category || 'Cafe & Restaurant',
        cuisineType: hotel.cuisineType || '',
        phone1: hotel.phone1 || '',
        phone2: hotel.phone2 || '',
        address: hotel.address || '',
        openingHours: hotel.openingHours || '07:00 AM - 10:00 PM',
        status: hotel.status || 'Active',
        banner: hotel.banner || PRESET_BANNERS[0].url,
      });
    }
  }, [hotel]);

  if (!hotel) return null;

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, banner: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: 'Hotel name cannot be empty' });
      return;
    }

    updateHotel(hotel.id, formData);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit: ${hotel.name}`} maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Establishment Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-medium"
              />
            </div>
            {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Category</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Cuisine Type & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Cuisine / Specialties</label>
            <input
              type="text"
              value={formData.cuisineType}
              onChange={(e) => setFormData({ ...formData, cuisineType: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="Active">Active (Accepting Orders)</option>
              <option value="Inactive">Inactive / Temporarily Closed</option>
            </select>
          </div>
        </div>

        {/* Phone 1 and Phone 2 Contact Numbers */}
        <div className="p-3.5 bg-brand-50/40 border border-brand-100 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-600" />
              Direct Phone Numbers (Up to 2 Phones)
            </span>
            <span className="text-[11px] font-medium text-brand-700">Contact / Dispatch</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number 1 (Primary)</label>
              <input
                type="tel"
                placeholder="e.g. +251 91 123 4567"
                value={formData.phone1}
                onChange={(e) => setFormData({ ...formData, phone1: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number 2 (Secondary)</label>
              <input
                type="tel"
                placeholder="e.g. +251 92 987 6543"
                value={formData.phone2}
                onChange={(e) => setFormData({ ...formData, phone2: e.target.value })}
                className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-mono"
              />
            </div>
          </div>
        </div>

        {/* Address & Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Address / Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Opening Hours</label>
            <div className="relative">
              <Clock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={formData.openingHours}
                onChange={(e) => setFormData({ ...formData, openingHours: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Cover Image: Upload File + Recommendations */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
              Cover Image
            </span>
            <span className="text-[11px] text-slate-400 font-normal">Upload file or pick a recommendation</span>
          </label>

          {/* Upload Button & Preview */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full sm:w-auto px-4 py-2.5 bg-slate-50 hover:bg-slate-100 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Upload className="w-4 h-4 text-brand-600" />
              <span>Upload New Cover Image from Device</span>
            </button>

            {formData.banner && (
              <div className="flex items-center gap-2">
                <div className="relative w-16 h-10 rounded-lg overflow-hidden border border-slate-200 shadow-2xs">
                  <img src={formData.banner} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
                <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Selected
                </span>
              </div>
            )}
          </div>

          {/* Recommendations Presets */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block mb-1.5">Or choose from recommendations:</span>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {PRESET_BANNERS.map((b, idx) => (
                <div
                  key={idx}
                  onClick={() => setFormData({ ...formData, banner: b.url })}
                  className={`relative h-14 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    formData.banner === b.url ? 'border-brand-600 ring-2 ring-brand-400/40 scale-102' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={b.url} alt={b.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white px-1 py-0.5 text-center truncate font-medium">
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/25 transition-all flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
