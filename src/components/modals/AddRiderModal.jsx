import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { useDelivery } from '../../context/DeliveryContext';
import { Eye, EyeOff, Lock, CheckCircle2, Copy, Check, ShieldCheck, KeyRound, AlertCircle, Mail, Phone, User } from 'lucide-react';

export const AddRiderModal = ({ isOpen, onClose }) => {
  const { addRider } = useDelivery();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    vehicle: 'TVS Motorcycle',
    licensePlate: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [createdRider, setCreatedRider] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleClose = () => {
    setCreatedRider(null);
    setCopied(false);
    setErrorMessage('');
    setIsSubmitting(false);
    setFormData({ name: '', phone: '', email: '', password: '', vehicle: 'TVS Motorcycle', licensePlate: '' });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.name.trim() || !formData.phone.trim() || !formData.email.trim() || !formData.vehicle) {
      setErrorMessage('Please fill in all required fields (Name, Phone, Email, Vehicle).');
      return;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email.trim())) {
      setErrorMessage('Please enter a valid email address (e.g. rider@balerra.com).');
      return;
    }

    const finalPassword = formData.password.trim() || 'RiderPass@123';
    const finalEmail = formData.email.trim().toLowerCase();
    const finalPhone = formData.phone.trim();

    setIsSubmitting(true);

    const payload = {
      name: formData.name.trim(),
      email: finalEmail,
      phone: finalPhone,
      password: finalPassword,
      vehicle: formData.vehicle,
      licensePlate: formData.licensePlate.trim() || 'AB-12345',
    };

    const res = await addRider(payload);
    setIsSubmitting(false);

    if (res?.success) {
      // Show credential confirmation card
      setCreatedRider({
        name: formData.name.trim(),
        phone: finalPhone,
        email: finalEmail,
        password: finalPassword,
        vehicle: formData.vehicle,
        licensePlate: formData.licensePlate.trim() || 'AB-12345'
      });
    } else {
      setErrorMessage(res?.message || 'Failed to create rider account on the backend. Please check server connection.');
    }
  };

  const handleCopyCredentials = () => {
    if (!createdRider) return;
    const text = `Balerra Delivery - Rider Account Details:\nName: ${createdRider.name}\nLogin Email: ${createdRider.email}\nLogin Phone: ${createdRider.phone}\nPassword: ${createdRider.password}\n\nPlease login using the Balerra Rider App on your phone.`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={createdRider ? "Rider Credentials Created" : "Add New Delivery Rider"}>
      {createdRider ? (
        <div className="space-y-5">
          <div className="flex items-center gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Rider Account Successfully Activated!</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                The account is auto-approved and ready. The rider can log into the Balerra Rider App immediately with these credentials.
              </p>
            </div>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3.5 text-xs">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-slate-500 font-medium">Rider Name:</span>
              <span className="font-bold text-slate-900">{createdRider.name}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-slate-500 font-medium">Login Email (Required on Phone App):</span>
              <span className="font-bold font-mono text-brand-600 text-sm">{createdRider.email}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
              <span className="text-slate-500 font-medium">Phone Number:</span>
              <span className="font-bold font-mono text-slate-900">{createdRider.phone}</span>
            </div>

            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-200">
              <div>
                <span className="text-slate-500 font-medium block text-[11px]">Temporary Password:</span>
                <span className="font-mono font-extrabold text-brand-600 text-sm">{createdRider.password}</span>
              </div>
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl text-xs font-bold transition-all"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
              </button>
            </div>

            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 text-[11px] text-blue-800 space-y-1">
              <p className="font-bold flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-brand-600" />
                <span>Rider App Login Instructions:</span>
              </p>
              <p>
                1. Open the Balerra Rider App on the phone.
              </p>
              <p>
                2. Enter email: <strong className="font-mono">{createdRider.email}</strong>
              </p>
              <p>
                3. Enter password: <strong className="font-mono">{createdRider.password}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/25 transition-all"
            >
              Done
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Rider Full Name *</label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Abdi Tesfaye"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Email Address (Rider Mobile App Login ID) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                required
                placeholder="e.g. abdi.rider@balerra.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1">
              The rider must type this exact email to log into the Balerra Rider App on their phone.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
            <div className="relative">
              <Phone className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. +251911223344"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-slate-700">Set Rider Password *</label>
              <button
                type="button"
                onClick={() => setFormData({ ...formData, password: 'RiderPass@' + Math.floor(100 + Math.random() * 900) })}
                className="text-[10px] font-bold text-brand-600 hover:text-brand-700"
              >
                Auto-Generate
              </button>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Enter password (e.g. RiderPass@123)"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Vehicle Type *</label>
              <select
                value={formData.vehicle}
                onChange={(e) => setFormData({ ...formData, vehicle: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none"
              >
                <option value="TVS Motorcycle">TVS Motorcycle</option>
                <option value="Bajaj Boxer">Bajaj Boxer</option>
                <option value="Honda Ace 125">Honda Ace 125</option>
                <option value="Bicycle">Bicycle</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">License Plate</label>
              <input
                type="text"
                placeholder="e.g. AA-12345"
                value={formData.licensePlate}
                onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none uppercase font-mono"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm shadow-brand-500/30 transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Registering on Backend...</span>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Create Rider Account</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};
