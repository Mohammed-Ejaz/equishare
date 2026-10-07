import React, { useState } from 'react';
import { 
  Search, 
  Trash2, 
  Calendar, 
  Plus, 
  Home, 
  Zap, 
  ShoppingCart, 
  Utensils, 
  Sparkles, 
  Car, 
  Film,
  Tag,
  Receipt,
  FileText,
  Pencil
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { normalizeCategory, getCategoryDetails } from '../utils/categories';
import { formatCurrency } from '../utils/formatters';

export function ExpensesPage({
  expenses = [],
  members = [],
  currency = '₹',
  onDeleteExpense,
  onEditExpense,
  onOpenAddExpense,
  onOpenReceiptScanner
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedPayer, setSelectedPayer] = useState('all');

  const membersMap = {};
  (members || []).forEach((m) => { membersMap[m.id] = m; });

  const categoryIcons = {
    rent: Home,
    utilities: Zap,
    groceries: ShoppingCart,
    dining: Utensils,
    household: Sparkles,
    transport: Car,
    entertainment: Film,
    other: Tag
  };

  const filteredExpenses = (expenses || [])
    .filter((e) => {
      const matchesSearch = (e.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (e.notes && e.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      const normCat = normalizeCategory(e.category, e.title);
      const matchesCategory = selectedCategory === 'all' || normCat === selectedCategory || e.category === selectedCategory;
      const matchesPayer = selectedPayer === 'all' || e.paidBy === selectedPayer;
      return matchesSearch && matchesCategory && matchesPayer;
    })
    .sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

  const totalFiltered = filteredExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <div className="glass-panel rounded-2xl p-5 border border-white/10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-lg font-extrabold text-white tracking-tight">
              All Expenses ({filteredExpenses.length})
            </h2>
            <p className="text-xs text-slate-400">
              Filtered Total: <strong className="text-emerald-400 font-mono">{formatCurrency(totalFiltered, currency)}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReceiptScanner}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-slate-200 transition-all active:scale-95"
            >
              <Receipt className="w-3.5 h-3.5 text-indigo-400" />
              <span>Scan Receipt</span>
            </button>

            <button
              onClick={onOpenAddExpense}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Expense</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by title or note..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:outline-none text-xs text-slate-200 placeholder-slate-500"
            />
          </div>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all" className="bg-[#111726]">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id} className="bg-[#111726]">{c.label}</option>
            ))}
          </select>

          {/* Paid By Filter */}
          <select
            value={selectedPayer}
            onChange={(e) => setSelectedPayer(e.target.value)}
            className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
          >
            <option value="all" className="bg-[#111726]">All Payers</option>
            {(members || []).map((m) => (
              <option key={m.id} value={m.id} className="bg-[#111726]">Paid by {m.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Expenses Cards List */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="glass-panel rounded-2xl py-16 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-2">
              <FileText className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-sm text-slate-300">No matching expenses found</h4>
            <p className="text-xs text-slate-500 max-w-xs mt-1">
              Try adjusting your search criteria or add a new expense.
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => {
            const payer = membersMap[expense.paidBy] || { name: 'Roommate', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' };
            const catObj = getCategoryDetails(expense.category, expense.title);
            const Icon = categoryIcons[catObj.id] || Tag;

            return (
              <div
                key={expense.id}
                className="glass-panel rounded-2xl p-4 border border-white/10 hover:border-white/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                {/* Left: Category Icon, Title, Date, Payer */}
                <div className="flex items-center gap-3.5 min-w-0">
                  <div 
                    className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border"
                    style={{ 
                      backgroundColor: `${catObj.color}15`,
                      borderColor: `${catObj.color}40`,
                      color: catObj.color 
                    }}
                  >
                    <Icon className="w-5 h-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-bold text-sm text-white flex items-center gap-2 truncate">
                      {expense.title}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 flex-wrap">
                      <span className="flex items-center gap-1">
                        <img src={payer.avatar} alt={payer.name} className="w-4 h-4 rounded-full object-cover" />
                        <strong>{payer.name}</strong> paid
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" />
                        {expense.date ? new Date(expense.date).toLocaleDateString('en-IN') : 'Recent'}
                      </span>
                      {expense.notes && (
                        <>
                          <span>•</span>
                          <span className="italic text-slate-400 truncate max-w-xs">{expense.notes}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Participant Avatars, Amount, Split Details & Actions */}
                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-white/5 pt-3 sm:pt-0">
                  {/* Split Avatars */}
                  <div className="flex items-center -space-x-2 overflow-hidden">
                    {(expense.participants || Object.keys(expense.splits || {})).map((mId, i) => {
                      const m = membersMap[mId];
                      if (!m) return null;
                      return (
                        <img
                          key={i}
                          src={m.avatar}
                          alt={m.name}
                          title={`${m.name}: ${formatCurrency(expense.splits?.[mId] || (expense.amount / (expense.participants?.length || 1)), currency)}`}
                          className="w-7 h-7 rounded-full object-cover ring-2 ring-[#111726]"
                        />
                      );
                    })}
                  </div>

                  {/* Amount & Split Type */}
                  <div className="text-right">
                    <div className="text-base font-extrabold text-white font-mono">
                      {formatCurrency(expense.amount, currency)}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold capitalize">
                      {expense.splitType || 'Equal'} split
                    </div>
                  </div>

                  {/* Actions: Edit & Delete */}
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {onEditExpense && (
                      <button
                        onClick={() => onEditExpense(expense)}
                        title="Edit expense"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                    )}

                    <button
                      onClick={() => {
                        if (window.confirm(`Delete "${expense.title}"? This cannot be undone.`)) {
                          onDeleteExpense && onDeleteExpense(expense.id);
                        }
                      }}
                      title="Delete expense"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
