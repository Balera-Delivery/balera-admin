import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({ title, value, change, isPositive = true, subtitle = '', icon: Icon, color = 'blue' }) => {
  return (
    <div className="bg-white border border-slate-200/80 rounded-xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow min-w-0">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs sm:text-sm font-medium text-slate-500 leading-snug">{title}</p>
        {Icon && (
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
            <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        )}
      </div>
      <div className="mt-3 flex items-baseline gap-2 flex-wrap">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">{value}</h3>
        {change && change !== '0' && (
          <span className={`inline-flex items-center text-xs font-semibold ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {change}
          </span>
        )}
      </div>
      {subtitle && (
        <p className="mt-1 text-[11px] sm:text-xs text-slate-400 font-medium leading-snug">{subtitle}</p>
      )}
    </div>
  );
};
