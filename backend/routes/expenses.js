import express from 'express';
import { readDB, writeDB } from '../data/store.js';
import { authenticateToken, requireGroupMember } from '../middleware/auth.js';

const router = express.Router();

// GET /api/expenses?groupId=xxx - Get expenses for a group (IDOR protected)
router.get('/', authenticateToken, requireGroupMember, (req, res) => {
  const group = req.group;
  res.json({ expenses: group.expenses || [] });
});

// POST /api/expenses - Add an expense to a group (IDOR protected)
router.post('/', authenticateToken, requireGroupMember, (req, res) => {
  const { title, amount, category, paidBy, date, splitType, participants, splits, notes } = req.body;
  const numAmount = Number(amount);

  if (!title || typeof title !== 'string' || !title.trim()) {
    return res.status(400).json({ error: 'Valid expense title is required.' });
  }

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number greater than 0.' });
  }

  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);
  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const payer = paidBy || req.user.id;

  // Validate payer is a member of this group
  if (!(group.members || []).some((m) => m.id === payer)) {
    return res.status(400).json({ error: 'The specified payer is not a member of this group.' });
  }

  // Validate participants are group members
  const validMemberIds = new Set((group.members || []).map((m) => m.id));
  const cleanParticipants = Array.isArray(participants) && participants.length > 0
    ? participants.filter((id) => validMemberIds.has(id))
    : (group.members || []).filter((m) => !m.isInactive).map((m) => m.id);

  if (cleanParticipants.length === 0) {
    return res.status(400).json({ error: 'At least one active member must participate in this expense.' });
  }

  // Validate custom splits if provided
  let cleanSplits = {};
  if (splits && typeof splits === 'object') {
    let totalSplitPaise = 0;
    Object.entries(splits).forEach(([mId, amt]) => {
      if (validMemberIds.has(mId)) {
        const val = Math.max(0, Number(amt) || 0);
        const p = Math.round(val * 100);
        totalSplitPaise += p;
        cleanSplits[mId] = p / 100;
      }
    });
    const totalExpPaise = Math.round(numAmount * 100);
    if (Object.keys(cleanSplits).length > 0 && Math.abs(totalSplitPaise - totalExpPaise) > 2) {
      return res.status(400).json({
        error: `Splits total (₹${(totalSplitPaise / 100).toFixed(2)}) must equal total amount (₹${(totalExpPaise / 100).toFixed(2)}).`
      });
    }
  }

  const newExpense = {
    id: `exp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    title: title.trim(),
    amount: Math.round(numAmount * 100) / 100,
    category: typeof category === 'string' && category.trim() ? category.trim() : 'other',
    paidBy: payer,
    date: date || new Date().toISOString().split('T')[0],
    splitType: splitType || 'equal',
    participants: cleanParticipants,
    splits: cleanSplits,
    notes: typeof notes === 'string' ? notes.trim() : '',
    createdBy: req.user.id,
    createdAt: new Date().toISOString()
  };

  if (!db.groups[groupIndex].expenses) db.groups[groupIndex].expenses = [];
  db.groups[groupIndex].expenses.unshift(newExpense);
  
  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to save expense.' });
  }

  res.status(201).json({ expense: newExpense, group: db.groups[groupIndex] });
});

// PUT /api/expenses/:id - Edit an expense (IDOR protected)
router.put('/:id', authenticateToken, requireGroupMember, (req, res) => {
  const { title, amount, category, paidBy, date, splitType, participants, splits, notes } = req.body;
  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);

  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const expIndex = (db.groups[groupIndex].expenses || []).findIndex((e) => e.id === req.params.id);
  if (expIndex === -1) {
    return res.status(404).json({ error: 'Expense not found.' });
  }

  const existingExp = db.groups[groupIndex].expenses[expIndex];
  const numAmount = amount !== undefined ? Number(amount) : existingExp.amount;

  if (isNaN(numAmount) || numAmount <= 0) {
    return res.status(400).json({ error: 'Amount must be a positive number greater than 0.' });
  }

  const validMemberIds = new Set((group.members || []).map((m) => m.id));

  db.groups[groupIndex].expenses[expIndex] = {
    ...existingExp,
    title: typeof title === 'string' && title.trim() ? title.trim() : existingExp.title,
    amount: Math.round(numAmount * 100) / 100,
    category: typeof category === 'string' && category.trim() ? category.trim() : existingExp.category,
    paidBy: paidBy && validMemberIds.has(paidBy) ? paidBy : existingExp.paidBy,
    date: date || existingExp.date,
    splitType: splitType || existingExp.splitType,
    participants: Array.isArray(participants) ? participants.filter((id) => validMemberIds.has(id)) : existingExp.participants,
    splits: splits && typeof splits === 'object' ? splits : existingExp.splits,
    notes: typeof notes === 'string' ? notes.trim() : existingExp.notes,
    updatedAt: new Date().toISOString()
  };

  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to update expense.' });
  }

  res.json({ expense: db.groups[groupIndex].expenses[expIndex], group: db.groups[groupIndex] });
});

// DELETE /api/expenses/:id?groupId=xxx - Delete an expense (IDOR protected)
router.delete('/:id', authenticateToken, requireGroupMember, (req, res) => {
  const db = readDB();
  const group = req.group;
  const groupIndex = db.groups.findIndex((g) => g.id === group.id);

  if (groupIndex === -1) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  db.groups[groupIndex].expenses = (db.groups[groupIndex].expenses || []).filter(
    (e) => e.id !== req.params.id
  );

  if (!writeDB(db)) {
    return res.status(500).json({ error: 'Failed to delete expense.' });
  }

  res.json({ message: 'Expense deleted successfully', group: db.groups[groupIndex] });
});

export default router;
