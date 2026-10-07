import React, { useState, useEffect } from 'react';
import { X, Trash2, Users, Plus, Sparkles } from 'lucide-react';

export function NewGroupModal({
  isOpen,
  onClose,
  onCreateGroup,
  currentUser
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [currency, setCurrency] = useState('₹');
  const [membersList, setMembersList] = useState([]);
  const [newMemberName, setNewMemberName] = useState('');

  // Reset when opened
  useEffect(() => {
    if (isOpen) {
      setMembersList([
        { 
          name: currentUser?.name || 'You', 
          email: currentUser?.email || '', 
          isCurrentUser: true,
          id: currentUser?.id 
        }
      ]);
      setName('');
      setDescription('');
      setNewMemberName('');
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  const defaultAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  ];

  const handleAddMember = (e) => {
    e.preventDefault();
    if (!newMemberName.trim()) return;
    setMembersList([...membersList, { name: newMemberName.trim(), email: '', isCurrentUser: false }]);
    setNewMemberName('');
  };

  const handleRemoveMember = (index) => {
    if (membersList.length > 1) {
      setMembersList(membersList.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const formattedMembers = membersList.map((m, idx) => ({
      id: m.isCurrentUser && currentUser ? currentUser.id : `m-custom-${Date.now()}-${idx}`,
      name: m.name.trim(),
      avatar: m.isCurrentUser && currentUser?.avatar ? currentUser.avatar : defaultAvatars[idx % defaultAvatars.length],
      email: m.email || (m.isCurrentUser ? currentUser?.email : ''),
      upiId: m.isCurrentUser ? (currentUser?.upiId || '') : (m.upiId || ''),
      isCurrentUser: Boolean(m.isCurrentUser),
      role: m.isCurrentUser ? 'admin' : 'member',
      color: ['#10B981', '#6366F1', '#EC4899', '#F59E0B', '#3B82F6'][idx % 5]
    }));

    const newGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      name: name.trim(),
      description: description.trim() || 'Shared expenses space',
      currency,
      members: formattedMembers,
      expenses: [],
      supplies: [],
      settlements: []
    };

    onCreateGroup(newGroup);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-label="Create New Expense Group"
    >
      <div className="w-full max-w-md bg-[#111726] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-5">
          <h3 className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-400" />
            <span>Create New Expense Group</span>
          </h3>
          <p className="text-xs text-slate-400">Start a new space for your flatmates, vacation trip, or household bills</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Group Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Flat 402, Goa Trip 2026, Groceries Club"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white font-semibold focus:border-emerald-500 focus:outline-none placeholder-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-400 font-semibold mb-1">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="₹" className="bg-[#111726]">₹ INR (₹)</option>
                <option value="$" className="bg-[#111726]">$ USD ($)</option>
                <option value="€" className="bg-[#111726]">€ EUR (€)</option>
                <option value="£" className="bg-[#111726]">£ GBP (£)</option>
                <option value="¥" className="bg-[#111726]">¥ JPY (¥)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 font-semibold mb-1">Description</label>
              <input
                type="text"
                placeholder="e.g. Rent & utilities"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none placeholder-slate-500"
              />
            </div>
          </div>

          {/* Members List */}
          <div>
            <label className="block text-slate-400 font-semibold mb-1.5">Group Members ({membersList.length})</label>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 mb-2">
              {membersList.map((m, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10">
                  <span className="font-semibold text-white">
                    {m.name} {m.isCurrentUser ? <span className="text-emerald-400 text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 ml-1.5">(You)</span> : ''}
                  </span>
                  {!m.isCurrentUser && (
                    <button
                      type="button"
                      onClick={() => handleRemoveMember(idx)}
                      aria-label={`Remove ${m.name}`}
                      className="text-slate-500 hover:text-rose-400 p-1 rounded"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Member inline */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add roommate name..."
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddMember(e);
                  }
                }}
                className="flex-1 px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white focus:border-emerald-500 focus:outline-none placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleAddMember}
                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition-all shrink-0 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold shadow-md shadow-emerald-500/20 transition-all active:scale-95"
            >
              Create Group
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
