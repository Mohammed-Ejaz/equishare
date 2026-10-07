import React, { useState } from 'react';
import { 
  Users, 
  Check, 
  Plus, 
  UserPlus, 
  Trash2, 
  Sparkles, 
  CheckCircle2, 
  Link as LinkIcon,
  Pencil,
  AlertCircle
} from 'lucide-react';
import { isValidUpiId } from '../utils/formatters';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
];

export function GroupSettingsPage({
  group,
  currentUser,
  onOpenNewGroup,
  onAddMember,
  onRemoveMember,
  onUpdateGroup,
  onDeleteGroup
}) {
  // Add Member State
  const [showAddForm, setShowAddForm] = useState(false);
  const [memberName, setMemberName] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberUpi, setMemberUpi] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0]);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Group Details Edit State
  const [isEditingGroup, setIsEditingGroup] = useState(false);
  const [groupNameInput, setGroupNameInput] = useState(group?.name || '');
  const [groupDescInput, setGroupDescInput] = useState(group?.description || '');

  const inviteCode = group?.inviteCode || group?.id;
  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?join=${inviteCode}`
    : `?join=${inviteCode}`;

  const isOwner = currentUser?.id === group?.createdBy || (group?.members && group.members[0]?.isCurrentUser);

  const handleCopyInviteLink = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      setErrorMsg('Could not copy automatically. Please copy the URL from browser bar.');
    }
  };

  const handleAddSubmit = (e) => {
    e.preventDefault();
    setErrorMsg('');
    if (!memberName.trim()) {
      setErrorMsg('Please enter a roommate name.');
      return;
    }

    if ((group.members || []).some((m) => m.name.toLowerCase() === memberName.trim().toLowerCase())) {
      setErrorMsg('A member with this name already exists in the group.');
      return;
    }

    if (memberUpi.trim() && !isValidUpiId(memberUpi.trim())) {
      setErrorMsg('Please enter a valid UPI ID (e.g. username@okhdfcbank or 9876543210@paytm).');
      return;
    }

    if (onAddMember) {
      onAddMember({
        name: memberName.trim(),
        email: memberEmail.trim(),
        upiId: memberUpi.trim(),
        avatar: selectedAvatar
      });
      setSuccessMsg(`Added ${memberName.trim()} to ${group.name}!`);
      setMemberName('');
      setMemberEmail('');
      setMemberUpi('');
      setShowAddForm(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  const handleSaveGroupDetails = (e) => {
    e.preventDefault();
    if (!groupNameInput.trim()) return;
    if (onUpdateGroup) {
      onUpdateGroup(group.id, {
        name: groupNameInput.trim(),
        description: groupDescInput.trim()
      });
      setIsEditingGroup(false);
      setSuccessMsg('Group settings updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* 1. Group Info Banner */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {isEditingGroup ? (
            <form onSubmit={handleSaveGroupDetails} className="flex-1 space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Group Name</label>
                <input
                  type="text"
                  value={groupNameInput}
                  onChange={(e) => setGroupNameInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <input
                  type="text"
                  value={groupDescInput}
                  onChange={(e) => setGroupDescInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-xs"
                >
                  Save Changes
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingGroup(false)}
                  className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-xs"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">🏡</span>
                <h2 className="text-xl font-extrabold text-white tracking-tight">{group.name}</h2>
                {isOwner && (
                  <button
                    onClick={() => {
                      setGroupNameInput(group.name);
                      setGroupDescInput(group.description || '');
                      setIsEditingGroup(true);
                    }}
                    className="p-1 rounded-lg text-slate-400 hover:text-white transition-colors"
                    title="Edit group details"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              <p className="text-xs text-slate-400">{group.description}</p>
            </div>
          )}

          <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
            <button
              onClick={handleCopyInviteLink}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all active:scale-95"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <LinkIcon className="w-4 h-4" />}
              <span>{copiedLink ? 'Link Copied!' : 'Copy Invite Link'}</span>
            </button>
            <button
              onClick={onOpenNewGroup}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-all"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              <span>New Group</span>
            </button>
          </div>
        </div>
      </div>

      {/* Success Notification */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 2. Roommates & Members List */}
      <div className="glass-panel rounded-2xl p-6 border border-white/10">
        <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10 flex-wrap gap-2">
          <div>
            <h3 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" /> Active Roommates ({(group.members || []).length})
            </h3>
            <p className="text-xs text-slate-400">People splitting bills and sharing expenses in this space</p>
          </div>

          <button
            type="button"
            onClick={() => { setShowAddForm(!showAddForm); setErrorMsg(''); }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            <span>{showAddForm ? 'Close Form' : '+ Add Roommate'}</span>
          </button>
        </div>

        {/* Inline Add Member Form */}
        {showAddForm && (
          <form onSubmit={handleAddSubmit} className="mb-6 p-4 rounded-2xl bg-white/5 border border-emerald-500/30 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                Add New Roommate / Member
              </h4>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="text-slate-400 hover:text-white text-xs"
              >
                Cancel
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Roommate Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rahul, Maya..."
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 text-xs text-white placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email (Optional)</label>
                <input
                  type="email"
                  placeholder="rahul@example.com"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Receiver UPI ID (Optional)</label>
                <input
                  type="text"
                  placeholder="rahul@okaxis"
                  value={memberUpi}
                  onChange={(e) => setMemberUpi(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-emerald-500 text-xs text-white placeholder-slate-500 font-mono"
                />
              </div>
            </div>

            {/* Avatar Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Choose Avatar</label>
              <div className="flex items-center gap-2.5">
                {PRESET_AVATARS.map((av, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedAvatar(av)}
                    className={`w-9 h-9 rounded-full overflow-hidden border-2 transition-transform ${
                      selectedAvatar === av ? 'border-emerald-400 scale-110 ring-2 ring-emerald-400/40' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={av} alt="avatar" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 transition-all active:scale-95"
              >
                Add Member to Group
              </button>
            </div>
          </form>
        )}

        {/* Roommates Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(group.members || []).map((member) => {
            const isMemberOwner = member.id === group.createdBy || member.role === 'owner';
            const canRemove = isOwner && !isMemberOwner && member.id !== currentUser?.id;

            return (
              <div
                key={member.id}
                className="p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={member.avatar || PRESET_AVATARS[0]}
                    alt={member.name}
                    className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0"
                  />
                  <div className="min-w-0">
                    <span className="font-bold text-xs text-white block truncate">
                      {member.name} {member.isCurrentUser ? '(You)' : ''}
                    </span>
                    <span className="text-[10px] text-slate-400 block truncate">
                      {member.upiId ? `UPI: ${member.upiId}` : (member.email || 'Group Member')}
                    </span>
                  </div>
                </div>

                {canRemove && onRemoveMember && (
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${member.name} from ${group.name}?`)) {
                        onRemoveMember(member.id);
                      }
                    }}
                    title="Remove member"
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Danger Zone (Owner Delete Group) */}
      {isOwner && onDeleteGroup && (
        <div className="p-5 rounded-2xl bg-rose-950/20 border border-rose-500/30 flex items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-sm text-rose-300">Delete Expense Group</h4>
            <p className="text-xs text-slate-400">Permanently remove this group, its expenses, and settlements.</p>
          </div>
          <button
            onClick={() => {
              if (window.confirm(`Are you absolutely sure you want to delete "${group.name}"? All expenses in this group will be deleted.`)) {
                onDeleteGroup(group.id);
              }
            }}
            className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 text-xs font-bold transition-colors shrink-0"
          >
            Delete Group
          </button>
        </div>
      )}
    </div>
  );
}
