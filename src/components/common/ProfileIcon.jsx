import React from 'react';
import { User } from 'lucide-react';

/**
 * Simple human icon used for riders and customers instead of a photo.
 * `className` sets the size and shape (e.g. "w-9 h-9 rounded-full").
 */
export const ProfileIcon = ({ className = 'w-9 h-9 rounded-full', label }) => (
  <div
    role="img"
    aria-label={label || 'Profile'}
    className={`flex items-center justify-center bg-brand-50 text-brand-600 ring-2 ring-slate-100 flex-shrink-0 ${className}`}
  >
    <User className="w-1/2 h-1/2" strokeWidth={2.2} />
  </div>
);
