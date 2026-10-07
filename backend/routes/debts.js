import express from 'express';
import { readDB } from '../data/store.js';
import { authenticateToken, requireGroupMember } from '../middleware/auth.js';

const router = express.Router();

export function calculateNetBalances(members = [], expenses = [], settlements = []) {
  const balances = {};
  members.forEach((m) => {
    balances[m.id] = { id: m.id, name: m.name, paid: 0, share: 0, net: 0 };
  });

  // 1. Process Expenses
  expenses.forEach((expense) => {
    const amount = Number(expense.amount) || 0;
    const payerId = expense.paidBy;

    if (balances[payerId]) {
      balances[payerId].paid += amount;
    }

    const splits = expense.splits || {};
    const splitMemberIds = Object.keys(splits);

    if (splitMemberIds.length > 0) {
      splitMemberIds.forEach((mId) => {
        if (balances[mId]) {
          balances[mId].share += Number(splits[mId]) || 0;
        }
      });
    } else if (expense.participants && expense.participants.length > 0) {
      const splitAmount = amount / expense.participants.length;
      expense.participants.forEach((mId) => {
        if (balances[mId]) {
          balances[mId].share += splitAmount;
        }
      });
    }
  });

  // 2. Process Settlements (Payer owes less -> net increases; Receiver got paid -> net decreases)
  settlements.forEach((st) => {
    const amt = Number(st.amount) || 0;
    if (balances[st.from]) {
      balances[st.from].paid += amt;
    }
    if (balances[st.to]) {
      balances[st.to].share += amt;
    }
  });

  // 3. Compute Net in exact paise
  Object.keys(balances).forEach((id) => {
    balances[id].net = Math.round((balances[id].paid - balances[id].share) * 100) / 100;
  });

  return balances;
}

export function simplifyDebts(balances = {}, membersMap = {}) {
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([id, bal]) => {
    const net = Math.round(bal.net * 100) / 100;
    if (net < -0.01) {
      debtors.push({ id, amount: Math.abs(net) });
    } else if (net > 0.01) {
      creditors.push({ id, amount: net });
    }
  });

  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const transactions = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];
    const settlementAmount = Math.min(debtor.amount, creditor.amount);

    if (settlementAmount > 0.01) {
      transactions.push({
        id: `sim-${debtor.id}-${creditor.id}-${dIdx}-${cIdx}`,
        from: membersMap[debtor.id] || { id: debtor.id, name: 'Roommate' },
        to: membersMap[creditor.id] || { id: creditor.id, name: 'Roommate' },
        amount: Math.round(settlementAmount * 100) / 100
      });
    }

    debtor.amount -= settlementAmount;
    creditor.amount -= settlementAmount;

    if (debtor.amount < 0.01) dIdx++;
    if (creditor.amount < 0.01) cIdx++;
  }

  return transactions;
}

// GET /api/debts/simplify?groupId=xxx (IDOR protected)
router.get('/simplify', authenticateToken, requireGroupMember, (req, res) => {
  const db = readDB();
  const group = db.groups.find((g) => g.id === req.query.groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const membersMap = {};
  (group.members || []).forEach((m) => { membersMap[m.id] = m; });

  const balances = calculateNetBalances(group.members || [], group.expenses || [], group.settlements || []);
  const transactions = simplifyDebts(balances, membersMap);

  res.json({ balances, transactions });
});

export default router;
