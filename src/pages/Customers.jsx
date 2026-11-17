import React, { useState, useMemo } from 'react';
import { ProfileIcon } from '../components/common/ProfileIcon';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Trash2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { AddCustomerModal } from '../components/modals/AddCustomerModal';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';
import { useDelivery } from '../context/DeliveryContext';

export const Customers = () => {
  const { customers, deleteCustomer, toggleCustomerStatus } = useDelivery();
  const [searchQuery, setSearchQuery] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [notice, setNotice] = useState(null); // { type: 'success' | 'error', text }

  const showNotice = (type, text) => {
    setNotice({ type, text });
    setTimeout(() => setNotice(null), 4000);
  };

  const handleToggleStatus = async (customer) => {
    const res = await toggleCustomerStatus(customer.id);
    if (res?.success) showNotice('success', `${customer.name} is now ${res.status}.`);
    else showNotice('error', res?.message || 'Could not change the status.');
  };
  const navigate = useNavigate();

  const filteredCustomers = useMemo(() => {
    return customers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [customers, searchQuery]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Customers</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Manage all registered customer accounts</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/25 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 shadow-sm flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="text-xs font-semibold text-slate-400">
          Showing <span className="text-slate-700">{filteredCustomers.length}</span> customers
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="hidden md:table-cell px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Name</th>
                <th className="px-6 py-3.5">Phone</th>
                <th className="px-6 py-3.5">Total Deliveries</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.map((customer) => (
                <tr
                  key={customer.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td 
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="hidden md:table-cell px-6 py-4 font-bold text-brand-600 cursor-pointer"
                  >
                    {customer.id}
                  </td>
                  <td 
                    onClick={() => navigate(`/customers/${customer.id}`)}
                    className="px-6 py-4 cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <ProfileIcon className="w-8 h-8 rounded-full" label={customer.name} />
                      <span className="font-bold text-slate-900">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono">{customer.phone}</td>
                  <td className="px-6 py-4 font-bold text-slate-900">{customer.totalDeliveries}</td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggleStatus(customer)} title={customer.status === 'Active' ? 'Click to suspend this customer' : 'Click to activate this customer'}>
                      <StatusBadge status={customer.status} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => navigate(`/customers/${customer.id}`)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                        title="View Customer Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setCustomerToDelete(customer)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Customer"
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

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing {filteredCustomers.length} of {customers.length} customers</span>
        </div>
      </div>

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Delete customer confirmation */}
      <DeleteConfirmModal
        isOpen={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        onConfirm={async () => {
          const name = customerToDelete?.name;
          const res = await deleteCustomer(customerToDelete.id);
          if (res?.success) showNotice('success', `${name}'s account was deleted.`);
          else showNotice('error', res?.message || 'Could not delete the customer.');
        }}
        title="Delete customer"
        itemName={customerToDelete?.name}
        message="Their personal details are removed and they can no longer sign in. Past orders stay in the records without their name."
        confirmLabel="Delete customer"
      />
      {notice && (
        <div
          role="status"
          className={`fixed bottom-6 right-6 left-6 sm:left-auto z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 ${
            notice.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
          }`}
        >
          {notice.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
          <span>{notice.text}</span>
        </div>
      )}
    </div>
  );
};
