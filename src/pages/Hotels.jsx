import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Plus, 
  Search, 
  Phone, 
  MapPin, 
  Clock, 
  UtensilsCrossed, 
  Star, 
  Edit3, 
  Trash2, 
  ChevronRight, 
  Filter, 
  Grid, 
  List, 
  CheckCircle, 
  XCircle, 
  DollarSign, 
  Store, 
  Sparkles,
  PhoneCall,
  Eye,
  SlidersHorizontal,
  Layers,
  Flame,
  AlertCircle,
  Database,
  RefreshCw
} from 'lucide-react';
import { useHotels } from '../context/HotelContext';
import { AddHotelModal } from '../components/modals/AddHotelModal';
import { EditHotelModal } from '../components/modals/EditHotelModal';
import { EditHotelPhonesModal } from '../components/modals/EditHotelPhonesModal';
import { AddFoodModal } from '../components/modals/AddFoodModal';
import { EditFoodModal } from '../components/modals/EditFoodModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';

export const Hotels = () => {
  const navigate = useNavigate();
  const { 
    hotels, 
    stats, 
    deleteHotel, 
    toggleHotelStatus,
    toggleFoodAvailability,
    deleteFoodItem,
    isLoading,
    isSyncing,
    isBackendConnected,
    fetchHotels,
    resetToDefaults
  } = useHotels();

  const [activeTab, setActiveTab] = useState('hotels'); // 'hotels' | 'all-foods'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedHotelFilter, setSelectedHotelFilter] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modals state
  const [isAddHotelOpen, setIsAddHotelOpen] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [editingPhonesHotel, setEditingPhonesHotel] = useState(null);
  const [deletingHotel, setDeletingHotel] = useState(null);

  // Food Modals state for master menu tab
  const [addFoodTargetHotelId, setAddFoodTargetHotelId] = useState(null);
  const [editingFoodData, setEditingFoodData] = useState(null); // { hotelId, food }
  const [deletingFoodData, setDeletingFoodData] = useState(null); // { hotelId, food }

  // Unique categories for filter
  const categoryOptions = useMemo(() => {
    const cats = new Set(hotels.map(h => h.category));
    return ['All', ...Array.from(cats)];
  }, [hotels]);

  // Filtered hotels list
  const filteredHotels = useMemo(() => {
    return hotels.filter(hotel => {
      const matchesSearch = 
        hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hotel.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (hotel.phone1 && hotel.phone1.includes(searchQuery)) ||
        (hotel.phone2 && hotel.phone2.includes(searchQuery)) ||
        (hotel.foods || []).some(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesCategory = selectedCategory === 'All' || hotel.category === selectedCategory;
      const matchesStatus = statusFilter === 'All' || hotel.status === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [hotels, searchQuery, selectedCategory, statusFilter]);

  // Flattened food list across all hotels for master dishes explorer tab
  const allFlattenedFoods = useMemo(() => {
    const list = [];
    hotels.forEach(h => {
      (h.foods || []).forEach(f => {
        list.push({
          ...f,
          hotelId: h.id,
          hotelName: h.name,
          hotelCategory: h.category,
          hotelStatus: h.status
        });
      });
    });

    return list.filter(item => {
      const matchesSearch = 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.hotelName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesHotel = selectedHotelFilter === 'All' || item.hotelId === selectedHotelFilter;
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      return matchesSearch && matchesHotel && matchesCategory;
    });
  }, [hotels, searchQuery, selectedHotelFilter, selectedCategory]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Hotels & Restaurants</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-50 text-brand-700 border border-brand-200/60">
              {stats.totalHotels} Partners
            </span>
          </div>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Manage partner food establishments, complete food menus, pricing, and contact phone numbers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold shadow-2xs">
            <Database className={`w-3.5 h-3.5 ${isBackendConnected ? 'text-emerald-500' : 'text-amber-500'}`} />
            <span className={isBackendConnected ? 'text-emerald-700 font-bold' : 'text-slate-600'}>
              {isBackendConnected ? 'PostgreSQL Connected' : 'Local / Offline Mode'}
            </span>
          </div>

          <button
            onClick={() => fetchHotels()}
            disabled={isLoading || isSyncing}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold shadow-2xs transition-all disabled:opacity-50"
            title="Refresh & Sync from Database"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading || isSyncing ? 'animate-spin text-brand-600' : ''}`} />
            <span>{isLoading || isSyncing ? 'Syncing...' : 'Sync DB'}</span>
          </button>

          <button
            onClick={() => setIsAddHotelOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Hotel / Restaurant</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Establishments</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{stats.totalHotels}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">{stats.activeHotels} Active / Serving</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Total Menu Dishes</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{stats.totalFoods}</h3>
            <span className="text-[10px] text-emerald-600 font-semibold">{stats.availableFoods} Available in stock</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Average Dish Price</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{stats.averageFoodPrice} <span className="text-xs font-medium text-slate-400">ETB</span></h3>
            <span className="text-[10px] text-slate-400">Across all restaurants</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Out of Stock Dishes</p>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{stats.outOfStockFoods}</h3>
            <span className="text-[10px] text-slate-400">Items disabled</span>
          </div>
        </div>
      </div>

      {/* Main Tabs Header */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => { setActiveTab('hotels'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'hotels'
              ? 'border-brand-600 text-brand-600 bg-brand-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Hotels & Restaurants Directory ({hotels.length})</span>
        </button>

        <button
          onClick={() => { setActiveTab('all-foods'); setSearchQuery(''); }}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'all-foods'
              ? 'border-brand-600 text-brand-600 bg-brand-50/20'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Master Food Menu Explorer ({stats.totalFoods} Dishes)</span>
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={activeTab === 'hotels' ? "Search hotel name, location, cuisine, phone or dish..." : "Search across all foods, ingredients, restaurants..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {activeTab === 'all-foods' && (
            <select
              value={selectedHotelFilter}
              onChange={(e) => setSelectedHotelFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-700"
            >
              <option value="All">All Restaurants ({hotels.length})</option>
              {hotels.map(h => (
                <option key={h.id} value={h.id}>{h.name} ({(h.foods || []).length})</option>
              ))}
            </select>
          )}

          {activeTab === 'hotels' && (
            <>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-700"
              >
                {categoryOptions.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-700"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active Only</option>
                <option value="Inactive">Inactive Only</option>
              </select>

              {/* Grid / List View Toggle */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-xs text-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Grid View"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white shadow-xs text-brand-600' : 'text-slate-500 hover:text-slate-800'}`}
                  title="Table Directory View"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* TAB 1: HOTELS & RESTAURANTS DIRECTORY */}
      {activeTab === 'hotels' && (
        <>
          {filteredHotels.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">No establishments found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                No hotels match your current search criteria. Try modifying your filter or create a new establishment.
              </p>
              <button
                onClick={() => setIsAddHotelOpen(true)}
                className="mt-4 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Hotel / Restaurant</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            /* GRID VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredHotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col overflow-hidden group"
                >
                  {/* Banner / Cover */}
                  <div className="relative h-40 overflow-hidden bg-slate-100">
                    <img
                      src={hotel.banner}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                    {/* Status Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold shadow-sm backdrop-blur-md ${
                          hotel.status === 'Active'
                            ? 'bg-emerald-500/90 text-white'
                            : 'bg-rose-500/90 text-white'
                        }`}
                      >
                        {hotel.status}
                      </span>
                      <span className="px-2 py-1 rounded-full text-[10px] font-semibold bg-white/90 text-slate-800 backdrop-blur-md">
                        {hotel.category}
                      </span>
                    </div>

                    {/* Rating Chip */}
                    <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-slate-900 shadow-sm">
                      <Star className="w-3 h-3 fill-slate-900" />
                      <span>{hotel.rating}</span>
                    </div>

                    {/* Establishment Name & Cuisine Type on Banner */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <h3
                        onClick={() => navigate(`/hotels/${hotel.id}`)}
                        className="text-base font-bold text-white hover:text-brand-300 transition-colors cursor-pointer truncate"
                      >
                        {hotel.name}
                      </h3>
                      <p className="text-[11px] text-slate-200 truncate">{hotel.cuisineType || hotel.category}</p>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3.5">
                    {/* Address & Hours */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2 truncate">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{hotel.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{hotel.openingHours}</span>
                      </div>
                    </div>

                    {/* Phone Numbers Section (Up to 2 Phones) */}
                    <div className="p-2.5 bg-slate-50 border border-slate-200/70 rounded-xl space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-brand-600" />
                          Phone Contact
                        </span>
                        <button
                          onClick={() => setEditingPhonesHotel(hotel)}
                          className="text-[10px] text-brand-600 hover:text-brand-700 font-bold hover:underline"
                        >
                          Edit Phones
                        </button>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block">Phone 1:</span>
                          {hotel.phone1 ? (
                            <span className="font-mono font-semibold text-slate-800">{hotel.phone1}</span>
                          ) : (
                            <button
                              onClick={() => setEditingPhonesHotel(hotel)}
                              className="text-slate-400 hover:text-brand-600 italic text-[10px]"
                            >
                              + Add Phone 1
                            </button>
                          )}
                        </div>

                        <div className="truncate">
                          <span className="text-[10px] text-slate-400 block">Phone 2:</span>
                          {hotel.phone2 ? (
                            <span className="font-mono font-semibold text-slate-800">{hotel.phone2}</span>
                          ) : (
                            <button
                              onClick={() => setEditingPhonesHotel(hotel)}
                              className="text-slate-400 hover:text-brand-600 italic text-[10px]"
                            >
                              + Add Phone 2
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Menu Dishes Count & Category Chip */}
                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1.5 font-bold text-brand-600">
                        <UtensilsCrossed className="w-3.5 h-3.5" />
                        <span>{(hotel.foods || []).length} Food Dishes</span>
                      </div>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        {hotel.category}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-4 gap-1.5 pt-2">
                      <button
                        onClick={() => navigate(`/hotels/${hotel.id}`)}
                        className="col-span-2 py-2 px-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span>Manage Menu</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => setEditingHotel(hotel)}
                        className="py-2 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center gap-1"
                        title="Edit Hotel Profile"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Edit</span>
                      </button>

                      <button
                        onClick={() => setDeletingHotel(hotel)}
                        className="py-2 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl text-xs font-semibold transition-colors flex items-center justify-center"
                        title="Delete Establishment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* TABLE DIRECTORY VIEW */
            <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                    <tr>
                      <th className="px-6 py-3.5">Establishment</th>
                      <th className="px-6 py-3.5">Category</th>
                      <th className="px-6 py-3.5">Phone 1</th>
                      <th className="px-6 py-3.5">Phone 2</th>
                      <th className="px-6 py-3.5">Dishes</th>
                      <th className="px-6 py-3.5">Status</th>
                      <th className="px-6 py-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredHotels.map((hotel) => (
                      <tr key={hotel.id} className="hover:bg-slate-50/80 transition-colors">
                        <td 
                          onClick={() => navigate(`/hotels/${hotel.id}`)}
                          className="px-6 py-4 cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            <img
                              src={hotel.banner}
                              alt={hotel.name}
                              className="w-10 h-10 rounded-xl object-cover shrink-0"
                            />
                            <div>
                              <p className="font-bold text-slate-900 hover:text-brand-600 transition-colors">{hotel.name}</p>
                              <p className="text-[11px] text-slate-400">{hotel.address}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold text-[11px]">
                            {hotel.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {hotel.phone1 ? hotel.phone1 : <span className="text-slate-400 italic">Not set</span>}
                        </td>
                        <td className="px-6 py-4 font-mono">
                          {hotel.phone2 ? hotel.phone2 : <span className="text-slate-400 italic">Not set</span>}
                        </td>
                        <td className="px-6 py-4 font-bold text-slate-900">
                          {(hotel.foods || []).length} items
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleHotelStatus(hotel.id)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                              hotel.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                                : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                            }`}
                          >
                            {hotel.status}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => navigate(`/hotels/${hotel.id}`)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                              title="View & Edit Menu"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setEditingHotel(hotel)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                              title="Edit Details"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeletingHotel(hotel)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Delete Hotel"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB 2: MASTER FOOD MENU EXPLORER */}
      {activeTab === 'all-foods' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Platform Dishes & Pricing Master List</h3>
                <p className="text-[11px] text-slate-400">Search, edit pricing, and toggle stock availability across all restaurants</p>
              </div>

              <span className="text-xs font-semibold text-slate-500">
                Showing <strong className="text-slate-800">{allFlattenedFoods.length}</strong> dishes
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-3.5">Dish / Food Item</th>
                    <th className="px-6 py-3.5">Restaurant</th>
                    <th className="px-6 py-3.5">Category</th>
                    <th className="px-6 py-3.5">Price (Birr)</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {allFlattenedFoods.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-10 h-10 rounded-xl object-cover shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900">{item.name}</p>
                            {item.tag && (
                              <span className="text-[10px] font-bold text-brand-600 bg-brand-50 px-1.5 py-0.2 rounded mt-0.5 inline-block">
                                {item.tag}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => navigate(`/hotels/${item.hotelId}`)}
                          className="font-bold text-brand-600 hover:underline text-left block truncate max-w-xs"
                        >
                          {item.hotelName}
                        </button>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px]">
                          {item.category}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-slate-900 text-sm">
                        {item.price} <span className="text-[11px] font-medium text-slate-400">Birr</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <button
                          onClick={() => toggleFoodAvailability(item.hotelId, item.id)}
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold transition-all ${
                            item.isAvailable
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditingFoodData({ hotelId: item.hotelId, food: item })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                            title="Edit Price & Dish Details"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingFoodData({ hotelId: item.hotelId, food: item })}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Dish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      {/* 1. Add Hotel Modal */}
      <AddHotelModal
        isOpen={isAddHotelOpen}
        onClose={() => setIsAddHotelOpen(false)}
      />

      {/* 2. Edit Hotel Modal */}
      <EditHotelModal
        isOpen={!!editingHotel}
        onClose={() => setEditingHotel(null)}
        hotel={editingHotel}
      />

      {/* 3. Quick Edit Hotel Phones Modal */}
      <EditHotelPhonesModal
        isOpen={!!editingPhonesHotel}
        onClose={() => setEditingPhonesHotel(null)}
        hotel={editingPhonesHotel}
      />

      {/* 4. Delete Hotel Confirm */}
      <DeleteConfirmModal
        isOpen={!!deletingHotel}
        onClose={() => setDeletingHotel(null)}
        onConfirm={() => deletingHotel && deleteHotel(deletingHotel.id)}
        title="Delete Hotel / Restaurant"
        itemName={deletingHotel?.name}
        message={`Are you sure you want to delete "${deletingHotel?.name}"? All associated dishes (${(deletingHotel?.foods || []).length} items) will also be removed.`}
      />

      {/* 5. Edit Food Modal */}
      <EditFoodModal
        isOpen={!!editingFoodData}
        onClose={() => setEditingFoodData(null)}
        hotelId={editingFoodData?.hotelId}
        food={editingFoodData?.food}
      />

      {/* 6. Delete Food Confirm */}
      <DeleteConfirmModal
        isOpen={!!deletingFoodData}
        onClose={() => setDeletingFoodData(null)}
        onConfirm={() => deletingFoodData && deleteFoodItem(deletingFoodData.hotelId, deletingFoodData.food.id)}
        title="Delete Food Item"
        itemName={deletingFoodData?.food?.name}
        message={`Are you sure you want to delete "${deletingFoodData?.food?.name}" from the menu?`}
      />
    </div>
  );
};
