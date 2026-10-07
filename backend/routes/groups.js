import express from 'express';
import crypto from 'crypto';
import { readDB, writeDB } from '../data/store.js';
import { authenticateToken, requireGroupMember } from '../middleware/auth.js';

const router = express.Router();

// GET /api/groups - Get all groups for the authenticated user
router.get('/', authenticateToken, (req, res) => {
  const db = readDB();
  const userId = req.user.id;
  const userEmail = req.user.email?.toLowerCase();

  const userGroups = db.groups.filter((g) =>
    g.members && g.members.some((m) => m.id === userId || (m.email && userEmail && m.email.toLowerCase() === userEmail))
  );

  res.json({ groups: userGroups });
});

// GET /api/groups/invite/:inviteCode - Public lookup of group by inviteCode
router.get('/invite/:inviteCode', (req, res) => {
  const db = readDB();
  const group = db.groups.find((g) => g.inviteCode === req.params.inviteCode);
  if (!group) {
    return res.status(404).json({ error: 'Invite link is invalid or expired.' });
  }

  res.json({
    group: {
      id: group.id,
      name: group.name,
      description: group.description,
      currency: group.currency,
      memberCount: (group.members || []).length,
      inviteCode: group.inviteCode
    }
  });
});

// POST /api/groups/join - Join group via inviteCode
router.post('/join', authenticateToken, (req, res) => {
  const { inviteCode } = req.body;
  if (!inviteCode || typeof inviteCode !== 'string') {
    return res.status(400).json({ error: 'Valid inviteCode is required.' });
  }

  const db = readDB();
  const group = db.groups.find((g) => g.inviteCode === inviteCode.trim());
  if (!group) {
    return res.status(404).json({ error: 'Invite link is invalid or expired.' });
  }

  const userId = req.user.id;
  const isAlreadyMember = (group.members || []).some((m) => m.id === userId);

  if (!isAlreadyMember) {
    const userMember = {
      id: userId,
      name: req.user.name,
      email: req.user.email || '',
      avatar: req.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      color: '#10B981',
      role: 'member'
    };
    if (!group.members) group.members = [];
    group.members.push(userMember);
    if (!writeDB(db)) {
      return res.status(500).json({ error: 'Failed to save group join data.' });
    }
  }

  res.json({ message: 'Successfully joined group', group });
});

// GET /api/groups/:id - Get single group by ID (IDOR protected)
router.get('/:id', authenticateToken, requireGroupMember, (req, res) => {
  res.json({ group: req.group });
});

// POST /api/groups - Create a new group
router.post('/', authenticateToken, (req, res) => {
  const { name, description, currency, members } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Valid group name is required.' });
  }

  const db = readDB();
  const ownerMember = {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email || '',
    upiId: req.user.upiId || '',
    avatar: req.user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
    color: '#10B981',
    role: 'owner',
    isCurrentUser: true
  };

  const initialMembers = Array.isArray(members) && members.length > 0 
    ? members.map((m) => ({
        id: m.id || `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: typeof m.name === 'string' ? m.name.trim() : 'Roommate',
        email: typeof m.email === 'string' ? m.email.trim().toLowerCase() : '',
        upiId: typeof m.upiId === 'string' ? m.upiId.trim() : '',
        avatar: m.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
        color: m.color || '#6366F1',
        role: m.id === req.user.id ? 'owner' : 'member'
      }))
    : [ownerMember];

  // Ensure owner is always in members list
  if (!initialMembers.some((m) => m.id === req.user.id)) {
    initialMembers.unshift(ownerMember);
  }

  const randomInviteCode = crypto.randomBytes(6).toString('hex');

  const newGroup = {
    id: `group-${Date.now()}`,
    name: name.trim(),
    description: typeof description === 'string' ? description.trim() : 'Shared expenses space',
    currency: currency || '₹',
    createdBy: req.user.id,
    inviteCode: randomInviteCode,
    members: initialMembers,
    expenses: [],
    supplies: [],
    settlements: []
  };

  db.groups.push(newGroup);
  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to create group.' });
  }

  res.status(201).json({ group: newGroup });
});

// POST /api/groups/:id/members - Add member to a group (IDOR protected)
router.post('/:id/members', authenticateToken, requireGroupMember, (req, res) => {
  const { name, email, upiId, avatar, color } = req.body;
  if (!name || typeof name !== 'string' || !name.trim()) {
    return res.status(400).json({ error: 'Member name is required.' });
  }

  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const trimmedName = name.trim();

  // Check duplicate member
  const exists = (group.members || []).some(
    (m) => m.name.toLowerCase() === trimmedName.toLowerCase() || 
           (email && m.email && m.email.toLowerCase() === email.trim().toLowerCase())
  );
  if (exists) {
    return res.status(409).json({ error: 'A member with this name or email already exists in the group.' });
  }

  const newMember = {
    id: `m-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    name: trimmedName,
    email: typeof email === 'string' ? email.trim().toLowerCase() : '',
    upiId: typeof upiId === 'string' ? upiId.trim() : '',
    avatar: avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    color: color || '#6366F1',
    role: 'member'
  };

  if (!db.groups[groupIndex].members) db.groups[groupIndex].members = [];
  db.groups[groupIndex].members.push(newMember);
  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to add member.' });
  }

  res.status(201).json({ group: db.groups[groupIndex], member: newMember });
});

