import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { useHotels } from '../../context/HotelContext';

export const EditPromotionModal = ({ isOpen, onClose, promotion, onUpdatePromotion }) => {
  const { hotels } = useHotels();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    discountType: 'PERCENTAGE',
    discountValue: 15,
    maxDiscount: 100,
    minOrderAmount: 200,
    totalUsageLimit: 200,
    perUserLimit: 1,
    startDate: '',
    endDate: '',
    isActive: true,
    applicableType: 'ALL',
    restaurantId: ''
  });

  useEffect(() => {
    if (promotion) {
      setFormData({
        title: promotion.title || '',
        description: promotion.description || '',
        discountType: promotion.discountType || 'PERCENTAGE',
        discountValue: promotion.discountValue || 0,
        maxDiscount: promotion.maxDiscount || '',
        minOrderAmount: promotion.minOrderAmount || 0,
        totalUsageLimit: promotion.totalUsageLimit || '',
        perUserLimit: promotion.perUserLimit || 1,
        startDate: promotion.startDate ? new Date(promotion.startDate).toISOString().split('T')[0] : '',
        endDate: promotion.endDate ? new Date(promotion.endDate).toISOString().split('T')[0] : '',
        isActive: promotion.isActive !== undefined ? promotion.isActive : true,
        applicableType: promotion.applicableType || 'ALL',
        restaurantId: promotion.restaurantId || ''
      });
    }
  }, [promotion]);

  if (!promotion) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const updated = {
      ...promotion,
      ...formData,
      discountValue: Number(formData.discountValue),
      maxDiscount: formData.maxDiscount ? Number(formData.maxDiscount) : null,
      minOrderAmount: Number(formData.minOrderAmount) || 0,
      totalUsageLimit: formData.totalUsageLimit ? Number(formData.totalUsageLimit) : null,
      perUserLimit: Number(formData.perUserLimit) || 1
    };

    onUpdatePromotion(updated);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Edit Campaign: ${promotion.code}`} maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Campaign Title</label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
            required
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Discount Value</label>
            <input
              type="number"
              value={formData.discountValue}
              onChange={(e) => setFormData(prev => ({ ...prev, discountValue: e.target.value }))}
              className="w-full px-3 py-2 text-xs font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Max Cap (Birr)</label>
            <input
              type="number"
              value={formData.maxDiscount}
              onChange={(e) => setFormData(prev => ({ ...prev, maxDiscount: e.target.value }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Min Order Subtotal (Birr)</label>
            <input
              type="number"
              value={formData.minOrderAmount}
              onChange={(e) => setFormData(prev => ({ ...prev, minOrderAmount: e.target.value }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Total Max Uses</label>
            <input
              type="number"
              value={formData.totalUsageLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, totalUsageLimit: e.target.value }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Start Date</label>
            <input
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Expiration Date</label>
            <input
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none"
            />
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isActive}
              onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
              className="w-4 h-4 text-brand-600 rounded"
            />
            <span className="text-xs font-bold text-slate-700">Campaign Active</span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 rounded-xl"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-xs"
          >
            Save Changes
          </button>
        </div>
      </form>
    </Modal>
  );
};
