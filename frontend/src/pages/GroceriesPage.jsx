import React, { useState } from 'react';
import { 
  ShoppingCart, 
  Plus, 
  CheckCircle2, 
  Trash2, 
  Wallet, 
  PackageCheck
} from 'lucide-react';
import { getCategoryDetails } from '../utils/categories';

export function GroceriesPage({
  supplies = [],
  members = [],
  currency = '₹',
  onAddSupply,
  onUpdateSupplyStatus,
  onDeleteSupply,
  onConvertSupplyToExpense
}) {
  const [newItemName, setNewItemName] = useState('');
  const [newCategory, setNewCategory] = useState('Groceries');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newSupply = {
      id: `sup-${Date.now()}`,
      name: newItemName.trim(),
      category: newCategory,
      status: 'needed',
      requestedBy: members[0]?.name?.split(' ')[0] || 'Roommate',
      estimatedPrice: parseFloat(estimatedPrice) || 10.00
    };

    onAddSupply(newSupply);
    setNewItemName('');
    setEstimatedPrice('');
  };

  const filteredSupplies = supplies.filter((s) => {
    if (selectedTab === 'all') return true;
    return s.status === selectedTab;
  });

  return (
    <div className="space-y-6">
      {/* 1. Header & Add Input */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-white/10">
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span className="text-emerald-400">🛒</span> Communal Supplies & Grocery Tracker
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Track household staples and turn them into split expenses when bought
            </p>
          </div>

          <div className="flex items-center bg-white/5 p-1 rounded-xl border border-white/10 self-start sm:self-auto">
            <button
              onClick={() => setSelectedTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTab === 'all' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({supplies.length})
            </button>
            <button
              onClick={() => setSelectedTab('needed')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTab === 'needed' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Needed ({supplies.filter((s) => s.status === 'needed').length})
            </button>
            <button
              onClick={() => setSelectedTab('purchased')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedTab === 'purchased' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              Purchased ({supplies.filter((s) => s.status === 'purchased').length})
            </button>
          </div>
        </div>

        {/* Input Form */}
        <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2.5">
          <input
            type="text"
            placeholder="Add communal supply (e.g. Toilet paper 24-pk, Dish soap, Extra virgin olive oil)..."
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500/50 focus:outline-none text-xs text-white placeholder-slate-500"
          />

          <div className="flex gap-2">
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-emerald-500/50 cursor-pointer"
            >
              <option value="Groceries" className="bg-[#111726]">Groceries & Food</option>
              <option value="Household" className="bg-[#111726]">Household & Cleaning</option>
              <option value="Kitchen" className="bg-[#111726]">Kitchen & Cooking</option>
              <option value="Pantry" className="bg-[#111726]">Pantry & Snacks</option>
              <option value="Bathroom" className="bg-[#111726]">Bathroom & Toiletries</option>
            </select>

            <input
              type="number"
              step="0.5"
              placeholder={`Est. ${currency}`}
              value={estimatedPrice}
              onChange={(e) => setEstimatedPrice(e.target.value)}
              className="w-24 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 font-mono"
            />

            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </button>
          </div>
        </form>
      </div>

      {/* 2. Supplies Grid */}
      {filteredSupplies.length === 0 ? (
        <div className="glass-panel rounded-2xl py-16 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-2">
            <ShoppingCart className="w-8 h-8" />
          </div>
          <h3 className="font-extrabold text-base text-white">All supplies are in stock!</h3>
          <p className="text-xs text-slate-400 max-w-sm mt-1">
            Add any household items when running low.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSupplies.map((supply) => {
            const isPurchased = supply.status === 'purchased';

            return (
              <div
                key={supply.id}
                className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  isPurchased
                    ? 'border-white/5 opacity-70'
                    : 'border-white/10 hover:border-emerald-500/40'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => onUpdateSupplyStatus(supply.id, isPurchased ? 'needed' : 'purchased')}
                      className={`mt-0.5 w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                        isPurchased 
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950' 
                          : 'border-slate-500 hover:border-emerald-400'
                      }`}
                    >
                      {isPurchased && <CheckCircle2 className="w-4 h-4 stroke-[3]" />}
                    </button>
                    <div>
                      <h4 className={`text-sm font-bold ${isPurchased ? 'line-through text-slate-400' : 'text-white'}`}>
                        {supply.name}
                      </h4>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-1">
                        {(() => {
                          const catDetails = getCategoryDetails(supply.category, supply.name);
                          return (
                            <span 
                              className="px-2 py-0.5 rounded text-[10px] font-semibold border"
                              style={{
                                backgroundColor: `${catDetails.color}15`,
                                borderColor: `${catDetails.color}35`,
                                color: catDetails.color
                              }}
                            >
                              {supply.category || catDetails.label}
                            </span>
                          );
                        })()}
                        <span>Requested by {supply.requestedBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono text-sm font-bold text-emerald-400">
                      ~{currency}{Number(supply.estimatedPrice).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Convert to split expense */}
                <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-2">
                  {!isPurchased ? (
                    <button
                      onClick={() => onConvertSupplyToExpense(supply)}
                      className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 transition-colors"
                    >
                      <Wallet className="w-3.5 h-3.5" />
                      <span>I bought this → Split with roommates</span>
                    </button>
                  ) : (
                    <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <PackageCheck className="w-4 h-4" /> Stocked & Settled
                    </span>
                  )}

                  <button
                    onClick={() => onDeleteSupply(supply.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
