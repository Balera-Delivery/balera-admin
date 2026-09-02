import React, { useState } from 'react';
import { 
  Building2, 
  Settings as SettingsIcon, 
  Bell, 
  CreditCard, 
  Shield, 
  Check, 
  Upload,
  Lock,
  Mail,
  Phone,
  DollarSign
} from 'lucide-react';
import { BalerraLogo } from '../components/common/BalerraLogo';
import { useDelivery } from '../context/DeliveryContext';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { settings, updateSettings } = useDelivery();
  const { adminUser, updateProfile } = useAuth();
  
  const [activeTab, setActiveTab] = useState('General');
  const [formData, setFormData] = useState({ ...settings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Security password state
  const [passwordState, setPasswordState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const tabs = [
    { id: 'General', label: 'General', icon: SettingsIcon },
    { id: 'Company', label: 'Company', icon: Building2 },
    { id: 'Notifications', label: 'Notifications', icon: Bell },
    { id: 'Payment', label: 'Payment', icon: CreditCard },
    { id: 'Security', label: 'Security', icon: Shield },
  ];

  const handleSave = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handlePasswordChange = (e) => {
    e.preventDefault();
    if (passwordState.newPassword !== passwordState.confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    alert('Admin password updated successfully!');
    setPasswordState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-900">Settings</h2>
        <p className="text-xs font-medium text-slate-400 mt-0.5">
          Configure platform operations, branding, delivery rates, and security
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-px">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-brand-600 text-brand-600 bg-brand-50/50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-t-xl'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        {/* General / Company Tab */}
        {(activeTab === 'General' || activeTab === 'Company') && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Name</label>
                <input
                  type="text"
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Company Email</label>
                <input
                  type="email"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone Number</label>
                <input
                  type="text"
                  value={formData.companyPhone}
                  onChange={(e) => setFormData({ ...formData, companyPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Operational Region / City</label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Balerra Logo Branding Section */}
            <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/60">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center">
                  <img src="/logo.svg" alt="Balerra Logo" className="w-full h-full object-contain" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Balerra Delivery Brand Logo</h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">SVG or PNG format (recommended 400x400px)</p>
                  <p className="text-[10px] text-brand-600 font-semibold mt-1">
                    "From Bale. Delivered Smart. / Balee Irraa. Sirnaan Geessina."
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => alert('Logo upload dialog triggered.')}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold rounded-xl text-xs shadow-sm transition-colors inline-flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-brand-600" />
                <span>Change Logo</span>
              </button>
            </div>

            {/* Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              {savedSuccess && (
                <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Settings updated successfully!
                </span>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-brand-500/25 transition-all"
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Payment & Pricing Tab */}
        {activeTab === 'Payment' && (
          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Default Delivery Fee (ETB)</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">ETB</span>
                  <input
                    type="number"
                    value={formData.defaultDeliveryFee}
                    onChange={(e) => setFormData({ ...formData, defaultDeliveryFee: Number(e.target.value) })}
                    className="w-full pl-12 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-bold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">System Currency</label>
                <select
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-semibold text-slate-900"
                >
                  <option value="ETB - Ethiopian Birr">ETB - Ethiopian Birr</option>
                  <option value="USD - US Dollar">USD - US Dollar</option>
                </select>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-1">
              <p className="font-bold text-slate-800">Supported Payout Channels for Riders:</p>
              <p>• Telebirr (Ethio Telecom)</p>
              <p>• Commercial Bank of Ethiopia (CBE / CBE Birr)</p>
              <p>• Direct Bank Transfer</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-brand-500/25 transition-all"
              >
                Save Payment Settings
              </button>
            </div>
          </form>
        )}

        {/* Notifications Tab */}
        {activeTab === 'Notifications' && (
          <div className="space-y-6">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">System Notification Triggers</h3>
            <div className="space-y-4 text-xs">
              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 block">Push Notifications for New Delivery Requests</span>
                  <span className="text-slate-500">Alert admin instantly when a customer submits a request</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-600" />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 block">Rider Acceptance & Rejection Alerts</span>
                  <span className="text-slate-500">Notify admin immediately if a rider rejects so re-assignment can occur</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-600" />
              </label>

              <label className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer">
                <div>
                  <span className="font-bold text-slate-900 block">OTP Verification SMS Delivery</span>
                  <span className="text-slate-500">Send secure 4-digit OTP code to the recipient upon delivery pickup</span>
                </div>
                <input type="checkbox" defaultChecked className="w-4 h-4 accent-brand-600" />
              </label>
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'Security' && (
          <form onSubmit={handlePasswordChange} className="space-y-5 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Current Admin Password</label>
              <input
                type="password"
                required
                value={passwordState.currentPassword}
                onChange={(e) => setPasswordState({ ...passwordState, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">New Password</label>
              <input
                type="password"
                required
                value={passwordState.newPassword}
                onChange={(e) => setPasswordState({ ...passwordState, newPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Confirm New Password</label>
              <input
                type="password"
                required
                value={passwordState.confirmPassword}
                onChange={(e) => setPasswordState({ ...passwordState, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl text-xs shadow-sm shadow-brand-500/25 transition-all"
              >
                Update Password
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
