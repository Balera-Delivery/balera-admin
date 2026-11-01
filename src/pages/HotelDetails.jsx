import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Building2, 
  ArrowLeft, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Clock, 
  UtensilsCrossed, 
  Edit3, 
  Trash2, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  PhoneCall, 
  Share2, 
  Sparkles, 
  Tag, 
  AlertCircle,
  Filter,
  Check,
  Percent
} from 'lucide-react';
import { useHotels } from '../context/HotelContext';
import { AddFoodModal } from '../components/modals/AddFoodModal';
import { EditFoodModal } from '../components/modals/EditFoodModal';
import { EditHotelModal } from '../components/modals/EditHotelModal';
import { EditHotelPhonesModal } from '../components/modals/EditHotelPhonesModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';

export const HotelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    getHotelById, 
    toggleHotelStatus, 
    deleteHotel, 
    toggleFoodAvailability, 
    deleteFoodItem 
  } = useHotels();

  const hotel = getHotelById(id);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modals
  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [deletingFood, setDeletingFood] = useState(null);
  const [isEditHotelOpen, setIsEditHotelOpen] = useState(false);
  const [isEditPhonesOpen, setIsEditPhonesOpen] = useState(false);
  const [isDeleteHotelOpen, setIsDeleteHotelOpen] = useState(false);

  // Categories present in this specific hotel's menu
  const menuCategories = useMemo(() => {
    if (!hotel || !hotel.foods) return ['All'];
    const cats = new Set(hotel.foods.map(f => f.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [hotel]);

  // Filtered foods
  const filteredFoods = useMemo(() => {
    if (!hotel || !hotel.foods) return [];
    return hotel.foods.filter(food => {
      const matchesSearch = 
        food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (food.tag && food.tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
        food.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCategory = selectedCategory === 'All' || food.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [hotel, searchQuery, selectedCategory]);

  if (!hotel) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4 text-slate-400">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-lg font-bold text-slate-900">Hotel / Restaurant Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">The establishment you are looking for does not exist or has been removed.</p>
        <button
          onClick={() => navigate('/hotels')}
          className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Partner Management</span>
        </button>
      </div>
    );
  }

  const inStockCount = (hotel.foods || []).filter(f => f.isAvailable).length;
  const outOfStockCount = (hotel.foods || []).length - inStockCount;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/hotels')}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Hotels Directory</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsEditHotelOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-2xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>

          <button
            onClick={() => setIsDeleteHotelOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold shadow-2xs transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Hotel</span>
          </button>
        </div>
      </div>

      {/* Hero Banner Header */}
      <div className="relative rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 bg-white">
        <div className="relative h-48 sm:h-56 bg-slate-900">
          <img
            src={hotel.banner}
            alt={hotel.name}
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent"></div>

          {/* Top Chips */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleHotelStatus(hotel.id)}
                className={`px-3 py-1 rounded-full text-xs font-bold shadow-sm backdrop-blur-md transition-transform active:scale-95 cursor-pointer ${
                  hotel.status === 'Active'
                    ? 'bg-emerald-500/90 text-white hover:bg-emerald-600'
                    : 'bg-rose-500/90 text-white hover:bg-rose-600'
                }`}
                title="Click to toggle status"
              >
                ● {hotel.status}
              </button>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-slate-800 backdrop-blur-md">
                {hotel.category}
              </span>
            </div>
          </div>

          {/* Title & Info on bottom of banner */}
          <div className="absolute bottom-4 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">{hotel.name}</h1>
              <p className="text-xs sm:text-sm text-slate-200 mt-1 font-medium flex items-center gap-2">
                <span>{hotel.cuisineType || hotel.category}</span>
                <span>•</span>
                <span>{hotel.address}</span>
              </p>
            </div>

            <button
              onClick={() => setIsAddFoodOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-brand-600/30 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish to Menu</span>
            </button>
          </div>
        </div>

        {/* Info Sub-bar */}
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 bg-slate-50/50">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location / Address</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">{hotel.address}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0 mt-0.5">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Operating Hours</p>
              <p className="text-xs font-semibold text-slate-800 mt-0.5">{hotel.openingHours}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Phone Numbers Contact Card */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Contact Phone Numbers</h3>
              <p className="text-xs text-slate-400">Direct phone numbers for order dispatch</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditPhonesOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition-colors self-start sm:self-auto cursor-pointer"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Edit Phones</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          {/* Phone 1 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Primary Phone</span>
              {hotel.phone1 ? (
                <div className="text-sm font-mono font-bold text-slate-900 flex items-center gap-2">
                  <span>{hotel.phone1}</span>
                  <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-emerald-100 text-emerald-800 rounded">Active</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No phone number added</p>
              )}
            </div>
            <button
              onClick={() => setIsEditPhonesOpen(true)}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline shrink-0 cursor-pointer"
            >
              {hotel.phone1 ? 'Change' : '+ Add'}
            </button>
          </div>

          {/* Phone 2 */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Secondary Phone</span>
              {hotel.phone2 ? (
                <div className="text-sm font-mono font-bold text-slate-900 flex items-center gap-2">
                  <span>{hotel.phone2}</span>
                  <span className="px-1.5 py-0.2 text-[10px] font-semibold bg-blue-100 text-blue-800 rounded">Backup</span>
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No phone number added</p>
              )}
            </div>
            <button
              onClick={() => setIsEditPhonesOpen(true)}
              className="text-xs font-bold text-brand-600 hover:text-brand-700 hover:underline shrink-0 cursor-pointer"
            >
              {hotel.phone2 ? 'Change' : '+ Add'}
            </button>
          </div>
        </div>
      </div>

      {/* Menu Catalog Section */}
      <div className="space-y-4">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">Food Menu & Dishes Catalog</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Showing {filteredFoods.length} of {(hotel.foods || []).length} items • <span className="text-emerald-600 font-semibold">{inStockCount} in stock</span> • <span className="text-slate-400">{outOfStockCount} out of stock</span>
            </p>
          </div>

          <button
            onClick={() => setIsAddFoodOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/25 transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Dish</span>
          </button>
        </div>

        {/* Search & Category Tabs */}
        <div className="space-y-3">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {menuCategories.map((cat) => {
              const count = cat === 'All' 
                ? (hotel.foods || []).length 
                : (hotel.foods || []).filter(f => f.category === cat).length;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    selectedCategory === cat
                      ? 'bg-brand-600 text-white shadow-sm shadow-brand-500/25'
                      : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{cat}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedCategory === cat ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Bar */}
          <div className="relative max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search dishes by name, ingredients, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
            />
          </div>
        </div>

        {/* Dishes Grid */}
        {filteredFoods.length === 0 ? (
          <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-800">No food items found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              No dishes match your selected category or search keyword.
            </p>
            <button
              onClick={() => setIsAddFoodOpen(true)}
              className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish to Menu</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFoods.map((food) => (
              <div
                key={food.id}
                className={`bg-white border rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-3 relative group ${
                  food.isAvailable ? 'border-slate-200/80' : 'border-slate-200 opacity-75 bg-slate-50/50'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  {/* Dish Thumbnail */}
                  <div className="relative w-18 h-18 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                    <img
                      src={food.image}
                      alt={food.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    {!food.isAvailable && (
                      <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white uppercase tracking-wider text-center px-1">
                          Sold Out
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 truncate leading-snug">
                        {food.name}
                      </h4>
                    </div>

                    <p className="text-[11px] font-medium text-slate-400 mt-0.5 truncate">
                      {food.category}
                    </p>

                    {food.description && (
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {food.description}
                      </p>
                    )}

                    {food.tag && (
                      <span className="inline-block px-2 py-0.5 mt-1.5 text-[10px] font-bold rounded-md bg-brand-50 text-brand-700 border border-brand-200/50">
                        {food.tag}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price, Stock Switcher & Action buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Price</span>
                    <span className="text-base font-extrabold text-slate-900">
                      {food.price} <span className="text-xs font-semibold text-brand-600">Birr</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Stock Status Toggle */}
                    <button
                      onClick={() => toggleFoodAvailability(hotel.id, food.id)}
                      className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                        food.isAvailable
                          ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                      }`}
                      title="Click to toggle stock availability"
                    >
                      {food.isAvailable ? 'In Stock' : 'Out of Stock'}
                    </button>

                    {/* Edit button */}
                    <button
                      onClick={() => setEditingFood(food)}
                      className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 transition-colors"
                      title="Edit Dish"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => setDeletingFood(food)}
                      className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                      title="Delete Dish"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MODALS */}
      {/* Add Food Modal */}
      <AddFoodModal
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        hotelId={hotel.id}
        defaultCategory={selectedCategory !== 'All' ? selectedCategory : undefined}
      />

      {/* Edit Food Modal */}
      <EditFoodModal
        isOpen={!!editingFood}
        onClose={() => setEditingFood(null)}
        hotelId={hotel.id}
        food={editingFood}
      />

      {/* Delete Food Confirm Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingFood}
        onClose={() => setDeletingFood(null)}
        onConfirm={() => deletingFood && deleteFoodItem(hotel.id, deletingFood.id)}
        title="Delete Food Dish"
        itemName={deletingFood?.name}
        message={`Are you sure you want to remove "${deletingFood?.name}" (${deletingFood?.price} Birr) from ${hotel.name}'s menu?`}
      />

      {/* Edit Hotel Modal */}
      <EditHotelModal
        isOpen={isEditHotelOpen}
        onClose={() => setIsEditHotelOpen(false)}
        hotel={hotel}
      />

      {/* Edit Phones Modal */}
      <EditHotelPhonesModal
        isOpen={isEditPhonesOpen}
        onClose={() => setIsEditPhonesOpen(false)}
        hotel={hotel}
      />

      {/* Delete Hotel Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteHotelOpen}
        onClose={() => setIsDeleteHotelOpen(false)}
        onConfirm={() => {
          deleteHotel(hotel.id);
          navigate('/hotels');
        }}
        title="Delete Establishment"
        itemName={hotel.name}
        message={`Are you sure you want to permanently delete "${hotel.name}" and all of its ${(hotel.foods || []).length} dishes?`}
      />
    </div>
  );
};
