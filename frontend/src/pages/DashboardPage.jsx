import React from 'react';
import { 
  IndianRupee, 
  Users, 
  Receipt, 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  ShoppingCart, 
  ArrowRightLeft
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { formatCurrency } from '../utils/formatters';
import { calculateMemberFairShare } from '../utils/debtSimplifier';
import { getCategoryDetails } from '../utils/categories';

export function DashboardPage({
  group,
  balances,
  simplifiedDebts = [],
  rawDebts = [],
  currency = '₹',
  currentUser,
  onNavigate,
  onOpenAddExpense,
  onOpenReceiptScanner,
  onOpenSettleModal
}) {
  const totalSpend = (group?.expenses || []).reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  
  // Find current user's actual fair share of expenses
  const currentUserId = currentUser?.id || group?.members?.find((m) => m.isCurrentUser)?.id;
  const userFairShare = currentUserId 
    ? calculateMemberFairShare(group?.expenses || [], currentUserId)
    : (group?.members?.length > 0 ? totalSpend / group.members.length : 0);

  const neededSuppliesCount = group?.supplies?.filter((s) => s.status === 'needed').length || 0;
  const recentExpenses = (group?.expenses || []).slice(0, 4);

  const membersMap = {};
  (group?.members || []).forEach((m) => { membersMap[m.id] = m; });

  return (
    <div className="space-y-6">
      {/* 1. Metric Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Spend */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Total Group Spend</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {formatCurrency(totalSpend, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              {(group?.expenses || []).length} shared transactions
            </p>
          </div>
        </div>

        {/* Fair Share Per Roommate */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Your Fair Share</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-indigo-300 tracking-tight">
              {formatCurrency(userFairShare, currency)}
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Calculated across all shared splits
            </p>
          </div>
        </div>

        {/* Pending Settlements */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Simplified Debts</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <ArrowRightLeft className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-amber-300 tracking-tight">
              {simplifiedDebts.length} Payments
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Simplified from {rawDebts.length} raw splits
            </p>
          </div>
        </div>

        {/* Needed Supplies */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
            <span className="font-semibold uppercase tracking-wider">Low Stock Supplies</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white tracking-tight">
              {neededSuppliesCount} Items
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Need buying for the flat
            </p>
          </div>
        </div>
      </div>

      {/* 2. Roommates Balance Leaderboard */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
          <div>
            <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Roommate Balance Leaderboard
            </h3>
            <p className="text-xs text-slate-400">Real-time status of who paid extra vs who owes money</p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {(group?.members || []).map((member) => {
            const bal = balances[member.id]?.net || 0;
            const isPositive = bal > 0.01;
            const isNegative = bal < -0.01;

            return (
              <div 
                key={member.id}
                className={`p-3 rounded-xl border transition-all flex flex-col items-center text-center ${
                  isPositive 
                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                    : isNegative 
                    ? 'bg-rose-950/20 border-rose-500/30' 
                    : 'bg-white/5 border-white/10'
                }`}
              >
                <img 
                  src={member.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                  alt={member.name}
                  className="w-10 h-10 rounded-full object-cover border border-white/20 mb-2" 
                />
                <span className="text-xs font-bold text-slate-200 truncate w-full">
                  {member.name} {member.isCurrentUser ? '(You)' : ''}
                </span>
                
                <span className={`text-xs font-mono font-extrabold mt-1 ${
                  isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-400'
                }`}>
                  {isPositive ? `+${formatCurrency(bal, currency)}` : isNegative ? `-${formatCurrency(Math.abs(bal), currency)}` : 'Settled'}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5">
                  {isPositive ? 'Gets back' : isNegative ? 'Owes group' : 'All clear'}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Two-Column Row: Simplified Debts + Recent Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Simplified Debt Summary Card */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" /> Pending Settlements
                </h3>
                <p className="text-xs text-slate-400">Fastest way to square all debts</p>
              </div>
              <button
                onClick={() => onNavigate('debts')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>View Full Hub</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {simplifiedDebts.length === 0 ? (
              <div className="py-8 text-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-white">All debts are cleared!</h4>
                <p className="text-xs text-slate-400 mt-0.5">No pending transactions in this group.</p>
              </div>
            ) : (
              <div className="space-y-2.5 mb-4">
                {simplifiedDebts.slice(0, 3).map((debt, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <img src={debt.from?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt={debt.from?.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-slate-200">{debt.from?.name?.split(' ')[0] || 'Debtor'}</span>
                      <ArrowRight className="w-3 h-3 text-slate-500" />
                      <img src={debt.to?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} alt={debt.to?.name} className="w-7 h-7 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-slate-200">{debt.to?.name?.split(' ')[0] || 'Creditor'}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-emerald-400">
                        {formatCurrency(debt.amount, currency)}
                      </span>
                      <button
                        onClick={() => onOpenSettleModal && onOpenSettleModal(debt)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-[11px] font-semibold"
                      >
                        Settle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => onNavigate('debts')}
            className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-300 transition-all text-center"
          >
            Open Debt Settlement Center
          </button>
        </div>

        {/* Right: Recent Expenses Snapshot */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
              <div>
                <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                  <Receipt className="w-4 h-4 text-indigo-400" /> Recent Expenses
                </h3>
                <p className="text-xs text-slate-400">Latest shared bills & purchases</p>
              </div>
              <button
                onClick={() => onNavigate('expenses')}
                className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>View All ({(group?.expenses || []).length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {recentExpenses.length === 0 ? (
              <div className="py-8 text-center bg-white/[0.02] rounded-xl border border-white/5 mb-4">
                <Receipt className="w-8 h-8 text-slate-500 mx-auto mb-2 opacity-50" />
                <h4 className="text-sm font-bold text-white">No expenses yet</h4>
                <p className="text-xs text-slate-400 mt-0.5">Add your first bill or shared purchase below.</p>
              </div>
            ) : (
              <div className="space-y-2.5 mb-4">
                {recentExpenses.map((exp) => {
                  const payer = membersMap[exp.paidBy] || { name: 'Roommate' };
                  const catObj = getCategoryDetails(exp.category, exp.title);

                  return (
                    <div key={exp.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 truncate">
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: catObj.color }} />
                        <div className="truncate">
                          <span className="text-xs font-bold text-white block truncate">{exp.title}</span>
                          <span className="text-[10px] text-slate-400 block truncate">
                            Paid by {payer.name} • {exp.date ? new Date(exp.date).toLocaleDateString('en-IN') : 'Recent'}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-mono font-bold text-white block">
                          {formatCurrency(Number(exp.amount) || 0, currency)}
                        </span>
                        <span className="text-[10px] text-slate-500 capitalize">{exp.splitType || 'Equal'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenAddExpense}
              className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition-all text-center"
            >
              + Add Expense
            </button>
            <button
              onClick={onOpenReceiptScanner}
              className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-semibold"
            >
              Scan Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

