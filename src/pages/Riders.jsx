import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit2, Trash2, Power, Bike, CheckCircle2, AlertTriangle, ShieldCheck, UserCheck } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { AddRiderModal } from '../components/modals/AddRiderModal';
import { EditRiderModal } from '../components/modals/EditRiderModal';
import { useDelivery } from '../context/DeliveryContext';
import { useNotifications } from '../context/NotificationContext';

export const Riders = () => {
  const { riders, toggleRiderOnline, toggleRiderActive, toggleRiderDeactivation, deleteRider, approveRider } = useDelivery();
  const { addNotification } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRiderForEdit, setSelectedRiderForEdit] = useState(null);
  const navigate = useNavigate();

  // Pending approval count
  const pendingApprovalCount = useMemo(() => {
    return riders.filter(r => r.accountStatus === 'Pending Approval').length;
  }, [riders]);

  const filteredRiders = useMemo(() => {
    return riders.filter(r => {
      // Search matching
      const matchesSearch = 
        r.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.phone?.includes(searchQuery) ||
        r.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.vehicle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        r.id?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter matching
      if (!matchesSearch) return false;
      if (statusFilter === 'ACTIVE') return r.accountStatus === 'Active';
      if (statusFilter === 'PENDING') return r.accountStatus === 'Pending Approval';
      if (statusFilter === 'SUSPENDED') return r.accountStatus === 'Suspended';
      return true;
    });
  }, [riders, searchQuery, statusFilter]);

  const handleApprove = async (rider) => {
    await approveRider(rider.id);
    addNotification({
      title: `Rider ${rider.name} approved! Account is now Active and ready for mobile app login.`,
      type: 'rider',
      iconColor: 'text-emerald-600 bg-emerald-50'
    });
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Riders</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Manage all registered delivery riders, self-registered applications & approvals</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Rider</span>
        </button>
      </div>

      {/* Pending Approval Notice Banner (if any self-registered riders) */}
      {pendingApprovalCount > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900">
                {pendingApprovalCount} New Rider Application{pendingApprovalCount > 1 ? 's' : ''} Pending Admin Approval
              </h4>
              <p className="text-[11px] text-amber-700 mt-0.5">
                Self-registered couriers cannot sign into their mobile app until you approve their profile.
              </p>
            </div>
          </div>
          <button
            onClick={() => setStatusFilter('PENDING')}
            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex-shrink-0"
          >
            View Applications
          </button>
        </div>
      )}

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl w-full md:w-auto overflow-x-auto">
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All ({riders.length})
          </button>

          <button
            onClick={() => setStatusFilter('ACTIVE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'ACTIVE' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Active ({riders.filter(r => r.accountStatus === 'Active').length})
          </button>

          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              statusFilter === 'PENDING' ? 'bg-white text-amber-700 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>Pending Approval</span>
            {pendingApprovalCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-500 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingApprovalCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setStatusFilter('SUSPENDED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              statusFilter === 'SUSPENDED' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Suspended ({riders.filter(r => r.accountStatus === 'Suspended').length})
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search riders by name, phone, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* Riders Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Rider</th>
                <th className="px-6 py-3.5">Contact Info</th>
                <th className="px-6 py-3.5">Vehicle</th>
                <th className="px-6 py-3.5">Duty Status</th>
                <th className="px-6 py-3.5">Account Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredRiders.map((rider) => {
                const isPending = rider.accountStatus === 'Pending Approval';
                const isActive = rider.accountStatus === 'Active';

                return (
                  <tr key={rider.id} className="hover:bg-slate-50/80 transition-colors">
                    {/* Name & Avatar */}
                    <td 
                      onClick={() => navigate(`/riders/${rider.id}`)}
                      className="px-6 py-4 cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={rider.avatar}
                            alt={rider.name}
                            className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-100"
                          />
                          <span className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full ring-2 ring-white ${rider.status === 'Online' ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        </div>
                        <div>
                          <span className="font-bold text-slate-900 block">{rider.name}</span>
                          <span className="text-[10px] text-slate-400">ID: {rider.id} • {rider.rating} ★</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact Info (Phone & Email) */}
                    <td className="px-6 py-4">
                      <p className="text-slate-800 font-mono font-semibold">{rider.phone}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[160px]">{rider.email}</p>
                    </td>

                    {/* Vehicle */}
                    <td className="px-6 py-4 text-slate-600">
                      <p className="font-semibold text-slate-800">{rider.vehicle}</p>
                      <p className="text-[10px] text-slate-400 font-mono">{rider.licensePlate || 'N/A'}</p>
                    </td>

                    {/* Duty Status (Online / Offline) */}
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => toggleRiderOnline(rider.id)}
                        title="Toggle Online/Offline duty state"
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                      >
                        <StatusBadge status={rider.status} />
                      </button>
                    </td>

                    {/* Account Status / Approval */}
                    <td className="px-6 py-4">
                      {isPending ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 border border-amber-200">
                            Pending Approval
                          </span>
                          <button
                            onClick={() => handleApprove(rider)}
                            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold shadow-sm flex items-center gap-1 transition-all"
                            title="Approve rider registration so they can log in"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Approve</span>
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {rider.accountStatus}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggleRiderActive(rider.id)}
                            title={isActive ? "Click to suspend account" : "Click to activate account"}
                            className={`relative inline-flex h-4 w-7 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              isActive ? 'bg-brand-600' : 'bg-slate-300'
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                isActive ? 'translate-x-3' : 'translate-x-0'
                              }`}
                            />
                          </button>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => navigate(`/riders/${rider.id}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="View Rider Profile & Deliveries"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedRiderForEdit(rider);
                            setIsEditModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors"
                          title="Edit Rider Information"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleRiderDeactivation(rider.id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isActive
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                              : 'text-emerald-500 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={isActive ? "Deactivate Rider (Suspend)" : "Activate Rider"}
                        >
                          <Power className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Remove rider ${rider.name}? Rider account will be removed while delivery history is preserved.`)) {
                              deleteRider(rider.id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Remove Rider (Preserves History)"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredRiders.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-slate-400 text-xs font-semibold">
                    No riders match the current filter or search criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {filteredRiders.length} of {riders.length} riders</span>
          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
              &lt;
            </button>
            <button className="px-3 py-1 rounded-lg bg-brand-600 text-white font-bold">
              1
            </button>
            <button className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white text-slate-400 cursor-not-allowed">
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Add Rider Modal */}
      <AddRiderModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit Rider Modal */}
      <EditRiderModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedRiderForEdit(null);
        }}
        rider={selectedRiderForEdit}
      />
    </div>
  );
};
