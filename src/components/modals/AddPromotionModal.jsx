import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { 
  Tag, 
  Truck, 
  UtensilsCrossed, 
  Sparkles, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Info,
  Calendar
} from 'lucide-react';
import { useHotels } from '../../context/HotelContext';

export const AddPromotionModal = ({ isOpen, onClose, onAddPromotion }) => {
  const { hotels } = useHotels();

  const [promotionType, setPromotionType] = useState('PROMO_CODE'); // PROMO_CODE, FREE_DELIVERY, PARTNER_DISCOUNT
  const [code, setCode] = useState('');
  const [title, setTitle] = useState('');
  const [discountType, setDiscountType] = useState('PERCENTAGE'); // PERCENTAGE, FIXED_AMOUNT
  const [discountValue, setDiscountValue] = useState('20');
  const [restaurantId, setRestaurantId] = useState('');
  const [fundedBy, setFundedBy] = useState('PLATFORM'); // PLATFORM, RESTAURANT, SPLIT_50_50
  const [endDate, setEndDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });

  // Optional Advanced Settings (Accordion)
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [minOrderAmount, setMinOrderAmount] = useState('0');
  const [maxDiscount, setMaxDiscount] = useState('');
  const [totalUsageLimit, setTotalUsageLimit] = useState('');

  const [errors, setErrors] = useState({});

  const generateCode = () => {
    const words = ['BALERA', 'ROBE', 'FAST', 'SUPER', 'WEEKEND', 'VIP'];
    const word = words[Math.floor(Math.random() * words.length)];
    const num = Math.floor(10 + Math.random() * 90);
    setCode(`${word}${num}`);
  };

  const handleTypeChange = (type) => {
    setPromotionType(type);
    if (type === 'FREE_DELIVERY') {
      setCode(prev => prev || 'FREEDELIVERY');
      setTitle(prev => prev || 'Free Courier Delivery');
      setDiscountType('FIXED_AMOUNT');
      setDiscountValue('100');
    } else if (type === 'PARTNER_DISCOUNT') {
      setRestaurantId(hotels[0]?.id || '');
    }
  };

  const selectedHotel = hotels.find(h => h.id === restaurantId);

  const validate = () => {
    const errs = {};
    if (!code.trim()) errs.code = 'Please enter a promo code';
    if (promotionType !== 'FREE_DELIVERY' && (!discountValue || Number(discountValue) <= 0)) {
      errs.discountValue = 'Please enter a valid discount';
    }
    if (promotionType === 'PARTNER_DISCOUNT' && !restaurantId) {
      errs.restaurantId = 'Please select a restaurant';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const finalTitle = title.trim() || (
      promotionType === 'FREE_DELIVERY' 
        ? 'Free Courier Delivery' 
        : promotionType === 'PARTNER_DISCOUNT' 
          ? `${selectedHotel?.name || 'Partner'} ${discountValue}${discountType === 'PERCENTAGE' ? '%' : ' Birr'} OFF`
          : `${discountValue}${discountType === 'PERCENTAGE' ? '%' : ' Birr'} Discount with ${code.toUpperCase()}`
    );

    const newPromo = {
      code: code.trim().toUpperCase(),
      title: finalTitle,
      promotionType,
      discountType: promotionType === 'FREE_DELIVERY' ? 'FIXED_AMOUNT' : discountType,
      discountValue: promotionType === 'FREE_DELIVERY' ? 100 : Number(discountValue),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null,
      minOrderAmount: Number(minOrderAmount) || 0,
      totalUsageLimit: totalUsageLimit ? Number(totalUsageLimit) : null,
      perUserLimit: 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: endDate || null,
      isActive: true,
      fundedBy,
      applicableType: promotionType === 'PARTNER_DISCOUNT' ? 'PARTNER_ONLY' : 'ALL',
      restaurantId: promotionType === 'PARTNER_DISCOUNT' ? restaurantId : null,
      restaurant: selectedHotel ? { id: selectedHotel.id, name: selectedHotel.name, code: selectedHotel.code } : null
    };

    onAddPromotion(newPromo);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Promotion" maxWidth="max-w-xl">
      <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto">
        
        {/* Live Visual Ticket Preview */}
        <div className="bg-gradient-to-br from-[#0B2559] via-[#0A1E48] to-[#071329] border border-blue-900/50 rounded-2xl p-4 text-white shadow-lg relative overflow-hidden">
          <div className="absolute right-0 top-0 bottom-0 w-24 bg-brand-500/10 rounded-l-full pointer-events-none" />
          
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black tracking-widest text-sky-400 uppercase">
              {promotionType === 'FREE_DELIVERY' 
                ? '🛵 FREE DELIVERY DEAL' 
                : promotionType === 'PARTNER_DISCOUNT' 
                  ? '🍽️ RESTAURANT EXCLUSIVE' 
                  : '🎟️ CUSTOMER VOUCHER'}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Active
            </span>
          </div>

          <div className="mt-2.5 flex items-baseline justify-between gap-3">
            <div>
              <span className="text-xl font-black font-mono tracking-wider text-white">
                {code ? code.toUpperCase() : 'CODE26'}
              </span>
              <p className="text-xs text-blue-200 mt-0.5 font-medium">
                {promotionType === 'FREE_DELIVERY' 
                  ? '100% Free Courier Delivery (100 Birr Saved)' 
                  : `${discountValue || 0}${discountType === 'PERCENTAGE' ? '%' : ' Birr'} OFF ${selectedHotel ? `at ${selectedHotel.name}` : 'on customer orders'}`}
              </p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[11px] text-blue-300 block font-medium">Valid until</span>
              <span className="text-xs font-bold text-white font-mono">
                {endDate ? new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Expiry'}
              </span>
            </div>
          </div>
        </div>

        {/* 1. Choose Promotion Type (3 big, clear cards) */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            1. What kind of promotion do you want to create?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {/* Promo Code */}
            <button
              type="button"
              onClick={() => handleTypeChange('PROMO_CODE')}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                promotionType === 'PROMO_CODE'
                  ? 'border-brand-600 bg-brand-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className={`p-1.5 rounded-lg ${promotionType === 'PROMO_CODE' ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Tag className="w-4 h-4" />
                </div>
                {promotionType === 'PROMO_CODE' && <Check className="w-4 h-4 text-brand-600" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Promo Code</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Discount code customer types at checkout</p>
              </div>
            </button>

            {/* Free Delivery */}
            <button
              type="button"
              onClick={() => handleTypeChange('FREE_DELIVERY')}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                promotionType === 'FREE_DELIVERY'
                  ? 'border-emerald-600 bg-emerald-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className={`p-1.5 rounded-lg ${promotionType === 'FREE_DELIVERY' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <Truck className="w-4 h-4" />
                </div>
                {promotionType === 'FREE_DELIVERY' && <Check className="w-4 h-4 text-emerald-600" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Free Delivery</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Waives 100 Birr delivery trip fee</p>
              </div>
            </button>

            {/* Restaurant Partner */}
            <button
              type="button"
              onClick={() => handleTypeChange('PARTNER_DISCOUNT')}
              className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer flex flex-col justify-between ${
                promotionType === 'PARTNER_DISCOUNT'
                  ? 'border-amber-600 bg-amber-50/50 shadow-xs'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-1.5">
                <div className={`p-1.5 rounded-lg ${promotionType === 'PARTNER_DISCOUNT' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  <UtensilsCrossed className="w-4 h-4" />
                </div>
                {promotionType === 'PARTNER_DISCOUNT' && <Check className="w-4 h-4 text-amber-600" />}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Restaurant Deal</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Discount for a specific partner restaurant</p>
              </div>
            </button>
          </div>
        </div>

        {/* 2. Promo Code & Name */}
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            2. Promotion Details
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Promo Code Input */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-700">Promo Code</span>
                <button
                  type="button"
                  onClick={generateCode}
                  className="text-[11px] font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Suggest
                </button>
              </div>
              <input
                type="text"
                placeholder="e.g. WELCOME20"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold uppercase tracking-wider focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
              {errors.code && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.code}</p>}
            </div>

            {/* Title / Note */}
            <div>
              <span className="block text-xs font-bold text-slate-700 mb-1">Campaign Title (Optional)</span>
              <input
                type="text"
                placeholder="e.g. Weekend Flash Sale"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Restaurant Selector if Partner Discount */}
          {promotionType === 'PARTNER_DISCOUNT' && (
            <div className="p-3 bg-amber-50/50 border border-amber-200 rounded-xl">
              <label className="block text-xs font-bold text-amber-900 mb-1">Select Partner Restaurant</label>
              <select
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                className="w-full px-3 py-2 text-xs font-semibold bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500/20 outline-none"
              >
                <option value="">Select a restaurant...</option>
                {hotels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name} ({h.code || h.id})</option>
                ))}
              </select>
              {errors.restaurantId && <p className="text-xs text-rose-600 mt-1 font-semibold">{errors.restaurantId}</p>}
            </div>
          )}

          {/* Discount Value Row (Hidden if Free Delivery) */}
          {promotionType === 'FREE_DELIVERY' ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 font-semibold">
              <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Customer pays <strong>0 Birr</strong> for delivery (standard 100 Birr trip fee is covered).</span>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">How much discount?</label>
              <div className="flex items-center gap-2">
                {/* Mode toggle */}
                <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setDiscountType('PERCENTAGE')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      discountType === 'PERCENTAGE' ? 'bg-white shadow-xs text-brand-700' : 'text-slate-600'
                    }`}
                  >
                    % Percent
                  </button>
                  <button
                    type="button"
                    onClick={() => setDiscountType('FIXED_AMOUNT')}
                    className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                      discountType === 'FIXED_AMOUNT' ? 'bg-white shadow-xs text-brand-700' : 'text-slate-600'
                    }`}
                  >
                    Birr Off
                  </button>
                </div>

                {/* Amount input */}
                <div className="relative flex-1">
                  <input
                    type="number"
                    min="1"
                    max={discountType === 'PERCENTAGE' ? '100' : '10000'}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-3.5 py-2 text-sm font-bold font-mono bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
                    placeholder="e.g. 20"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {discountType === 'PERCENTAGE' ? '%' : 'Birr'}
                  </span>
                </div>
              </div>
              {errors.discountValue && <p className="text-xs text-rose-500 mt-1 font-semibold">{errors.discountValue}</p>}
            </div>
          )}

          {/* Who covers the discount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Who covers this discount cost?</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFundedBy('PLATFORM')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  fundedBy === 'PLATFORM'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Balera (100%)
              </button>
              <button
                type="button"
                onClick={() => setFundedBy('RESTAURANT')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  fundedBy === 'RESTAURANT'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                Restaurant (100%)
              </button>
              <button
                type="button"
                onClick={() => setFundedBy('SPLIT_50_50')}
                className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${
                  fundedBy === 'SPLIT_50_50'
                    ? 'border-brand-600 bg-brand-50 text-brand-700 shadow-xs'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                50% / 50% Split
              </button>
            </div>
          </div>

          {/* Expiration Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Valid Until (Expiration Date)</label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono font-semibold bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Optional Advanced Restrictions (Collapsible) */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors py-1 cursor-pointer"
          >
            <span>Optional Rules (Min order, usage limit)</span>
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAdvanced && (
            <div className="mt-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-3 animate-in fade-in duration-150">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Minimum Order Subtotal (Birr)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 (no minimum)"
                    value={minOrderAmount}
                    onChange={(e) => setMinOrderAmount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Order must reach this price to use promo</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Total Max Uses (Overall)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={totalUsageLimit}
                    onChange={(e) => setTotalUsageLimit(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">e.g. First 100 customers only</span>
                </div>
              </div>

              {discountType === 'PERCENTAGE' && promotionType !== 'FREE_DELIVERY' && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Maximum Discount Cap (Birr)
                  </label>
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g. Max 100 Birr off"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Prevents huge percentage discounts on large orders</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md shadow-brand-500/25 transition-all cursor-pointer"
          >
            Create Promotion
          </button>
        </div>
      </form>
    </Modal>
  );
};
