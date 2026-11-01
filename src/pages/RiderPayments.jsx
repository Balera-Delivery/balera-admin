import React, { useState, useMemo } from 'react';
import { Plus, Calendar, CheckCircle, CreditCard, Download, FileText, CheckCircle2, DollarSign, Wallet } from 'lucide-react';
import { StatusBadge } from '../components/common/StatusBadge';
import { AddPaymentModal } from '../components/modals/AddPaymentModal';
import { MarkRiderPaidModal } from '../components/modals/MarkRiderPaidModal';
import { useDelivery } from '../context/DeliveryContext';

export const RiderPayments = () => {
  const { riders, payments, deliveries, markPaymentPaid } = useDelivery();
  const [selectedMonth, setSelectedMonth] = useState('Current Period');
  const [activeTab, setActiveTab] = useState('balances'); // 'balances' | 'history'
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [settleModalRider, setSettleModalRider] = useState(null);

  // Compute live earnings and payouts per rider
  const riderPayoutData = useMemo(() => {
    return riders.map(rider => {
      // Completed deliveries for this rider
      const riderDeliveries = deliveries.filter(
        d => (d.riderId === rider.id || d.riderName === rider.name) &&
             (d.status === 'Completed' || d.status === 'Delivered')
      );
      const completedCount = riderDeliveries.length || rider.completedDeliveries || 0;

      // Rate per delivery (e.g. 50 ETB default or sum of rider delivery fee)
      const earned = completedCount * 50;

      // Sum of payments already disbursed
      const paid = payments
        .filter(p => (p.riderId === rider.id || p.riderName === rider.name) && p.status === 'Paid')
        .reduce((sum, p) => sum + (p.amountNum || 0), 0);

      const balanceOwed = Math.max(0, earned - paid);

      return {
        ...rider,
        completedDeliveriesCount: completedCount,
        totalEarned: earned,
        totalPaid: paid,
        balanceOwed,
      };
    });
  }, [riders, deliveries, payments]);

  const totalEarnedAll = riderPayoutData.reduce((sum, r) => sum + r.totalEarned, 0);
  const totalPaidAll = payments.filter(p => p.status === 'Paid').reduce((acc, p) => acc + (p.amountNum || 0), 0);
  const totalPendingOwed = riderPayoutData.reduce((sum, r) => sum + r.balanceOwed, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Rider Payments & Settlement</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">
            Track courier delivery earnings, manage payout settlements, and balance disbursements
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Add Manual Payment Button */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-bold shadow-sm shadow-brand-500/25 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Record Custom Payment</span>
          </button>
        </div>
      </div>

      {/* Payout Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Rider Earnings</span>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">
              ETB {totalEarnedAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-slate-500 mt-0.5 block">From completed deliveries</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Disbursed (Paid)</span>
            <p className="text-2xl font-extrabold text-emerald-600 mt-1">
              ETB {totalPaidAll.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-emerald-700 mt-0.5 block">Successfully transferred</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Balance Owed (Pending)</span>
            <p className="text-2xl font-extrabold text-amber-600 mt-1">
              ETB {totalPendingOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[11px] text-amber-700 mt-0.5 block">Awaiting admin payout</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('balances')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'balances'
              ? 'border-brand-600 text-brand-600 bg-brand-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Rider Earnings & Balance Owed ({riderPayoutData.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'history'
              ? 'border-brand-600 text-brand-600 bg-brand-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Settlement Transaction Ledger ({payments.length})</span>
        </button>
      </div>

      {/* TAB 1: RIDER BALANCE & SETTLEMENT TABLE */}
      {activeTab === 'balances' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Rider</th>
                  <th className="px-6 py-3.5">Completed Trips</th>
                  <th className="px-6 py-3.5">Total Earned</th>
                  <th className="px-6 py-3.5">Amount Paid</th>
                  <th className="px-6 py-3.5">Balance Owed</th>
                  <th className="px-6 py-3.5 text-right">Settlement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {riderPayoutData.map((rider) => (
                  <tr key={rider.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={rider.avatar}
                          alt={rider.name}
                          className="w-8 h-8 rounded-full object-cover"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{rider.name}</span>
                          <span className="text-[11px] text-slate-400 font-mono">{rider.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900">
                      {rider.completedDeliveriesCount} trips
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 font-mono">
                      ETB {rider.totalEarned.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 font-bold text-emerald-600 font-mono">
                      ETB {rider.totalPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold font-mono ${
                        rider.balanceOwed > 0
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}>
                        ETB {rider.balanceOwed.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {rider.balanceOwed > 0 ? (
                        <button
                          onClick={() => setSettleModalRider(rider)}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center gap-1.5 shadow-sm shadow-emerald-500/20"
                        >
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Mark as Paid</span>
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-slate-400 inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Settled</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SETTLEMENT TRANSACTION LEDGER */}
      {activeTab === 'history' && (
        <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/75 text-slate-400 font-semibold uppercase tracking-wider text-[11px] border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Reference ID</th>
                  <th className="px-6 py-3.5">Rider</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Period / Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-brand-600">
                      {payment.referenceNumber || payment.id}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-slate-900 block">{payment.riderName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{payment.riderPhone}</span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">
                      {payment.paymentMethod || 'Telebirr'}
                    </td>
                    <td className="px-6 py-4 font-extrabold text-slate-900 font-mono">
                      {payment.amount}
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {payment.period || new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
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
                            onClick={() => alert(`Payment Slip for ${payment.riderName}\nAmount: ${payment.amount}\nMethod: ${payment.paymentMethod || 'Telebirr'}\nReference: ${payment.referenceNumber || payment.id}\nStatus: Settled`)}
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
        </div>
      )}

      {/* Add Custom Payment Modal */}
      <AddPaymentModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Settle / Mark as Paid Modal */}
      <MarkRiderPaidModal
        isOpen={!!settleModalRider}
        onClose={() => setSettleModalRider(null)}
        rider={settleModalRider}
        balanceOwed={settleModalRider?.balanceOwed || 0}
        completedDeliveries={settleModalRider?.completedDeliveriesCount || 0}
      />
    </div>
  );
};