// DELETE /api/groups/:id/members/:memberId - Remove member with expense safeguard
router.delete('/:id/members/:memberId', authenticateToken, requireGroupMember, (req, res) => {
  const { memberId } = req.params;
  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);

  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const targetGroup = db.groups[groupIndex];

  // Role check: Only group creator/owner can remove other members
  if (req.user.id !== targetGroup.createdBy) {
    return res.status(403).json({ error: 'Only the group owner can remove members.' });
  }

  // Cannot remove group creator/owner
  if (memberId === targetGroup.createdBy) {
    return res.status(400).json({ error: 'The group owner cannot be removed.' });
  }

  // Safeguard: Check if member is part of any expenses
  const hasExpenses = (targetGroup.expenses || []).some(
    (e) => e.paidBy === memberId || (e.participants && e.participants.includes(memberId)) || (e.splits && e.splits[memberId])
  );

  if (hasExpenses) {
    // Instead of deleting and breaking ledgers into "Unknown", mark them as inactive without duplicating suffix
    targetGroup.members = targetGroup.members.map((m) => {
      if (m.id === memberId) {
        const cleanName = m.name.replace(/\s*\(Past Member\)$/i, '').trim();
        return { ...m, isInactive: true, name: `${cleanName} (Past Member)` };
      }
      return m;
    });
  } else {
    targetGroup.members = targetGroup.members.filter((m) => m.id !== memberId);
  }

  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to update member status.' });
  }

  res.json({ message: 'Member updated successfully', group: targetGroup });
});

// PUT /api/groups/:id - Update group settings (IDOR protected)
router.put('/:id', authenticateToken, requireGroupMember, (req, res) => {
  const { name, description, currency } = req.body;
  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);

  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  if (typeof name === 'string' && name.trim()) db.groups[groupIndex].name = name.trim();
  if (typeof description === 'string') db.groups[groupIndex].description = description.trim();
  if (typeof currency === 'string' && currency.trim()) db.groups[groupIndex].currency = currency.trim();

  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to update group.' });
  }

  res.json({ group: db.groups[groupIndex] });
});

// DELETE /api/groups/:id - Delete group (Owner only)
router.delete('/:id', authenticateToken, requireGroupMember, (req, res) => {
  const db = readDB();
  const group = req.group;

  if (req.user.id !== group.createdBy) {
    return res.status(403).json({ error: 'Only the group owner can delete this group.' });
  }

  db.groups = db.groups.filter((g) => g.id !== group.id);
  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to delete group.' });
  }

  res.json({ message: 'Group deleted successfully' });
});

export default router;
