import React from 'react';
import { 
  LayoutDashboard, 
  ReceiptText, 
  ShoppingCart, 
  PieChart, 
  Users, 
  Plus, 
  Receipt, 
  ChevronDown, 
  ArrowRightLeft,
  Calculator,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  LogOut,
  Settings
} from 'lucide-react';
import { AppLogo } from './PaymentLogos';
import { formatCurrency } from '../utils/formatters';

export function Sidebar({
  activePage,
  onNavigate,
  groups,
  activeGroupId,
  onSelectGroup,
  onOpenAddExpense,
  onOpenReceiptScanner,
  onOpenNewGroup,
  currentNetBalance,
  currency = '₹',
  isCollapsed = false,
  onToggleCollapse,
  appName = 'EquiShare',
  currentUser: explicitCurrentUser,
  onOpenAuth,
  onLogout
}) {
  const activeGroup = groups.find((g) => g.id === activeGroupId) || groups[0];
  const currentUser = explicitCurrentUser || activeGroup.members.find((m) => m.isCurrentUser) || activeGroup.members[0];

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, badge: null },
    { id: 'expenses', label: 'Expenses', icon: ReceiptText, badge: activeGroup.expenses.length },
    { id: 'debts', label: 'Debt Settlement', icon: ArrowRightLeft, badge: 'Smart' },
    { id: 'calculator', label: 'Calculator Studio', icon: Calculator, badge: 'New' },
    { id: 'groceries', label: 'Shared Supplies', icon: ShoppingCart, badge: activeGroup.supplies?.filter(s => s.status === 'needed').length || null },
    { id: 'analytics', label: 'Insights & Charts', icon: PieChart, badge: null },
    { id: 'members', label: 'Group & Members', icon: Users, badge: activeGroup.members.length },
    { id: 'settings', label: 'App Settings', icon: Settings, badge: null }
  ];

  return (
    <aside 
      className={`bg-[var(--bg-sidebar,#0B101D)]/95 backdrop-blur-xl border-r border-white/10 flex flex-col justify-between shrink-0 h-screen sticky top-0 z-40 select-none transition-all duration-300 ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand & Group Switcher */}
      <div className="flex flex-col min-h-0">
        {/* Brand & Collapse Button */}
        <div className={`p-4 border-b border-white/10 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden cursor-pointer" onClick={() => onNavigate('dashboard')}>
            <AppLogo size={36} />
            {!isCollapsed && (
              <div className="animate-in fade-in duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-base tracking-tight text-white font-outfit">
                    {appName}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium truncate">Smart Expense Settlement</p>
              </div>
            )}
          </div>

          {/* Desktop Toggle Button */}
          {!isCollapsed && onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors hidden md:flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed Expand Button */}
        {isCollapsed && onToggleCollapse && (
          <div className="p-2 border-b border-white/10 hidden md:flex justify-center">
            <button
              onClick={onToggleCollapse}
              title="Expand sidebar"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Group Selector Pill */}
        {!isCollapsed ? (
          <div className="p-3.5 border-b border-white/10">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 px-1">
              Active Group
            </label>
            <div className="relative">
              <select
                value={activeGroupId}
                onChange={(e) => {
                  if (e.target.value === 'NEW_GROUP') {
                    onOpenNewGroup();
                  } else {
                    onSelectGroup(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 text-xs font-semibold text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer appearance-none transition-all"
              >
                {groups.map((g) => (
                  <option key={g.id} value={g.id} className="bg-[#111726]">
                    {g.name}
                  </option>
                ))}
                <option value="NEW_GROUP" className="bg-[#111726] text-emerald-400 font-bold">
                  + Create New Group / Trip...
                </option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        ) : (
          <div className="p-2 border-b border-white/10 flex justify-center">
            <button
              onClick={onOpenNewGroup}
              title="New Group"
              className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-emerald-400 text-xs font-bold"
            >
              +
            </button>
          </div>
        )}

        {/* Primary Action Buttons */}
        <div className={`p-3 space-y-2 ${isCollapsed ? 'flex flex-col items-center' : ''}`}>
          <button
            onClick={onOpenAddExpense}
            title="Add Expense"
            className={`flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 ${
              isCollapsed ? 'w-10 h-10 p-0' : 'w-full py-2.5 px-4'
            }`}
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>Add Expense</span>}
          </button>

          <button
            onClick={onOpenReceiptScanner}
            title="Scan Receipt"
            className={`flex items-center justify-center gap-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-semibold text-xs transition-all active:scale-95 ${
              isCollapsed ? 'w-10 h-10 p-0' : 'w-full py-2 px-4'
            }`}
          >
            <Receipt className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            {!isCollapsed && <span>Scan Receipt</span>}
          </button>
        </div>

        {/* Navigation Menu Links */}
        <nav className="px-3 py-1 space-y-1 overflow-y-auto flex-1 custom-scrollbar">
          {!isCollapsed && (
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1 mb-0.5">
              Menu
            </div>
          )}
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`flex items-center rounded-xl text-xs font-semibold transition-all ${
                  isCollapsed 
                    ? 'w-10 h-10 mx-auto justify-center p-0' 
                    : 'w-full justify-between px-3 py-2'
                } ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2.5'}`}>
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isCollapsed && item.badge !== null && (
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950'
                      : typeof item.badge === 'string'
                      ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                      : 'bg-white/10 text-slate-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Profile Card & Net Balance (Bottom) */}
      <div className="p-3 border-t border-white/10 bg-black/25">
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-1.5'}`}>
          <div 
            onClick={() => onOpenAuth && onOpenAuth('profile')}
            title="Manage Profile & Switch User"
            className={`flex-1 p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 cursor-pointer transition-all group flex items-center ${
              isCollapsed ? 'justify-center' : 'justify-between gap-2.5'
            }`}
          >
            <div className="flex items-center gap-2.5 truncate">
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name} 
                className="w-8 h-8 rounded-full object-cover border border-emerald-500/40 shrink-0 group-hover:border-emerald-400" 
              />
              {!isCollapsed && (
                <div className="truncate text-left">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-white block truncate">{currentUser.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">You</span>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">{currentUser.email || 'Current User'}</span>
                </div>
              )}
            </div>

            {!isCollapsed && (
              <div className="p-1 rounded-lg text-slate-400 group-hover:text-emerald-400 group-hover:bg-white/10 transition-colors shrink-0">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
            )}
          </div>

          {!isCollapsed && onLogout && (
            <button
              type="button"
              onClick={onLogout}
              title="Log Out & Return to Main Page"
              className="p-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 hover:text-rose-200 transition-all shrink-0 flex items-center justify-center"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
