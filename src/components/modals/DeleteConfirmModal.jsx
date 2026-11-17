import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { AlertTriangle, Trash2, Loader2 } from 'lucide-react';

/**
 * In-app confirmation box used before deleting anything (instead of the browser pop-up).
 * `onConfirm` may be async; the box shows a spinner and closes when it finishes.
 */
export const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  itemName,
  confirmLabel = 'Delete',
}) => {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    setBusy(true);
    try {
      await onConfirm?.();
    } finally {
      setBusy(false);
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={busy ? () => {} : onClose} title={title || 'Confirm deletion'} maxWidth="max-w-md">
      <div className="space-y-5">
        <div className="flex flex-col items-center text-center gap-3 pt-1">
          <div className="w-14 h-14 rounded-full bg-rose-50 ring-8 ring-rose-50/50 flex items-center justify-center">
            <AlertTriangle className="w-7 h-7 text-rose-600" />
          </div>
          <div className="space-y-1.5">
            <p className="text-sm font-bold text-slate-900">
              {itemName ? <>Delete <span className="text-rose-700">{itemName}</span>?</> : 'Are you sure?'}
            </p>
            <p className="text-xs text-slate-500 leading-relaxed">
              {message || 'This action cannot be undone.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            className="py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={busy}
            autoFocus
            className="py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-500/25 transition-all flex items-center justify-center gap-1.5 disabled:opacity-70"
          >
            {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
