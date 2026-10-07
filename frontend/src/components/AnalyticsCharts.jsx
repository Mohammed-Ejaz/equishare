import React, { useState } from 'react';
import { 
  PieChart, 
  Users,
  ChevronDown,
  ChevronUp,
  Receipt,
  Tag,
  Home,
  Zap,
  ShoppingCart,
  Utensils,
  Sparkles,
  Car,
  Film
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { normalizeCategory, getCategoryDetails } from '../utils/categories';

const ICON_MAP = {
  Home,
  Zap,
  ShoppingCart,
  Utensils,
  Sparkles,
  Car,
  Film,
  Tag
};

export function AnalyticsCharts({
  expenses = [],
  supplies = [],
  members = [],
  balances = {},
  currency = '₹'
}) {
  const [expandedCategoryId, setExpandedCategoryId] = useState(null);

  const membersMap = {};
  members.forEach((m) => {
    membersMap[m.id] = m;
  });

  const totalSpend = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  // Group and normalize category breakdown with item listings
  const categoryGroups = {};
  
  expenses.forEach((e) => {
    let catSource = e.category;
    if (e.supplyId) {
      const linkedSupply = (supplies || []).find((s) => s.id === e.supplyId);
      if (linkedSupply?.category) {
        catSource = linkedSupply.category;
      }
    }
    const catId = normalizeCategory(catSource, e.title);
    if (!categoryGroups[catId]) {
      categoryGroups[catId] = {
        amount: 0,
        items: []
      };
    }
    const amt = Number(e.amount) || 0;
    categoryGroups[catId].amount += amt;
    categoryGroups[catId].items.push(e);
  });

  const sortedCategories = Object.entries(categoryGroups)
    .map(([catId, groupData]) => {
      const catObj = getCategoryDetails(catId);
      const percentage = totalSpend > 0 ? (groupData.amount / totalSpend) * 100 : 0;
      return {
        id: catId,
        label: catObj.label,
        color: catObj.color,
        icon: catObj.icon || 'Tag',
        bg: catObj.bg,
        amount: groupData.amount,
        percentage,
        items: groupData.items.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0))
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Member Spend vs Share Breakdown
  const memberBreakdown = members.map((m) => {
    const b = balances[m.id] || { paid: 0, share: 0, net: 0 };
    return {
      member: m,
      paid: b.paid,
      share: b.share,
      net: b.net,
      paidPct: totalSpend > 0 ? (b.paid / totalSpend) * 100 : 0,
      sharePct: totalSpend > 0 ? (b.share / totalSpend) * 100 : 0
    };
  });

  const toggleCategory = (catId) => {
    setExpandedCategoryId((prev) => (prev === catId ? null : catId));
  };

  return (
    <div className="space-y-6">
      {/* Category Breakdown & Fair Share Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Category Spending Progress Bars & Itemized Breakdown */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <PieChart className="w-4 h-4 text-emerald-400" /> Spending by Category
              </h3>
              <p className="text-xs text-slate-400">Where the apartment budget is spent (click to view items)</p>
            </div>
            <span className="text-sm font-mono font-bold text-emerald-400">
              {currency}{totalSpend.toFixed(2)}
            </span>
          </div>

          <div className="space-y-3">
            {sortedCategories.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No expense data recorded yet. Record bills or grocery purchases to see spending distribution breakdown.
              </div>
            ) : (
              sortedCategories.map((cat) => {
                const isExpanded = expandedCategoryId === cat.id;
                const IconComponent = ICON_MAP[cat.icon] || Tag;

                return (
                  <div
                    key={cat.id}
                    className={`rounded-xl transition-all border ${
                      isExpanded
                        ? 'bg-white/5 border-white/20 shadow-lg'
                        : 'bg-white/[0.02] border-white/5 hover:border-white/10'
                    } p-3`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className="w-full text-left flex flex-col gap-1.5 focus:outline-none"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-white/90 shrink-0"
                            style={{ backgroundColor: `${cat.color}25`, border: `1px solid ${cat.color}50` }}
                          >
                            <IconComponent className="w-3.5 h-3.5" style={{ color: cat.color }} />
                          </span>
                          <div>
                            <span className="font-semibold text-xs text-slate-200 block">
                              {cat.label}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              {cat.items.length} {cat.items.length === 1 ? 'item' : 'items'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 font-mono">
                          <span className="text-xs text-slate-400">{cat.percentage.toFixed(1)}%</span>
                          <strong className="text-xs text-white">{currency}{cat.amount.toFixed(2)}</strong>
                          <span className="text-slate-400">
                            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden mt-1">
                        <div 
                          className="h-full rounded-full transition-all duration-500"
                          style={{ 
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color,
                            boxShadow: `0 0 8px ${cat.color}80`
                          }}
                        />
                      </div>
                    </button>

                    {/* Expandable item listing */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-white/10 space-y-2 animate-in fade-in duration-200">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                          Transactions in {cat.label}:
                        </div>
                        {cat.items.map((item) => {
                          const payer = membersMap[item.paidBy] || { name: 'Roommate' };
                          const formattedDate = item.date ? new Date(item.date).toLocaleDateString('en-IN') : 'Recent';

                          return (
                            <div
                              key={item.id}
                              className="p-2 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between text-xs"
                            >
                              <div className="truncate pr-2">
                                <span className="font-medium text-slate-200 block truncate">
                                  {item.title}
                                </span>
                                <span className="text-[10px] text-slate-400 block truncate">
                                  Paid by <strong className="text-slate-300">{payer.name}</strong> • {formattedDate}
                                  {item.notes ? ` • ${item.notes}` : ''}
                                </span>
                              </div>
                              <span className="font-mono font-bold text-white shrink-0">
                                {currency}{(Number(item.amount) || 0).toFixed(2)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* 2. Roommate Fair Share Comparison */}
        <div className="glass-panel rounded-2xl p-5 border border-white/10">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-white/10">
            <div>
              <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Member Paid vs Fair Share
              </h3>
              <p className="text-xs text-slate-400">Comparing who paid upfront vs consumed share</p>
            </div>
          </div>

          <div className="space-y-4">
            {memberBreakdown.map((item) => (
              <div key={item.member.id} className="p-3 rounded-xl bg-white/5 border border-white/10 text-xs">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <img src={item.member.avatar} alt={item.member.name} className="w-6 h-6 rounded-full object-cover" />
                    <span className="font-semibold text-white">{item.member.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400">Net:</span>
                    <strong className={`font-mono font-bold ${
                      item.net > 0 ? 'text-emerald-400' : item.net < 0 ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                      {item.net > 0 ? `+${currency}${item.net.toFixed(2)}` : item.net < 0 ? `-${currency}${Math.abs(item.net).toFixed(2)}` : '0.00'}
                    </strong>
                  </div>
                </div>

                {/* Progress bars: Paid (green) vs Share (indigo) */}
                <div className="grid grid-cols-2 gap-3 text-[11px] text-slate-400">
                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span>Paid upfront:</span>
                      <strong className="text-emerald-400 font-mono">{currency}{item.paid.toFixed(2)}</strong>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.min(100, item.paidPct)}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between mb-0.5">
                      <span>Consumed share:</span>
                      <strong className="text-indigo-400 font-mono">{currency}{item.share.toFixed(2)}</strong>
                    </div>
                    <div className="w-full bg-white/5 rounded-full h-1.5 overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${Math.min(100, item.sharePct)}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
