import express from 'express';
import { readDB, writeDB } from '../data/store.js';
import { authenticateToken, requireGroupMember } from '../middleware/auth.js';

const router = express.Router();

// GET /api/settlements?groupId=xxx - Get all settlements for a group
router.get('/', authenticateToken, requireGroupMember, (req, res) => {
  const group = req.group;
  res.json({ settlements: group.settlements || [] });
});

// POST /api/settlements - Record a settlement
router.post('/', authenticateToken, requireGroupMember, (req, res) => {
  const { from, to, amount, method, note, upiTxnId } = req.body;
  const numAmount = Number(amount);

  if (!from || !to || isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Valid payer, receiver, and positive amount are required.' });
  }

  if (from === to) {
    return res.status(400).json({ error: 'Payer and receiver cannot be the same person.' });
  }

  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const targetGroup = db.groups[groupIndex];
  const fromMember = (targetGroup.members || []).find((m) => m.id === from);
  const toMember = (targetGroup.members || []).find((m) => m.id === to);

  if (!fromMember || !toMember) {
    return res.status(400).json({ error: 'Payer or receiver is not a member of this group.' });
  }

  // Only participants or group owner can record settlement
  if (req.user.id !== from && req.user.id !== to && req.user.id !== targetGroup.createdBy) {
    return res.status(403).json({ error: 'Only settlement participants or group owner can record this settlement.' });
  }

  const newSettlement = {
    id: `settle-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    from,
    to,
    fromName: fromMember.name,
    toName: toMember.name,
    amount: Math.round(numAmount * 100) / 100,
    method: typeof method === 'string' ? method : 'gpay',
    note: typeof note === 'string' && note.trim() ? note.trim() : 'Direct Settlement',
    upiTxnId: upiTxnId || null,
    recordedBy: req.user.id,
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
    status: 'confirmed'
  };

  if (!targetGroup.settlements) {
    targetGroup.settlements = [];
  }

  targetGroup.settlements.unshift(newSettlement);
  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to record settlement.' });
  }

  res.status(201).json({ settlement: newSettlement, group: targetGroup });
});

// DELETE /api/settlements/:id?groupId=xxx - Undo/Delete a recorded settlement
router.delete('/:id', authenticateToken, requireGroupMember, (req, res) => {
  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const targetGroup = db.groups[groupIndex];
  const settleIndex = (targetGroup.settlements || []).findIndex((s) => s.id === req.params.id);
  if (settleIndex === -1) {
    return res.status(404).json({ error: 'Settlement not found.' });
  }

  const settlement = targetGroup.settlements[settleIndex];
  if (req.user.id !== settlement.from && req.user.id !== settlement.to && req.user.id !== targetGroup.createdBy) {
    return res.status(403).json({ error: 'Not authorized to delete this settlement.' });
  }

  targetGroup.settlements.splice(settleIndex, 1);
  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to delete settlement.' });
  }

  res.json({ message: 'Settlement deleted successfully', group: targetGroup });
});

export default router;
