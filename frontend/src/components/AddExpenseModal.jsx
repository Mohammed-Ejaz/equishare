import React, { useState, useEffect } from 'react';
import { 
  X, 
  Check,
  AlertCircle,
  Pencil,
  Plus
} from 'lucide-react';
import { CATEGORIES } from '../data/mockData';
import { getLocalDateString } from '../utils/formatters';

export function AddExpenseModal({
  isOpen,
  onClose,
  members = [],
  currency = '₹',
  onAddExpense,
  onEditExpense,
  editingExpense = null,
  currentUser = null,
  initialAmount = ''
}) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('groceries');
  const [paidBy, setPaidBy] = useState('');
  const [date, setDate] = useState(() => getLocalDateString());
  const [notes, setNotes] = useState('');
  const [splitType, setSplitType] = useState('equal'); // 'equal' | 'custom' | 'percentage'
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [customSplits, setCustomSplits] = useState({});
  const [validationError, setValidationError] = useState('');

  const defaultPayerId = currentUser?.id || members.find((m) => m.isCurrentUser)?.id || members[0]?.id || '';

  // Reset/populate state whenever modal opens or editingExpense/initialAmount changes
  useEffect(() => {
    if (isOpen) {
      if (editingExpense) {
        setTitle(editingExpense.title || '');
        setAmount(String(editingExpense.amount || ''));
        setCategory(editingExpense.category || 'groceries');
        setPaidBy(editingExpense.paidBy || defaultPayerId);
        setDate(editingExpense.date || getLocalDateString());
        setNotes(editingExpense.notes || '');
        setSplitType(editingExpense.splitType || 'equal');
        setSelectedMembers(editingExpense.participants || members.map((m) => m.id));
        setCustomSplits(editingExpense.splits || {});
      } else {
        setTitle('');
        setAmount(initialAmount ? String(initialAmount) : '');
        setCategory('groceries');
        setPaidBy(defaultPayerId);
        setDate(getLocalDateString());
        setNotes('');
        setSplitType('equal');
        setSelectedMembers(members.map((m) => m.id));
        setCustomSplits({});
      }
      setValidationError('');
    }
  }, [isOpen, editingExpense, initialAmount, members, defaultPayerId]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const totalAmount = parseFloat(amount) || 0;

  const toggleMemberSelection = (memberId) => {
    if (selectedMembers.includes(memberId)) {
      if (selectedMembers.length > 1) {
        setSelectedMembers(selectedMembers.filter((id) => id !== memberId));
      }
    } else {
      setSelectedMembers([...selectedMembers, memberId]);
    }
  };

  const handleCustomSplitChange = (memberId, val) => {
    setCustomSplits((prev) => ({
      ...prev,
      [memberId]: val === '' ? '' : Math.max(0, parseFloat(val) || 0)
    }));
  };

  const calculateEqualSplits = () => {
    const n = selectedMembers.length;
    if (n === 0 || totalAmount <= 0) return {};
    const totalPaise = Math.round(totalAmount * 100);
    const baseShare = Math.floor(totalPaise / n);
    let remainder = totalPaise % n;

    const splits = {};
    selectedMembers.forEach((mId) => {
      let memberPaise = baseShare;
      if (remainder > 0) {
        memberPaise += 1;
        remainder -= 1;
      }
      splits[mId] = memberPaise / 100;
    });
    return splits;
  };

  const calculatePercentageSplits = () => {
    const totalPaise = Math.round(totalAmount * 100);
    let allocatedPaise = 0;
    const splits = {};

    selectedMembers.forEach((mId, idx) => {
      const pct = parseFloat(customSplits[mId]) || 0;
      if (idx === selectedMembers.length - 1) {
        // Last member gets exact remainder to guarantee zero paisa loss
        const remaining = totalPaise - allocatedPaise;
        splits[mId] = Math.max(0, remaining) / 100;
      } else {
        const memberPaise = Math.round((pct / 100) * totalPaise);
        allocatedPaise += memberPaise;
        splits[mId] = memberPaise / 100;
      }
    });
    return splits;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!title.trim()) {
      setValidationError('Please enter an expense title.');
      return;
    }
    if (totalAmount <= 0) {
      setValidationError('Amount must be greater than 0.');
      return;
    }
    if (selectedMembers.length === 0) {
      setValidationError('At least one member must be selected.');
      return;
    }

    let finalSplits = {};

    if (splitType === 'equal') {
      finalSplits = calculateEqualSplits();
    } else if (splitType === 'custom') {
      const totalExpPaise = Math.round(totalAmount * 100);
      let customSumPaise = 0;
      selectedMembers.forEach((mId) => {
        const val = parseFloat(customSplits[mId]) || 0;
        const p = Math.round(val * 100);
        customSumPaise += p;
        finalSplits[mId] = p / 100;
      });

      if (customSumPaise !== totalExpPaise) {
        setValidationError(`Custom amounts sum to ${currency}${(customSumPaise / 100).toFixed(2)}, but total is ${currency}${(totalExpPaise / 100).toFixed(2)}.`);
        return;
      }
    } else if (splitType === 'percentage') {
      let totalPct = 0;
      selectedMembers.forEach((mId) => {
        totalPct += parseFloat(customSplits[mId]) || 0;
      });

      if (Math.abs(totalPct - 100) > 0.1) {
        setValidationError(`Percentages sum to ${totalPct.toFixed(1)}%. They must equal 100%.`);
        return;
      }
      finalSplits = calculatePercentageSplits();
    }

    const expensePayload = {
      id: editingExpense ? editingExpense.id : `exp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      title: title.trim(),
      amount: totalAmount,
      category,
      paidBy,
      date,
      splitType,
      participants: selectedMembers,
      splits: finalSplits,
      notes: notes.trim()
    };

    if (editingExpense && onEditExpense) {
      onEditExpense(expensePayload);
    } else if (onAddExpense) {
      onAddExpense(expensePayload);
    }
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md transition-opacity duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-expense-modal-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-[#111726] border border-white/10 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-5">
          <h2 id="add-expense-modal-title" className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2 font-outfit">
            {editingExpense ? (
              <>
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Pencil className="w-4 h-4" />
                </span>
                Edit Expense
              </>
            ) : (
              <>
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  <Plus className="w-4 h-4" />
                </span>
                Add New Shared Expense
              </>
            )}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            {editingExpense ? 'Update amount, splits or payer details' : 'Log a bill or shared purchase to split with roommates'}
          </p>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-2 text-xs text-rose-300 animate-in fade-in">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title & Amount Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Expense Title *
              </label>
              <input
                type="text"
                placeholder="e.g. April Rent, Wi-Fi Bill, Swiggy Dinner"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:outline-none text-xs text-white placeholder-slate-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Amount ({currency}) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:outline-none text-xs text-white placeholder-slate-500 font-mono font-bold"
                required
              />
            </div>
          </div>

          {/* Category & Date Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id} className="bg-[#111726]">
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50"
              />
            </div>
          </div>

          {/* Paid By Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Who paid upfront?
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {members.map((m) => {
                const isSelected = paidBy === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaidBy(m.id)}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                      isSelected
                        ? 'bg-emerald-500/15 border-emerald-500 ring-1 ring-emerald-500'
                        : 'bg-white/5 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <img src={m.avatar} alt={m.name} className="w-6 h-6 rounded-full object-cover shrink-0" />
                    <span className={`text-xs font-semibold truncate ${isSelected ? 'text-emerald-300' : 'text-slate-300'}`}>
                      {m.name} {m.isCurrentUser ? '(You)' : ''}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Split Mode Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-300">
                Split Strategy
              </label>
              <span className="text-[10px] text-slate-400">
                {selectedMembers.length} {selectedMembers.length === 1 ? 'person' : 'people'} sharing
              </span>
            </div>

            <div className="flex rounded-xl bg-white/5 p-1 border border-white/10 mb-3">
              <button
                type="button"
                onClick={() => setSplitType('equal')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  splitType === 'equal'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Split Equally
              </button>
              <button
                type="button"
                onClick={() => setSplitType('custom')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  splitType === 'custom'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Exact Amounts ({currency})
              </button>
              <button
                type="button"
                onClick={() => setSplitType('percentage')}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  splitType === 'percentage'
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Percentages (%)
              </button>
            </div>

            {/* Member Selection & Split Inputs */}
            <div className="space-y-2 border border-white/5 p-3 rounded-xl bg-white/[0.02]">
              {members.map((m) => {
                const isIncluded = selectedMembers.includes(m.id);
                return (
                  <div
                    key={m.id}
                    className={`flex items-center justify-between p-2 rounded-lg border transition-all ${
                      isIncluded
                        ? 'bg-white/5 border-white/10'
                        : 'bg-transparent border-transparent opacity-40'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggleMemberSelection(m.id)}
                      className="flex items-center gap-2.5 flex-1 text-left"
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                        isIncluded ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-500'
                      }`}>
                        {isIncluded && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <img src={m.avatar} alt={m.name} className="w-5 h-5 rounded-full object-cover" />
                      <span className="text-xs font-semibold text-slate-200">
                        {m.name}
                      </span>
                    </button>

                    {/* Split Type Specific Input */}
                    {isIncluded && (
                      <div className="shrink-0">
                        {splitType === 'equal' ? (
                          <span className="text-xs font-mono text-emerald-400 font-bold">
                            {currency}{selectedMembers.length > 0 ? (totalAmount / selectedMembers.length).toFixed(2) : '0.00'}
                          </span>
                        ) : splitType === 'custom' ? (
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-slate-400">{currency}</span>
                            <input
                              type="number"
                              step="0.01"
                              placeholder="0.00"
                              value={customSplits[m.id] !== undefined ? customSplits[m.id] : ''}
                              onChange={(e) => handleCustomSplitChange(m.id, e.target.value)}
                              className="w-20 px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-white font-mono text-right"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-1">
                            <input
                              type="number"
                              step="0.1"
                              placeholder="0"
                              value={customSplits[m.id] !== undefined ? customSplits[m.id] : ''}
                              onChange={(e) => handleCustomSplitChange(m.id, e.target.value)}
                              className="w-16 px-2 py-1 rounded-lg bg-white/10 border border-white/10 text-xs text-white font-mono text-right"
                            />
                            <span className="text-xs text-slate-400">%</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Paid via Google Pay, includes 5% delivery charges"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:outline-none text-xs text-slate-200 placeholder-slate-500"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
            >
              {editingExpense ? 'Save Changes' : 'Save Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
