import React, { useState } from 'react';
import { 
  Palette, 
  Smartphone, 
  Download, 
  RotateCcw, 
  CheckCircle2,
  Moon,
  Sun,
  CloudMoon,
  Check,
  User,
  UserPlus,
  ArrowLeftRight,
  LogOut
} from 'lucide-react';
import { 
  GPayLogo, 
  PhonePeLogo, 
  PaytmLogo, 
  SuperMoneyLogo, 
  BhimUpiLogo, 
  AppLogo 
} from '../components/PaymentLogos';

export function SettingsPage({
  theme = 'dark',
  onThemeChange,
  defaultPaymentApp = 'gpay',
  onDefaultPaymentAppChange,
  onExportData,
  onResetData,
  currentUser,
  onOpenAuth,
  onLogout
}) {
  const [savedSuccess, setSavedSuccess] = useState(false);

  const themes = [
    {
      id: 'dark',
      name: 'Dark Mode',
      subtitle: 'Midnight Obsidian',
      desc: 'Deep pitch dark background with high-contrast emerald glow and neon accents',
      previewBg: 'bg-[#070A12]',
      previewCard: 'bg-[#0E1424]',
      textColor: 'text-white',
      accentColor: '#10B981',
      border: 'border-emerald-500/50',
      Icon: Moon
    },
    {
      id: 'dim',
      name: 'Dim Mode',
      subtitle: 'Charcoal Slate',
      desc: 'Comfortable dark navy-slate theme engineered for reduced eye strain during night',
      previewBg: 'bg-[#0F172A]',
      previewCard: 'bg-[#1E293B]',
      textColor: 'text-slate-100',
      accentColor: '#38BDF8',
      border: 'border-sky-500/50',
      Icon: CloudMoon
    },
    {
      id: 'light',
      name: 'Light Mode',
      subtitle: 'Porcelain Minimal',
      desc: 'Pristine bright white canvas with rich dark slate typography and clean shadows',
      previewBg: 'bg-[#F8FAFC]',
      previewCard: 'bg-[#FFFFFF]',
      textColor: 'text-slate-900',
      accentColor: '#059669',
      border: 'border-emerald-600',
      Icon: Sun
    }
  ];

  const paymentApps = [
    { id: 'gpay', name: 'Google Pay', subtitle: 'GPay UPI', Logo: GPayLogo },
    { id: 'phonepe', name: 'PhonePe', subtitle: 'UPI / Wallet', Logo: PhonePeLogo },
    { id: 'paytm', name: 'Paytm', subtitle: 'Fast UPI', Logo: PaytmLogo },
    { id: 'supermoney', name: 'super.money', subtitle: 'Rewards UPI', Logo: SuperMoneyLogo },
    { id: 'bhim_upi', name: 'BHIM UPI', subtitle: 'National UPI', Logo: BhimUpiLogo },
  ];

  const handleSelectTheme = (themeId) => {
    if (onThemeChange) {
      onThemeChange(themeId);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleSelectPayment = (paymentId) => {
    if (onDefaultPaymentAppChange) {
      onDefaultPaymentAppChange(paymentId);
    }
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-4xl pb-12 animate-in fade-in duration-200">
      {/* 1. Header Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <AppLogo className="w-12 h-12" />
          <div>
            <h2 className="text-xl font-extrabold text-white font-outfit tracking-tight">
              Application Settings
            </h2>
            <p className="text-xs text-slate-400">
              Customize ambient display themes (Dark, Dim, Light), default UPI apps, and ledger data
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>Theme & Preferences Updated!</span>
          </div>
        )}
      </div>

      {/* 2. User Account & Identity Hub */}
      {currentUser && (
        <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500/50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">{currentUser.name}</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Signed In
                </span>
              </div>
              <span className="text-xs text-slate-400 block">{currentUser.email}</span>
              {currentUser.upiId && (
                <span className="text-[11px] text-emerald-400 font-mono font-semibold block mt-0.5">
                  Payout UPI: {currentUser.upiId}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => onOpenAuth && onOpenAuth('profile')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            >
              <User className="w-3.5 h-3.5 text-emerald-400" />
              <span>Edit Profile & UPI</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth && onOpenAuth('switch')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-sky-400" />
              <span>Switch User</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth && onOpenAuth('signup')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-xs font-semibold text-emerald-300 transition-all active:scale-95"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>New Account</span>
            </button>

            {onLogout && (
              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-all active:scale-95"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* 3. Ambient Theme Selector (Dark, Dim, Light) */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white font-outfit flex items-center gap-2">
              <Palette className="w-4 h-4 text-emerald-400" /> Ambient Display Theme
            </h3>
            <p className="text-xs text-slate-400">Switch between Dark, Dim, and Light visual modes</p>
          </div>
          <span className="text-xs font-mono font-bold text-emerald-400 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 capitalize">
            Current: {theme} Mode
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {themes.map((t) => {
            const isSelected = theme === t.id;
            const ThemeIcon = t.Icon;

            return (
              <button
                key={t.id}
                type="button"
                onClick={() => handleSelectTheme(t.id)}
                className={`p-5 rounded-2xl border-2 text-left cursor-pointer transition-all duration-200 flex flex-col justify-between relative overflow-hidden ${
                  isSelected
                    ? `${t.previewBg} ${t.border} shadow-2xl ring-2 ring-emerald-500/40 scale-[1.02]`
                    : `${t.previewBg} border-white/10 opacity-75 hover:opacity-100 hover:border-white/30 hover:scale-[1.01]`
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-xl bg-white/10 flex items-center justify-center">
                        <ThemeIcon className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div>
                        <span className="font-outfit font-extrabold text-sm text-white block">{t.name}</span>
                        <span className="text-[10px] text-slate-400 block">{t.subtitle}</span>
                      </div>
                    </div>

                    <div className={`w-5 h-5 rounded-full flex items-center justify-center transition-all ${
                      isSelected ? 'bg-emerald-500 text-slate-950 font-bold' : 'border border-white/20'
                    }`}>
                      {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-4">{t.desc}</p>
                </div>

                {/* Theme Palette Swatches */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full shadow-sm" style={{ backgroundColor: t.accentColor }} />
                    <span className={`w-4 h-4 rounded-full border border-white/20 ${t.previewCard}`} />
                    <span className={`w-4 h-4 rounded-full border border-white/20 ${t.previewBg}`} />
                  </div>
                  {isSelected && (
                    <span className="text-[10px] uppercase font-mono font-bold tracking-wider text-emerald-400">
                      Active
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Default Indian Payment App Preference */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h3 className="font-extrabold text-base text-white font-outfit flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-400" /> Default Payment Gateway
            </h3>
            <p className="text-xs text-slate-400">Pre-select your preferred Indian UPI payment app for 1-click settlements</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {paymentApps.map((app) => {
            const isSelected = defaultPaymentApp === app.id;
            const LogoComp = app.Logo;

            return (
              <button
                key={app.id}
                type="button"
                onClick={() => handleSelectPayment(app.id)}
                className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col items-center text-center gap-2.5 relative ${
                  isSelected
                    ? 'bg-emerald-500/15 border-emerald-500 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-white/5 border-white/10 hover:border-white/25 hover:bg-white/10'
                }`}
              >
                <div className="bg-white/5 p-1.5 rounded-xl border border-white/10">
                  <LogoComp className="w-8 h-8" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-200 block truncate">{app.name}</span>
                  <span className="text-[10px] text-slate-400 block">{app.subtitle}</span>
                </div>
                {isSelected && (
                  <span className="text-[10px] text-emerald-400 font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                    Default
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. Data Export & Reset */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-outfit font-bold text-sm text-white">Export or Reset Ledger</h4>
          <p className="text-xs text-slate-400">Download your full expense ledger or restore clean initial demo data</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onExportData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all active:scale-95"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Export JSON</span>
          </button>

          <button
            type="button"
            onClick={onResetData}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-xs font-semibold text-rose-300 transition-all active:scale-95"
          >
            <RotateCcw className="w-4 h-4 text-rose-400" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
}
