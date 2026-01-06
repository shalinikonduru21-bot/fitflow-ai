
import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ConfirmModalProps {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  onConfirm: () => void;
  onCancel: () => void;
  isOpen: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ title, message, confirmText, cancelText, onConfirm, onCancel, isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="w-full max-w-sm glass rounded-[2.5rem] border-white/10 p-8 shadow-2xl animate-in zoom-in duration-300">
        <div className="flex justify-between items-start mb-6">
          <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center text-red-500">
            <AlertCircle className="w-6 h-6" />
          </div>
          <button onClick={onCancel} className="p-2 text-slate-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <h3 className="text-2xl font-black mb-2 text-white leading-tight">{title}</h3>
        <p className="text-slate-400 text-sm font-medium leading-relaxed mb-8">{message}</p>
        
        <div className="flex flex-col gap-3">
          <button 
            onClick={onConfirm}
            className="w-full py-4 bg-red-500 text-white font-black rounded-2xl hover:bg-red-400 transition-all shadow-lg shadow-red-500/20"
          >
            {confirmText.toUpperCase()}
          </button>
          <button 
            onClick={onCancel}
            className="w-full py-4 bg-white/5 text-slate-400 font-black rounded-2xl border border-white/5 hover:bg-white/10 transition-all"
          >
            {cancelText.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
