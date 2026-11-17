import React, { useState } from 'react';
import { 
  Bell, 
  CheckCheck, 
  PackagePlus, 
  CheckCircle2, 
  CreditCard, 
  Bike, 
  XCircle, 
  AlertTriangle,
  Send,
  Plus,
  Trash2
} from 'lucide-react';
import { useNotifications } from '../context/NotificationContext';
import { DeleteConfirmModal } from '../components/modals/DeleteConfirmModal';

export const Notifications = () => {
  const { notifications, unreadCount, markAllAsRead, markAsRead, deleteNotification, clearAllNotifications, sendBroadcast } = useNotifications();
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [targetAudience, setTargetAudience] = useState('ALL');
  const [broadcastResult, setBroadcastResult] = useState(null); // { type, text }
  const [isSending, setIsSending] = useState(false);

  const getIcon = (type) => {
    switch (type) {
      case 'request':
        return <PackagePlus className="w-4 h-4 text-brand-600" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-indigo-600" />;
      case 'rider':
        return <Bike className="w-4 h-4 text-sky-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      case 'system':
      default:
        return <AlertTriangle className="w-4 h-4 text-amber-600" />;
    }
  };

  const audienceLabel = { ALL: 'all customers and riders', CUSTOMER: 'all customers', RIDER: 'all riders' };

  const handleSendBroadcast = async (e) => {
    e.preventDefault();
    const text = broadcastMessage.trim();
    if (!text) return;
    setIsSending(true);
    setBroadcastResult(null);
    const res = await sendBroadcast({ targetRole: targetAudience, title: 'Balera Delivery', message: text });
    setIsSending(false);
    if (res?.success) {
      setBroadcastMessage('');
      setBroadcastResult({ type: 'success', text: `Sent to ${audienceLabel[targetAudience]}.` });
    } else {
      setBroadcastResult({ type: 'error', text: res?.message || 'Could not send the message.' });
    }
    setTimeout(() => setBroadcastResult(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header & Mark All as Read */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Notifications</h2>
          <p className="text-xs font-medium text-slate-400 mt-0.5">System notifications and dispatch activity logs</p>
        </div>

        <div className="flex items-center gap-2.5">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-brand-600 rounded-xl text-xs font-bold shadow-sm transition-all"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark all read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              onClick={() => setConfirmClearAll(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-bold shadow-sm transition-all"
              title="Delete all notifications"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear all</span>
            </button>
          )}
        </div>
      </div>

      {/* Broadcast announcement */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Send System Notification
        </h3>
        <form onSubmit={handleSendBroadcast} className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={targetAudience}
            onChange={(e) => setTargetAudience(e.target.value)}
            className="w-full sm:w-44 px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            <option value="ALL">All customers and riders</option>
            <option value="CUSTOMER">All customers</option>
            <option value="RIDER">All riders</option>
          </select>

          <input
            type="text"
            placeholder="Type notification message to broadcast..."
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            className="flex-1 w-full px-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />

          <button
            type="submit"
            disabled={isSending || !broadcastMessage.trim()}
            className="w-full sm:w-auto px-4 py-2 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm shadow-brand-500/25"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSending ? 'Sending…' : 'Send'}</span>
          </button>
        </form>
        {broadcastResult && (
          <p
            role="status"
            className={`mt-3 text-xs font-bold ${broadcastResult.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}
          >
            {broadcastResult.text}
          </p>
        )}
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200/80 rounded-2xl shadow-sm overflow-hidden divide-y divide-slate-100">
        {notifications.map((notif) => (
          <div
            key={notif.id}
            onClick={() => markAsRead(notif.id)}
            className={`p-5 flex items-start justify-between gap-4 transition-colors cursor-pointer hover:bg-slate-50/80 ${
              !notif.isRead ? 'bg-blue-50/30' : ''
            }`}
          >
            <div className="flex items-start gap-3.5">
              <div className={`p-2 rounded-xl mt-0.5 flex-shrink-0 ${notif.iconColor || 'bg-slate-100 text-slate-600'}`}>
                {getIcon(notif.type)}
              </div>

              <div>
                <p className={`text-xs ${!notif.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                  {notif.title}
                </p>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                  <span>{notif.time}</span>
                  <span>•</span>
                  <span>{notif.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              {!notif.isRead && (
                <span className="w-2 h-2 rounded-full bg-brand-600"></span>
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteNotification(notif.id);
                }}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Delete notification"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}

        {notifications.length === 0 && (
          <div className="p-12 text-center text-slate-400 text-xs">
            No notifications at this time.
          </div>
        )}
      </div>

      {/* Clear all confirmation */}
      <DeleteConfirmModal
        isOpen={confirmClearAll}
        onClose={() => setConfirmClearAll(false)}
        onConfirm={() => clearAllNotifications()}
        title="Clear all notifications"
        itemName={`all ${notifications.length} notifications`}
        message="Every notification in this list will be deleted."
        confirmLabel="Clear all"
      />
    </div>
  );
};
