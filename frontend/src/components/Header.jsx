import React from 'react';
import { 
  Menu, 
  PanelLeftClose,
  PanelLeftOpen,
  Compass
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export function Header({
  activePage,
  groupName,
  currency = '₹',
  currentNetBalance = 0,
  onToggleMobileMenu,
  isSidebarCollapsed,
  onToggleSidebarCollapse,
  onNavigate,
  currentUser,
  onOpenAuth
}) {
  const pageTitles = {
    dashboard: 'Dashboard & Overview',
    expenses: 'Expense History & Splits',
    debts: 'Smart Debt Simplification',
    calculator: 'Split Calculator Studio',
    groceries: 'Shared Supplies & Groceries',
    analytics: 'Spending Insights & Charts',
    members: 'Group Members & Roles',
    settings: 'App Settings & Themes'
  };

  return (
    <header 
      style={{ 
        paddingTop: 'max(0.75rem, env(safe-area-inset-top, 0.75rem))' 
      }}
      className="app-fixed-header px-3 sm:px-5 lg:px-6 pb-3 sm:pb-4 flex items-center justify-between gap-2 sm:gap-4 shrink-0 transition-all relative select-none"
    >
      {/* Left: Mobile Menu & Page Title */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile toggle */}
        <button
          onClick={onToggleMobileMenu}
          aria-label="Toggle navigation menu"
          className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 md:hidden hover:bg-white/10 active:scale-95 transition-all shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle in Header */}
        {onToggleSidebarCollapse && (
          <button
            onClick={onToggleSidebarCollapse}
            title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            className="hidden md:flex p-2 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            {isSidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 text-emerald-400" />
            ) : (
              <PanelLeftClose className="w-4 h-4 text-slate-400" />
            )}
          </button>
        )}

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-400 truncate">
            <span className="font-medium text-slate-400 truncate max-w-[120px] sm:max-w-[200px]">{groupName}</span>
            <span>/</span>
            <span className="text-emerald-400 font-semibold capitalize shrink-0">{activePage}</span>
          </div>
          <h1 className="text-sm sm:text-base md:text-lg font-extrabold text-white tracking-tight font-outfit truncate">
            {pageTitles[activePage] || 'Dashboard'}
          </h1>
        </div>
      </div>

      {/* Right: Quick Navigation & Actions */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Balance Indicator in Header */}
        <div className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-xl border text-[11px] sm:text-xs font-semibold ${
          currentNetBalance > 0.01
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
            : currentNetBalance < -0.01
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-400'
            : 'bg-white/5 border-white/10 text-slate-400'
        }`}>
          <span className="hidden sm:inline">
            {currentNetBalance > 0.01
              ? `You are owed `
              : currentNetBalance < -0.01
              ? `You owe `
              : ''}
          </span>
          <strong className="font-mono">
            {currentNetBalance > 0.01
              ? `+${formatCurrency(currentNetBalance, currency)}`
              : currentNetBalance < -0.01
              ? `-${formatCurrency(Math.abs(currentNetBalance), currency)}`
              : 'Settled'}
          </strong>
        </div>

        {/* Website Landing Page shortcut */}
        {onNavigate && (
          <button
            onClick={() => onNavigate('landing')}
            title="Explore Main Website & Features"
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-emerald-400 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 text-xs font-semibold active:scale-95"
          >
            <Compass className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline text-[11px] text-slate-300">Website</span>
          </button>
        )}

        {/* User Account / Profile Badge */}
        {currentUser && onOpenAuth && (
          <button
            onClick={() => onOpenAuth('profile')}
            title={`Logged in as ${currentUser.name}. Click to manage profile or switch user.`}
            className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs transition-all active:scale-95"
          >
            <img 
              src={currentUser.avatar} 
              alt={currentUser.name} 
              className="w-6 h-6 rounded-full object-cover border border-emerald-400/50 shrink-0" 
            />
            <span className="hidden md:inline font-bold text-slate-200 max-w-[100px] truncate">
              {currentUser.name.split(' ')[0]}
            </span>
          </button>
        )}
      </div>
    </header>
  );
}
