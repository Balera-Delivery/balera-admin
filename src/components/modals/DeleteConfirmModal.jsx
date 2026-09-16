import React from 'react';
import { Modal } from '../common/Modal';
import { AlertTriangle, Trash2 } from 'lucide-react';

export const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, title, message, itemName }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title || 'Confirm Deletion'} maxWidth="max-w-md">
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-800">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-rose-900">Are you sure you want to delete this?</p>
            <p className="mt-1 text-rose-700">
              {message || `This action will permanently remove ${itemName || 'this item'} from the system.`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm shadow-rose-500/25 transition-all flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Delete Permanently</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};
