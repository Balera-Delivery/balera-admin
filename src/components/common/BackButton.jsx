import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowLeft, ChevronRight } from 'lucide-react';

/**
 * Back button + breadcrumb shown at the top of every detail page.
 * Goes back to the previous screen; if the page was opened directly (no history),
 * it goes to `fallback` (the list page) instead.
 */
export const BackButton = ({ fallback, parentLabel, currentLabel }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    // React Router marks the first page of a visit with key "default"
    if (location.key !== 'default' && window.history.length > 1) navigate(-1);
    else navigate(fallback);
  };

  return (
    <div className="flex items-center gap-3 flex-wrap">
      <button
        type="button"
        onClick={goBack}
        className="inline-flex items-center gap-1.5 h-9 pl-2.5 pr-3.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-brand-600 hover:border-brand-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back</span>
      </button>

      {parentLabel && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-slate-400 font-semibold min-w-0">
          <Link to={fallback} className="hover:text-brand-600 transition-colors">{parentLabel}</Link>
          {currentLabel && (
            <>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              <span className="text-slate-700 truncate">{currentLabel}</span>
            </>
          )}
        </nav>
      )}
    </div>
  );
};
