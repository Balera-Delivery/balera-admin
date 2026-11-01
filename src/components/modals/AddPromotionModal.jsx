import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { 
  Tag, 
  Percent, 
  Truck, 
  UtensilsCrossed, 
  Zap, 
  Sparkles, 
  Calendar, 
  DollarSign, 
  Hash, 
  Users,
  CheckCircle2
} from 'lucide-react';
import { useHotels } from '../../context/HotelContext';

const PROMOTION_TYPES = [
  {
    type: 'PROMO_CODE',
    title: 'Promo Code Voucher',
    desc: 'Customer enters a coupon code at checkout',
    icon: Tag,
    badgeColor: 'bg-blue-50 text-brand-700 border-blue-200'
  },
  {
    type: 'FREE_DELIVERY',
    title: 'Free Delivery',
    desc: 'Waives standard courier trip fee for customer',
    icon: Truck,
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  {
    type: 'PARTNER_DISCOUNT',
    title: 'Partner Restaurant Deal',
    desc: 'Discount exclusively for a specific establishment',
    icon: UtensilsCrossed,
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200'
  },
  {
    type: 'PLATFORM_AUTOMATIC',
    title: 'Automatic Campaign',
    desc: 'Applies automatically to all qualifying orders',
    icon: Zap,
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  }
];

export const AddPromotionModal = ({ isOpen, onClose, onAddPromotion }) => {
  const { hotels } = useHotels();

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    description: '',
    promotionType: 'PROMO_CODE',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscount: 100,
    minOrderAmount: 200,
    totalUsageLimit: 200,
    perUserLimit: 1,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    applicableType: 'ALL',
    restaurantId: '',
    isActive: true
  });

  const [errors, setErrors] = useState({});

  const generateCode = () => {
    const prefixes = ['BALERA', 'ROBE', 'FAST', 'SUPER', 'WEEKEND', 'VIP'];
    const randomPrefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const randomNum = Math.floor(10 + Math.random() * 90);
    setFormData(prev => ({ ...prev, code: `${randomPrefix}${randomNum}` }));
  };

  const handleTypeSelect = (type) => {
    setFormData(prev => {
      const updates = { promotionType: type };
      if (type === 'FREE_DELIVERY') {
        updates.discountType = 'FIXED_AMOUNT';
        updates.discountValue = 100;
        updates.title = prev.title || 'Free Courier Delivery';
      } else if (type === 'PARTNER_DISCOUNT') {
        updates.applicableType = 'PARTNER_ONLY';
        updates.restaurantId = hotels[0]?.id || '';
      }
      return { ...prev, ...updates };
    });
  };

  const validate = () => {
    const errs = {};
    if (!formData.code.trim()) errs.code = 'Promo code is required';
    if (!formData.title.trim()) errs.title = 'Campaign title is required';
    if (!formData.discountValue || Number(formData.discountValue) <= 0) {
      errs.discountValue = 'Must be greater than 0';
    }
    if (formData.promotionType === 'PARTNER_DISCOUNT' && !formData.restaurantId) {
      errs.restaurantId = 'Please select a partner establishment';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const selectedHotel = hotels.find(h => h.id === formData.restaurantId);

    const newPromotion = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      discountValue: Number(formData.discountValue),
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      totalUsageLimit: formData.totalUsageLimit ? Number(formData.totalUsageLimit) : null,
      perUserLimit: Number(formData.perUserLimit) || 1,
      restaurant: selectedHotel ? { id: selectedHotel.id, name: selectedHotel.name, code: selectedHotel.code } : null
    };

    onAddPromotion(newPromotion);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Promotion Campaign" maxWidth="max-w-2xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[85vh] overflow-y-auto">
        {/* Step 1: Promotion Type Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5">
            1. Select Promotion Campaign Type
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {PROMOTION_TYPES.map((pt) => {
              const Icon = pt.icon;
              const isSelected = formData.promotionType === pt.type;
              return (
                <div
                  key={pt.type}
                  onClick={() => handleTypeSelect(pt.type)}
                  className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer flex items-start gap-3 relative ${
                    isSelected
                      ? 'border-brand-600 bg-brand-50/40 shadow-xs'
                      : 'border-slate-200/90 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`p-2 rounded-lg shrink-0 ${
                    isSelected ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0 pr-4">
                    <p className={`text-xs font-bold ${isSelected ? 'text-brand-900' : 'text-slate-900'}`}>
                      {pt.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                      {pt.desc}
                    </p>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="w-4 h-4 text-brand-600 absolute top-3.5 right-3.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Step 2: Code & Title */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Campaign Identity
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">Promo Code</span>
                <button
                  type="button"
                  onClick={generateCode}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. BALERA26"
                value={formData.code}
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl uppercase font-mono font-bold tracking-wider focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
              {errors.code && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.code}</p>}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title</label>
              <input
                type="text"
                placeholder="e.g. Weekend Food Flash Sale"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
              {errors.title && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.title}</p>}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Description / Banner Subtitle (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Get 20% off all delicious local dishes ordered today"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
            />
          </div>
        </div>

        {/* Step 3: Discount Configuration */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            3. Discount Values & Conditions
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Discount Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Mode</label>
              <select
                value={formData.discountType}
                disabled={formData.promotionType === 'FREE_DELIVERY'}
                onChange={(e) => setFormData(prev => ({ ...prev, discountType: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
              >
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FIXED_AMOUNT">Fixed Birr Amount</option>
              </select>
            </div>

            {/* Value */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Value {formData.discountType === 'PERCENTAGE' ? '(%)' : '(Birr)'}
              </label>
              <input
                type="number"
                min="1"
                max={formData.discountType === 'PERCENTAGE' ? '100' : '5000'}
                value={formData.discountValue}
                onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
              {errors.discountValue && <p className="text-xs text-rose-500 mt-1">{errors.discountValue}</p>}
            </div>

            {/* Max Discount Cap */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Max Cap (Birr)</label>
              <input
                type="number"
                placeholder="Optional max"
                value={formData.maxDiscount || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Min Order Subtotal */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Min Order Subtotal (Birr)</label>
              <input
                type="number"
                min="0"
                value={formData.minOrderAmount}
                onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>

            {/* Total Usage Limit */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Total Max Redemptions</label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 500 (blank = unlimited)"
                value={formData.totalUsageLimit || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, totalUsageLimit: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>

            {/* Per User Limit */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Max Uses Per Customer</label>
              <input
                type="number"
                min="1"
                max="20"
                value={formData.perUserLimit}
                onChange={(e) => setFormData(prev => ({ ...prev, perUserLimit: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Step 4: Targeting & Dates */}
        <div className="space-y-4 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            4. Scope & Schedule
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Applicable Scope */}
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Applicable Delivery Scope</label>
              <select
                value={formData.applicableType}
                onChange={(e) => setFormData(prev => ({ ...prev, applicableType: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
              >
                <option value="ALL">All Deliveries (Food & Package)</option>
                <option value="FOOD_ONLY">Restaurant Food Deliveries Only</option>
                <option value="PACKAGE_ONLY">Package Express Couriers Only</option>
                <option value="PARTNER_ONLY">Designated Restaurant Partner Only</option>
              </select>
            </div>

            {/* Restaurant Selector if Partner */}
            {(formData.applicableType === 'PARTNER_ONLY' || formData.promotionType === 'PARTNER_DISCOUNT') && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Select Partner Restaurant</label>
                <select
                  value={formData.restaurantId}
                  onChange={(e) => setFormData(prev => ({ ...prev, restaurantId: e.target.value }))}
                  className="w-full px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
                >
                  <option value="">Choose Restaurant...</option>
                  {hotels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name} ({h.code || h.id})</option>
                  ))}
                </select>
                {errors.restaurantId && <p className="text-xs text-rose-500 mt-1">{errors.restaurantId}</p>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Campaign Start Date</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Expiration Date</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/25 transition-all cursor-pointer"
          >
            Create Promotion
          </button>
        </div>
      </form>
    </Modal>
  );
};
