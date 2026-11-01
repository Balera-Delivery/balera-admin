import React, { useState, useEffect, useMemo } from 'react';
import { 
  Tag, 
  Plus, 
  Search, 
  Filter, 
  Sparkles, 
  Percent, 
  Truck, 
  UtensilsCrossed, 
  Zap, 
  Calendar, 
  CheckCircle2, 
  PauseCircle, 
  Copy, 
  Check, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  RefreshCw,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { StatCard } from '../components/common/StatCard';
import { AddPromotionModal } from '../components/modals/AddPromotionModal';
import { EditPromotionModal } from '../components/modals/EditPromotionModal';
import { promotionsApi, INITIAL_PROMOTIONS } from '../api/services/promotionsApi';

export const Promotions = () => {
  const [promotions, setPromotions] = useState(() => {
    try {
      const saved = localStorage.getItem('balera_promotions_cache');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Filter out legacy mock data if present
        const realOnly = parsed.filter(p => !['PROMO-001', 'PROMO-002', 'PROMO-003', 'PROMO-004'].includes(p.id));
        return realOnly;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusTab, setStatusTab] = useState('ALL'); // ALL, ACTIVE, PAUSED, EXPIRED
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [copiedCode, setCopiedCode] = useState(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState(null);

  // Sync with API on mount
  useEffect(() => {
    loadPromotions();
  }, []);

  // Save to localStorage cache
  useEffect(() => {
    try {
      localStorage.setItem('balera_promotions_cache', JSON.stringify(promotions));
    } catch {}
  }, [promotions]);

  const loadPromotions = async () => {
    setIsLoading(true);
    try {
      const data = await promotionsApi.getPromotions();
      if (Array.isArray(data)) {
        // Filter out legacy mock data if present
        const realOnly = data.filter(p => !['PROMO-001', 'PROMO-002', 'PROMO-003', 'PROMO-004'].includes(p.id));
        setPromotions(realOnly);
      }
    } catch (e) {
      console.warn('Could not load promotions from API:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleAddPromotion = async (newPromo) => {
    try {
      const created = await promotionsApi.createPromotion(newPromo);
      setPromotions(prev => [created, ...prev]);
    } catch (e) {
      setPromotions(prev => [{ ...newPromo, id: `PROMO-${Date.now()}`, usedCount: 0 }, ...prev]);
    }
  };

  const handleUpdatePromotion = async (updatedPromo) => {
    try {
      await promotionsApi.updatePromotion(updatedPromo.id, updatedPromo);
      setPromotions(prev => prev.map(p => p.id === updatedPromo.id ? updatedPromo : p));
    } catch (e) {
      setPromotions(prev => prev.map(p => p.id === updatedPromo.id ? updatedPromo : p));
    }
  };

  const handleToggleStatus = async (id) => {
    setPromotions(prev => prev.map(p => {
      if (p.id === id) {
        return { ...p, isActive: !p.isActive };
      }
      return p;
    }));
    await promotionsApi.toggleStatus(id);
  };

  const handleDeletePromotion = async (id) => {
    if (window.confirm('Are you sure you want to delete this promotion campaign?')) {
      setPromotions(prev => prev.filter(p => p.id !== id));
      await promotionsApi.deletePromotion(id);
    }
  };

  // KPIs
  const metrics = useMemo(() => {
    const now = new Date();
    const activeCount = promotions.filter(p => {
      const isDateValid = !p.endDate || new Date(p.endDate) >= now;
      return p.isActive && isDateValid;
    }).length;

    const totalRedemptions = promotions.reduce((acc, p) => acc + (p.usedCount || 0), 0);

    // Approximate total discounts: e.g. usedCount * avg discount value
    const totalDiscountValue = promotions.reduce((acc, p) => {
      const value = p.discountType === 'FIXED_AMOUNT' ? p.discountValue : Math.min(p.maxDiscount || 50, 45);
      return acc + ((p.usedCount || 0) * value);
    }, 0);

    const topPromo = [...promotions].sort((a, b) => (b.usedCount || 0) - (a.usedCount || 0))[0];

    return {
      activeCount,
      totalRedemptions,
      totalDiscountValue,
      topPromoCode: (topPromo && topPromo.usedCount > 0) ? topPromo.code : '—'
    };
  }, [promotions]);

  // Filtered promotions
  const filteredPromotions = useMemo(() => {
    const now = new Date();
    return promotions.filter(p => {
      const isExpired = p.endDate && new Date(p.endDate) < now;
      
      // Status tab filter
      if (statusTab === 'ACTIVE' && (!p.isActive || isExpired)) return false;
      if (statusTab === 'PAUSED' && (p.isActive || isExpired)) return false;
      if (statusTab === 'EXPIRED' && !isExpired) return false;

      // Type filter
      if (typeFilter !== 'ALL' && p.promotionType !== typeFilter) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesCode = p.code?.toLowerCase().includes(query);
        const matchesTitle = p.title?.toLowerCase().includes(query);
        const matchesDesc = p.description?.toLowerCase().includes(query);
        const matchesPartner = p.restaurant?.name?.toLowerCase().includes(query);
        return matchesCode || matchesTitle || matchesDesc || matchesPartner;
      }

      return true;
    });
  }, [promotions, statusTab, typeFilter, searchQuery]);

  const getTypeBadge = (type) => {
    switch (type) {
      case 'FREE_DELIVERY':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Truck className="w-3 h-3" /> Free Delivery
          </span>
        );
      case 'PARTNER_DISCOUNT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <UtensilsCrossed className="w-3 h-3" /> Partner Deal
          </span>
        );
      case 'PLATFORM_AUTOMATIC':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
            <Zap className="w-3 h-3" /> Auto Promo
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-brand-700 border border-blue-200">
            <Tag className="w-3 h-3" /> Promo Code
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Promotion & Discount Campaigns
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200/60">
              {promotions.length} Total
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage customer promo vouchers, free delivery campaigns, and restaurant partner discounts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadPromotions}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Refresh promotions"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-brand-600' : ''}`} />
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/25 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Promotion</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Campaigns"
          value={metrics.activeCount}
          icon={Tag}
          badge={{ text: 'Live Now', color: 'bg-emerald-50 text-emerald-700' }}
        />
        <StatCard
          title="Total Redemptions"
          value={metrics.totalRedemptions.toLocaleString()}
          icon={TrendingUp}
          subtitle="Orders discounted"
        />
        <StatCard
          title="Total Discounts Given"
          value={`${metrics.totalDiscountValue.toLocaleString()} Birr`}
          icon={Percent}
          subtitle="Customer savings"
        />
        <StatCard
          title="Top Performing Code"
          value={metrics.topPromoCode}
          icon={Sparkles}
          badge={{ text: 'Popular', color: 'bg-brand-50 text-brand-700' }}
        />
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 shrink-0">
            {[
              { id: 'ALL', label: 'All Campaigns' },
              { id: 'ACTIVE', label: 'Active' },
              { id: 'PAUSED', label: 'Paused' },
              { id: 'EXPIRED', label: 'Expired' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  statusTab === tab.id
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Type Filter & Search */}
          <div className="flex items-center gap-3 flex-1 justify-end">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700 outline-none"
            >
              <option value="ALL">All Types</option>
              <option value="PROMO_CODE">Promo Code</option>
              <option value="FREE_DELIVERY">Free Delivery</option>
              <option value="PARTNER_DISCOUNT">Partner Deal</option>
              <option value="PLATFORM_AUTOMATIC">Automatic Promo</option>
            </select>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search code or title..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-3.5">Promo Campaign</th>
                <th className="px-6 py-3.5">Type</th>
                <th className="px-6 py-3.5">Discount Value</th>
                <th className="px-6 py-3.5">Target Scope</th>
                <th className="px-6 py-3.5">Redemptions</th>
                <th className="px-6 py-3.5">Validity</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredPromotions.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-16 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Tag className="w-6 h-6" />
                    </div>
                    <p className="font-bold text-slate-800 text-sm">No promotion campaigns yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Click below to create your first real promo voucher, free delivery campaign, or restaurant partner deal.
                    </p>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Create Your First Promotion</span>
                    </button>
                  </td>
                </tr>
              ) : (
                filteredPromotions.map((promo) => {
                  const isExpired = promo.endDate && new Date(promo.endDate) < new Date();
                  const usagePercent = promo.totalUsageLimit 
                    ? Math.min(100, Math.round((promo.usedCount / promo.totalUsageLimit) * 100))
                    : null;

                  return (
                    <tr key={promo.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Code & Title */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2.5">
                          <button
                            onClick={() => handleCopyCode(promo.code)}
                            className="group flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 hover:bg-brand-50 hover:text-brand-700 rounded-lg text-xs font-mono font-black text-slate-800 transition-colors cursor-pointer"
                            title="Click to copy code"
                          >
                            <span>{promo.code}</span>
                            {copiedCode === promo.code ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3 text-slate-400 group-hover:text-brand-600" />
                            )}
                          </button>
                        </div>
                        <p className="font-bold text-slate-900 mt-1 truncate max-w-xs">{promo.title}</p>
                        {promo.description && (
                          <p className="text-[11px] text-slate-400 truncate max-w-xs">{promo.description}</p>
                        )}
                      </td>

                      {/* Type Badge */}
                      <td className="px-6 py-4">
                        {getTypeBadge(promo.promotionType)}
                      </td>

                      {/* Discount Value */}
                      <td className="px-6 py-4 font-bold text-slate-900">
                        {promo.promotionType === 'FREE_DELIVERY' ? (
                          <span className="text-emerald-600">100% Free Courier</span>
                        ) : promo.discountType === 'PERCENTAGE' ? (
                          <div>
                            <span className="text-brand-600 font-extrabold">{promo.discountValue}% OFF</span>
                            {promo.maxDiscount && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                Cap: {promo.maxDiscount} Birr
                              </span>
                            )}
                          </div>
                        ) : (
                          <div>
                            <span className="text-brand-600 font-extrabold">{promo.discountValue} Birr OFF</span>
                            {promo.minOrderAmount > 0 && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                Min: {promo.minOrderAmount} Birr
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Scope */}
                      <td className="px-6 py-4">
                        {promo.restaurant ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                            <span className="font-semibold text-slate-700 truncate max-w-[140px]" title={promo.restaurant.name}>
                              {promo.restaurant.name}
                            </span>
                          </div>
                        ) : promo.applicableType === 'FOOD_ONLY' ? (
                          <span className="text-slate-600 font-medium">Food Orders Only</span>
                        ) : promo.applicableType === 'PACKAGE_ONLY' ? (
                          <span className="text-slate-600 font-medium">Package Couriers</span>
                        ) : (
                          <span className="text-slate-600 font-medium">All Deliveries</span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="px-6 py-4">
                        <div className="w-32">
                          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mb-1">
                            <span>{promo.usedCount || 0} used</span>
                            {promo.totalUsageLimit && (
                              <span className="text-slate-400">/ {promo.totalUsageLimit}</span>
                            )}
                          </div>
                          {usagePercent !== null && (
                            <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${
                                  usagePercent > 80 ? 'bg-amber-500' : 'bg-brand-600'
                                }`}
                                style={{ width: `${usagePercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Validity */}
                      <td className="px-6 py-4 text-slate-600 text-[11px]">
                        <div>
                          <span className="text-slate-400">Ends: </span>
                          <span className={`font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-700'}`}>
                            {promo.endDate ? new Date(promo.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'No Expiry'}
                          </span>
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-6 py-4">
                        {isExpired ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500 border border-slate-200">
                            Expired
                          </span>
                        ) : (
                          <button
                            onClick={() => handleToggleStatus(promo.id)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                              promo.isActive
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${promo.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`} />
                            {promo.isActive ? 'Active' : 'Paused'}
                          </button>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => setEditingPromotion(promo)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                            title="Edit campaign"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeletePromotion(promo.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete campaign"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Promotion Modal */}
      <AddPromotionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPromotion={handleAddPromotion}
      />

      {/* Edit Promotion Modal */}
      {editingPromotion && (
        <EditPromotionModal
          isOpen={true}
          onClose={() => setEditingPromotion(null)}
          promotion={editingPromotion}
          onUpdatePromotion={handleUpdatePromotion}
        />
      )}
    </div>
  );
};
