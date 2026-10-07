import React from 'react';
import { LogOut, X } from 'lucide-react';

export function LogoutModal({
  isOpen,
  onClose,
  onConfirm,
  userName = 'User'
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-[#111726] border border-white/10 rounded-2xl p-6 shadow-2xl relative text-center">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Warning Icon Halo */}
        <div className="w-14 h-14 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-rose-500/20 animate-pulse">
          <LogOut className="w-7 h-7" />
        </div>

        <h3 className="text-lg font-extrabold text-white font-outfit mb-1.5">
          Log Out of EquiShare?
        </h3>

        <p className="text-xs text-slate-300 leading-relaxed mb-6">
          Are you sure you want to log out, <strong className="text-white font-bold">{userName}</strong>? You will be returned to the main landing page and will need to sign in again to access your shared group ledgers.
        </p>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white font-bold text-xs transition-all active:scale-95"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-500/25 transition-all active:scale-95 flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Yes, Log Out</span>
          </button>
        </div>
      </div>
    </div>
  );
}
