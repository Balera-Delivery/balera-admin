import React, { useState, useRef } from 'react';
import { Modal } from '../common/Modal';
import { useHotels } from '../../context/HotelContext';
import { Utensils, DollarSign, Tag, Image as ImageIcon, Sparkles, Upload, Link as LinkIcon, X, Check } from 'lucide-react';

const FOOD_CATEGORIES = [
  'Haniid & Roasts',
  'Tibs & Grills',
  'Traditional & Stews',
  'Breakfast (Ciree)',
  'Lunch & Dinner',
  'Rice Dishes',
  'Pizzas',
  'Burgers & Sandwiches',
  'Pasta & Noodles',
  'Shiro & Fasting Platters',
  'Meat Specialties',
  'Fish & Poultry',
  'Soups & Broths',
  'Juices & Healthy Drinks',
  'Hot Drinks & Coffee',
  'Desserts & Pastries',
];

const PRESET_FOOD_IMAGES = [
  { label: 'Meat & Tibs', url: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=400&auto=format&fit=crop&q=80' },
  { label: 'Roast Lamb', url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=400&auto=format&fit=crop&q=80' },
  { label: 'Shiro & Veg', url: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&auto=format&fit=crop&q=80' },
  { label: 'Fasting Feast', url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&auto=format&fit=crop&q=80' },
  { label: 'Burger', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&auto=format&fit=crop&q=80' },
  { label: 'Pizza', url: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&auto=format&fit=crop&q=80' },
  { label: 'Spiced Rice', url: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400&auto=format&fit=crop&q=80' },
  { label: 'Fresh Juice', url: 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=400&auto=format&fit=crop&q=80' },
];

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80';

export const AddFoodModal = ({ isOpen, onClose, hotelId, defaultCategory }) => {
  const { addFoodItem } = useHotels();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: '',
    category: defaultCategory || 'Tibs & Grills',
    price: '',
    description: '',
    tag: '',
    isAvailable: true,
    image: '', // optional
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Dish name is required';
    if (!formData.price || Number(formData.price) <= 0) errs.price = 'Valid price is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    addFoodItem(hotelId, {
      ...formData,
      price: Number(formData.price),
      image: formData.image.trim() || DEFAULT_FALLBACK_IMAGE,
    });

    onClose();
    setFormData({
      name: '',
      category: defaultCategory || 'Tibs & Grills',
      price: '',
      description: '',
      tag: '',
      isAvailable: true,
      image: '',
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Food / Dish Item" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name & Category */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Food / Dish Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <Utensils className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Special Xibs, Burger..."
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className={`w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 ${
                  errors.name ? 'border-rose-400' : 'border-slate-200'
                }`}
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
              {FOOD_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Price & Tag */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Price (Ethiopian Birr / ETB) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">ETB</span>
              <input
                type="number"
                min="1"
                step="1"
                required
                placeholder="e.g. 650"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className={`w-full pl-12 pr-3 py-2 text-xs bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 font-bold text-slate-900 ${
                  errors.price ? 'border-rose-400' : 'border-slate-200'
                }`}
              />
            </div>
            {errors.price && <p className="text-[11px] text-rose-500 mt-1">{errors.price}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Badge / Tag (Optional)</label>
            <div className="relative">
              <Tag className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="e.g. Popular, Chef Special, Veg, Spicy"
                value={formData.tag}
                onChange={(e) => setFormData({ ...formData, tag: e.target.value })}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Description / Ingredients (Optional)</label>
          <textarea
            rows="2"
            placeholder="e.g. Sizzling beef cubes sautéed with onions, rosemary, and green chili peppers."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          ></textarea>
        </div>

        {/* Availability Toggle */}
        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <span className="text-xs font-bold text-slate-900 block">Immediate Availability</span>
            <span className="text-[11px] text-slate-500">Enable if dish is currently available to order</span>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isAvailable}
              onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
          </label>
        </div>

        {/* Optional Image: File Upload / URL / Presets */}
        <div className="space-y-2.5 p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-brand-600" />
              Dish Photography <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            {formData.image && (
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                className="text-[11px] text-rose-500 hover:underline flex items-center gap-0.5 font-semibold"
              >
                <X className="w-3 h-3" /> Clear Image
              </button>
            )}
          </div>

          {/* Upload Button + URL Input */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
              className="px-3 py-2 bg-white hover:bg-slate-100 border border-dashed border-slate-300 rounded-lg text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5 text-brand-600" />
              <span>Upload Image File</span>
            </button>

            <div className="relative">
              <LinkIcon className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                placeholder="Or paste image URL..."
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full pl-8 pr-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-600 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Preview if image selected */}
          {formData.image && (
            <div className="flex items-center gap-2.5 pt-1">
              <div className="w-12 h-12 rounded-lg overflow-hidden border border-slate-200 shadow-2xs shrink-0">
                <img src={formData.image} alt="Dish Preview" className="w-full h-full object-cover" />
              </div>
              <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Image attached
              </span>
            </div>
          )}

          {/* Recommendations Presets */}
          <div>
            <span className="text-[10px] font-semibold text-slate-500 block mb-1">Or pick a recommendation:</span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5">
              {PRESET_FOOD_IMAGES.map((img, idx) => (
                <div
                  key={idx}
                  onClick={() => setFormData({ ...formData, image: img.url })}
                  className={`relative h-11 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                    formData.image === img.url ? 'border-brand-600 ring-1 ring-brand-400/50 scale-105' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] text-white px-0.5 py-0.2 text-center truncate font-medium">
                    {img.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Submit */}
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
            <Sparkles className="w-4 h-4" />
            <span>Add Item to Menu</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
