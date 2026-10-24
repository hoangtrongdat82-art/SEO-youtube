import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Đồng ý',
  cancelText = 'Hủy bỏ',
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xl animate-backdrop-in">
      {/* Radiant ambient spotlight shining behind the confirm modal */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(59,130,246,0.32)_0%,_rgba(14,165,233,0.18)_30%,_rgba(15,23,42,0.65)_75%)] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[480px] bg-gradient-to-tr from-blue-500/30 via-cyan-400/25 to-indigo-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-slow" />

      {/* Modal Container with glowing focus halo */}
      <div className="relative w-full max-w-md animate-modal-pop">
        {/* Soft glowing backlight halo directly behind the card */}
        <div className="absolute -inset-1.5 bg-gradient-to-r from-blue-500/40 via-cyan-400/35 to-indigo-500/40 rounded-[28px] blur-xl opacity-90 pointer-events-none" />

        <div className="relative w-full bg-slate-900/95 border border-cyan-400/40 ring-1 ring-white/10 rounded-3xl p-6 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85),0_0_50px_-10px_rgba(56,189,248,0.4)] text-left overflow-hidden">
          {/* Subtle top edge specular highlight */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-300 to-indigo-500" />

          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">{title}</h3>
              <p className="text-xs text-slate-400 mt-0.5">Xác nhận thao tác của bạn</p>
            </div>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed mb-6">{message}</p>

          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer border border-slate-700/60"
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 transition shadow-lg shadow-blue-600/30 cursor-pointer active:scale-95"
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
