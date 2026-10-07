import React, { useState } from 'react';
import { 
  ArrowRight, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  CreditCard, 
  History,
  Trash2
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

export function DebtsPage({
  group,
  simplifiedDebts = [],
  rawDebts = [],
  currency = '₹',
  onOpenSettleModal,
  onDeleteSettlement
}) {
  const [viewMode, setViewMode] = useState('simplified'); // 'simplified' | 'raw'
  const activeDebts = viewMode === 'simplified' ? simplifiedDebts : rawDebts;
  const savedTransactions = Math.max(0, rawDebts.length - simplifiedDebts.length);

  const getMember = (memberId) => {
    return group?.members?.find((m) => m.id === memberId) || { name: 'Member', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' };
  };

  return (
    <div className="space-y-6">
      {/* 1. Explainer & Algorithm Header */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 font-bold shadow-lg shadow-emerald-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Debt Settlement Hub
                </h2>
                {savedTransactions > 0 && (
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Algorithm saves {savedTransactions} transactions
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Our greedy minimum cash flow algorithm (O(N log N)) automatically simplifies complex multi-party expenses into the fewest possible direct payments.
              </p>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 self-start md:self-auto shrink-0">
            <button
              onClick={() => setViewMode('simplified')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'simplified'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Simplified ({simplifiedDebts.length} Payments)
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'raw'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Raw Unsimplified ({rawDebts.length})
            </button>
          </div>
        </div>
      </div>

      {/* 2. Active Debt Flows Grid */}
      {activeDebts.length === 0 ? (
        <div className="glass-panel rounded-2xl py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-3 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-white">Everyone is all squared up!</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            There are currently no outstanding debts in {group?.name || 'this group'}.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activeDebts.map((debt, index) => (
            <div
              key={debt.id || index}
              className="glass-panel rounded-2xl p-5 border border-white/10 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
            >
              {/* Top: Debtor (Owes) -> Creditor (Receives) */}
              <div className="flex items-center justify-between gap-3 mb-4">
                {/* Debtor */}
                <div className="flex items-center gap-2.5">
                  <img 
                    src={debt.from?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} 
                    alt={debt.from?.name || 'Debtor'}
                    className="w-10 h-10 rounded-full object-cover border border-rose-500/40" 
                  />
                  <div>
                    <span className="text-xs font-bold text-white block truncate max-w-[90px]">
                      {debt.from?.name || 'Debtor'}
                    </span>
                    <span className="text-[10px] text-rose-400 font-semibold">Owes</span>
                  </div>
                </div>

                {/* Arrow & Amount */}
                <div className="flex flex-col items-center px-2">
                  <span className="text-sm font-mono font-extrabold text-emerald-400 mb-0.5">
                    {formatCurrency(debt.amount, currency)}
                  </span>
                  <div className="flex items-center gap-1 text-slate-500">
                    <div className="w-8 h-[1px] bg-emerald-500/40" />
                    <ArrowRight className="w-4 h-4 text-emerald-400 -ml-1.5" />
                  </div>
                </div>

                {/* Creditor */}
                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="text-xs font-bold text-white block truncate max-w-[90px]">
                      {debt.to?.name || 'Creditor'}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-semibold">Gets back</span>
                  </div>
                  <img 
                    src={debt.to?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'} 
                    alt={debt.to?.name || 'Creditor'}
                    className="w-10 h-10 rounded-full object-cover border border-emerald-500/40" 
                  />
                </div>
              </div>

              {/* Settle Action Button */}
              <button
                onClick={() => onOpenSettleModal && onOpenSettleModal(debt)}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition-all active:scale-98"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Settle Up ({formatCurrency(debt.amount, currency)})</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 3. Recorded Settlements Ledger */}
      {group?.settlements && group.settlements.length > 0 && (
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <History className="w-4 h-4 text-indigo-400" /> Recorded Payment History
              </h3>
              <p className="text-xs text-slate-400">Past settled transactions in this group</p>
            </div>
          </div>

          <div className="space-y-2">
            {group.settlements.map((s) => {
              const payer = getMember(s.from);
              const receiver = getMember(s.to);
              return (
                <div key={s.id} className="p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-400 font-bold">
                      ✓
                    </span>
                    <div>
                      <span className="font-semibold text-white">
                        {payer.name} paid {receiver.name} via {s.method?.toUpperCase()}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {s.note ? `${s.note} • ` : ''}{s.date ? new Date(s.date).toLocaleDateString('en-IN') : 'Recent'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <strong className="font-mono font-bold text-emerald-400">
                      {formatCurrency(Number(s.amount) || 0, currency)}
                    </strong>
                    {onDeleteSettlement && (
                      <button
                        onClick={() => {
                          if (window.confirm(`Undo and delete this settlement of ${formatCurrency(Number(s.amount) || 0, currency)}?`)) {
                            onDeleteSettlement(s.id);
                          }
                        }}
                        aria-label="Undo settlement"
                        title="Undo settlement"
                        className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

