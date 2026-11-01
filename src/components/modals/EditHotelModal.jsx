import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useHotels } from '../../context/HotelContext';
import { BALERA_DEFAULT_BANNER } from '../../data/hotelData';
import { Building2, Phone, MapPin, Clock, Image as ImageIcon, Save, Upload, Check, RotateCcw } from 'lucide-react';

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
    banner: BALERA_DEFAULT_BANNER,
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (hotel) {
      const isLegacyUnsplash = typeof hotel.banner === 'string' && hotel.banner.includes('unsplash.com');
      const activeBanner = !hotel.banner || isLegacyUnsplash ? BALERA_DEFAULT_BANNER : hotel.banner;

      setFormData({
        name: hotel.name || '',
        category: hotel.category || 'Cafe & Restaurant',
        cuisineType: hotel.cuisineType || '',
        phone1: hotel.phone1 || '',
        phone2: hotel.phone2 || '',
        address: hotel.address || '',
        openingHours: hotel.openingHours || '07:00 AM - 10:00 PM',
        status: hotel.status || 'Active',
        banner: activeBanner,
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

        {/* Cover Image: Upload File from Device or Use Balera Logo */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-700 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
              Partner Cover Page
            </span>
            <span className="text-[11px] text-slate-400 font-normal">
              Upload an image from your device to replace the cover page.
            </span>
          </label>

          {/* Banner Card Preview & Upload Controls */}
          <div className="p-3 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <div className="relative w-28 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-2xs shrink-0">
                <img
                  src={formData.banner || BALERA_DEFAULT_BANNER}
                  alt="Cover Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 mb-1">
                  {formData.banner === BALERA_DEFAULT_BANNER ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-brand-100 text-brand-700">
                      Balera Logo Cover
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Custom Image Selected
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500">
                  {formData.banner === BALERA_DEFAULT_BANNER
                    ? 'Default Balera establishment cover'
                    : 'Custom cover image loaded from device'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
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
                className="px-3.5 py-2 bg-white hover:bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
              >
                <Upload className="w-3.5 h-3.5 text-brand-600" />
                <span>{formData.banner === BALERA_DEFAULT_BANNER ? 'Upload from Device' : 'Change Image'}</span>
              </button>

              {formData.banner !== BALERA_DEFAULT_BANNER && (
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, banner: BALERA_DEFAULT_BANNER }))}
                  className="px-2.5 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
                  title="Reset to default Balera logo"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              )}
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
