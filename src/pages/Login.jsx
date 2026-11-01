import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Lock, Mail, ShieldCheck, MapPin, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login = () => {
  const [email, setEmail] = useState('admin@balera.com');
  const [password, setPassword] = useState('AdminPassword@123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await login(email, password, rememberMe);
      if (res.success) {
        navigate('/');
      } else {
        setError(res.message || 'Login failed. Please check your credentials.');
      }
    } catch (err) {
      setError(err.message || 'Unable to communicate with the server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-[#F8FAFC]">
      {/* Left: Brand & Illustration Showcase */}
      <div className="w-full md:w-1/2 bg-gradient-to-br from-brand-50 via-white to-blue-100 flex flex-col items-center justify-between p-8 md:p-12 border-r border-slate-200/80 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-brand-200/30 blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-blue-300/20 blur-3xl pointer-events-none"></div>

        {/* Top Logo */}
        <div className="w-full max-w-md flex flex-col items-center text-center z-10 pt-4">
          <div className="w-40 h-40 relative drop-shadow-md mb-4 animate-in fade-in zoom-in duration-500">
            <img src="/logo.svg" alt="Balerra Delivery" className="w-full h-full object-contain" />
          </div>
          
          <h2 className="text-xl font-extrabold text-[#0B3C95] tracking-wide italic">
            BALERA DELIVERY
          </h2>
          
          <div className="mt-2 space-y-1">
            <p className="text-xs font-bold text-brand-700 tracking-wider">
              From Bale. Delivered Smart.
            </p>
            <p className="text-xs font-bold text-brand-800 tracking-wider">
              Balee Irraa. Sirnaan Geessina.
            </p>
          </div>
        </div>

        {/* Central Illustration: Courier on Scooter */}
        <div className="my-8 z-10 w-full max-w-sm flex flex-col items-center justify-center">
          <div className="relative bg-white/80 backdrop-blur-sm p-6 rounded-3xl border border-white shadow-xl shadow-brand-500/10 flex flex-col items-center">
            <div className="relative w-48 h-32 flex items-center justify-center">
              <div className="absolute -top-2 right-6 flex items-center gap-1 bg-brand-600 text-white px-2.5 py-1 rounded-full text-[10px] font-bold shadow-md animate-bounce">
                <MapPin className="w-3 h-3" />
                <span>Fast & Reliable</span>
              </div>
              
              <svg viewBox="0 0 200 120" className="w-full h-full text-brand-600">
                <path d="M10,95 L10,60 L25,60 L25,45 L40,45 L40,95 M50,95 L50,40 L70,40 L70,95 M80,95 L80,50 L95,50 L95,95 M160,95 L160,55 L175,55 L175,95 M180,95 L180,65 L195,65 L195,95" stroke="#CBD5E1" strokeWidth="1.5" fill="none" opacity="0.6"/>
                <line x1="0" y1="95" x2="200" y2="95" stroke="#94A3B8" strokeWidth="2"/>

                <circle cx="45" cy="95" r="16" fill="#1E293B" />
                <circle cx="45" cy="95" r="8" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />
                <circle cx="145" cy="95" r="16" fill="#1E293B" />
                <circle cx="145" cy="95" r="8" fill="#F8FAFC" stroke="#64748B" strokeWidth="2" />

                <path d="M45,95 L75,95 L95,75 L135,75 L145,95" fill="none" stroke="#1B59F8" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M95,75 L125,45 L135,45" fill="none" stroke="#1B59F8" strokeWidth="4" strokeLinecap="round"/>
                <circle cx="95" cy="30" r="9" fill="#0284C7" />
                <path d="M85,42 Q95,40 105,48 L115,65 L95,68 Z" fill="#0369A1" />
                <rect x="52" y="50" width="26" height="24" rx="3" fill="#1E40AF" stroke="#FFFFFF" strokeWidth="1.5"/>
                <text x="65" y="65" fill="#FFFFFF" fontSize="8" fontWeight="bold" textAnchor="middle">BD</text>
              </svg>
            </div>
            <p className="mt-2 text-xs font-semibold text-slate-600 text-center">
              Complete Dispatch & Real-Time Fleet Control
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="text-center text-[11px] text-slate-400 font-medium z-10">
          <p>© {new Date().getFullYear()} Balera Delivery. All rights reserved.</p>
        </div>
      </div>

      {/* Right: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md bg-white p-8 md:p-10 rounded-2xl border border-slate-200/80 shadow-lg shadow-slate-200/50">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome Back!</h2>
            <p className="text-sm font-medium text-slate-500 mt-1">
              Sign in to your admin account to manage operations.
            </p>
          </div>

          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@balera.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400"
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

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded text-brand-600 accent-brand-600 border-slate-300"
                />
                <span className="font-semibold text-slate-600">Remember Me</span>
              </label>

              <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Please contact system administrator to reset password.'); }} className="font-bold text-brand-600 hover:text-brand-700">
                Forgot Password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm shadow-md shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isLoading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              API Server: <span className="font-mono text-slate-600">http://localhost:5000/api/v1</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
