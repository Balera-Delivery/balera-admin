import React, { useState } from 'react';
import { Plus, Calendar, CheckCircle, CreditCard, Download, FileText } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { AddPaymentModal } from '../components/modals/AddPaymentModal';
import { useDelivery } from '../context/DeliveryContext';

export const RiderPayments = () => {
  const { payments, markPaymentPaid } = useDelivery();
  const [selectedMonth, setSelectedMonth] = useState('May 2024');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const months = ['May 2024', 'April 2024', 'March 2024', 'February 2024'];

  const totalPaid = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + (p.amountNum || 0), 0);
  const totalPending = payments.filter(p => p.status === 'Pending').reduce((acc, p) => acc + (p.amountNum || 0), 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Rider Payments</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">Manage rider monthly compensation and delivery payouts</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Month Selector */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-brand-600" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="bg-transparent outline-none cursor-pointer text-slate-800 font-bold"
            >
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Add Payment Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Payment</span>
          </button>
        </div>
      </div>

      {/* Payout Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-400">Total Month Payout</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            ETB {(totalPaid + totalPending).toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-emerald-600">Disbursed (Paid)</span>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            ETB {totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-amber-600">Pending Approval</span>
          <p className="text-2xl font-extrabold text-amber-600 mt-1">
            ETB {totalPending.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Rider</th>
                <th className="px-6 py-3.5">Total Deliveries</th>
                <th className="px-6 py-3.5">Amount (ETB)</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {payments.map((payment) => (
                <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <span className="font-bold text-slate-900 block">{payment.riderName}</span>
                    <span className="text-[11px] text-slate-400 font-mono">{payment.riderPhone}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">{payment.totalDeliveries}</td>
                  <td className="px-6 py-4 font-extrabold text-slate-900 font-mono">
                    {payment.amount}
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={payment.status} />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {payment.status === 'Pending' ? (
                        <button
                          onClick={() => markPaymentPaid(payment.id)}
                          className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark Paid</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => alert(`Payment Slip for ${payment.riderName}\nAmount: ETB ${payment.amount}\nPeriod: ${payment.period}\nMethod: ${payment.paymentMethod}`)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                          title="View Payout Slip"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Showing 1 to {payments.length} of {payments.length} payments</span>
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

      {/* Add Payment Modal */}
      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
};
