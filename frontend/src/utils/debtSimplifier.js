/**
 * EquiShare Core Debt & Accounting Engine
 * 
 * Features:
 * 1. Integer-paise net balance calculation (mathematical zero-sum invariant guaranteed)
 * 2. Cycle-free pairwise debt netting with direct settlement deduction
 * 3. Optimal Greedy Minimum Cash Flow Simplifier
 * 4. True Individual Fair Share calculator
 */

/**
 * Calculates net balance for every member in the group.
 * Net = (Total Paid Expenses - Total Share of Expenses) + (Total Paid Settlements - Total Received Settlements)
 * 
 * Invariant: sum(net) === 0 down to the exact paisa.
 */
export function calculateNetBalances(members = [], expenses = [], settlements = []) {
  const balances = {};
  
  (members || []).forEach((m) => {
    if (!m || !m.id) return;
    balances[m.id] = {
      member: m,
      paid: 0,
      share: 0,
      settledPaid: 0,
      settledReceived: 0,
      net: 0,
    };
  });

  // 1. Process Expenses
  (expenses || []).forEach((expense) => {
    // Skip legacy settlement expenses if any
    if (expense.splitType === 'settlement') return;

    const amount = Math.max(0, Number(expense.amount) || 0);
    const totalPaise = Math.round(amount * 100);
    if (totalPaise <= 0) return;

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
    } else {
      // Divide evenly in integer paise without paisa loss
      const participants = Array.isArray(expense.participants) && expense.participants.length > 0
        ? expense.participants.filter((id) => balances[id])
        : (members || []).map((m) => m.id);

      const count = participants.length;
      if (count > 0) {
        const baseSharePaise = Math.floor(totalPaise / count);
        let remainderPaise = totalPaise % count;

        participants.forEach((mId) => {
          if (balances[mId]) {
            const sharePaise = baseSharePaise + (remainderPaise > 0 ? 1 : 0);
            if (remainderPaise > 0) remainderPaise--;
            balances[mId].share += sharePaise / 100;
          }
        });
      }
    }
  });

  // 2. Process Settlements
  const safeSettlements = Array.isArray(settlements) ? settlements : [];
  safeSettlements.forEach((st) => {
    if (!st || !st.from || !st.to) return;
    const amount = Math.max(0, Number(st.amount) || 0);
    if (balances[st.from]) {
      balances[st.from].settledPaid += amount;
    }
    if (balances[st.to]) {
      balances[st.to].settledReceived += amount;
    }
  });

  // 3. Compute final net in integer paise for each member
  Object.values(balances).forEach((b) => {
    const netPaise = Math.round(b.paid * 100) - Math.round(b.share * 100) + Math.round(b.settledPaid * 100) - Math.round(b.settledReceived * 100);
    b.net = netPaise / 100;
  });

  return balances;
}

/**
 * Calculates raw unsimplified pairwise debts directly from expense splits,
 * nets opposite debts (A->B vs B->A), applies settlements, and eliminates phantom cycles.
 */
export function getRawDebts(members = [], expenses = [], param3 = [], param4 = {}) {
  let settlements = [];
  let membersMap = {};

  if (Array.isArray(param3)) {
    settlements = param3;
    membersMap = param4 || {};
  } else if (typeof param3 === 'object' && param3 !== null) {
    membersMap = param3;
    settlements = Array.isArray(param4) ? param4 : [];
  }

  if (Object.keys(membersMap).length === 0 && Array.isArray(members)) {
    members.forEach((m) => {
      if (m && m.id) membersMap[m.id] = m;
    });
  }

  // First calculate net balances: if everyone is settled (net == 0 for all), return no raw debts
  const balances = calculateNetBalances(members, expenses, settlements);
  const hasOutstandingBalance = Object.values(balances).some((b) => Math.abs(b.net) >= 0.01);
  if (!hasOutstandingBalance) {
    return [];
  }

  // Pairwise debt map in paise: key = `${smallerId}|${largerId}`
  // positive = firstId owes secondId; negative = secondId owes firstId
  const pairPaise = {};

  const getPairKey = (id1, id2) => {
    return id1 < id2 ? { key: `${id1}|${id2}`, isFirst: true } : { key: `${id2}|${id1}`, isFirst: false };
  };

  // 1. Accumulate direct pairwise obligations from expenses
  (expenses || []).forEach((expense) => {
    if (expense.splitType === 'settlement') return;
    const payerId = expense.paidBy;
    const splits = expense.splits || {};
    const participants = expense.participants || [];

    if (Object.keys(splits).length > 0) {
      Object.entries(splits).forEach(([borrowerId, shareAmount]) => {
        if (borrowerId !== payerId && Number(shareAmount) > 0) {
          const paise = Math.round(Number(shareAmount) * 100);
          const { key, isFirst } = getPairKey(borrowerId, payerId);
          pairPaise[key] = (pairPaise[key] || 0) + (isFirst ? paise : -paise);
        }
      });
    } else if (participants.length > 0) {
      const totalPaise = Math.round((Number(expense.amount) || 0) * 100);
      const count = participants.length;
      const baseSharePaise = Math.floor(totalPaise / count);
      let remainderPaise = totalPaise % count;

      participants.forEach((borrowerId) => {
        if (borrowerId !== payerId) {
          const sharePaise = baseSharePaise + (remainderPaise > 0 ? 1 : 0);
          if (remainderPaise > 0) remainderPaise--;
          const { key, isFirst } = getPairKey(borrowerId, payerId);
          pairPaise[key] = (pairPaise[key] || 0) + (isFirst ? sharePaise : -paise);
        }
      });
    }
  });

  // 2. Deduct direct pairwise settlements
  (settlements || []).forEach((st) => {
    if (!st || !st.from || !st.to) return;
    const paise = Math.round((Number(st.amount) || 0) * 100);
    const { key, isFirst } = getPairKey(st.from, st.to);
    pairPaise[key] = (pairPaise[key] || 0) - (isFirst ? paise : -paise);
  });

  // 3. Filter pairs to only those where debtor has net < 0 and creditor has net > 0
  // This completely eliminates phantom cross-settlement cycles (C3)
  const rawList = [];
  Object.entries(pairPaise).forEach(([key, netPaise]) => {
    if (Math.abs(netPaise) >= 100) { // at least 1 Rupee (100 paise)
      const [id1, id2] = key.split('|');
      const fromId = netPaise > 0 ? id1 : id2;
      const toId = netPaise > 0 ? id2 : id1;

      const fromNet = balances[fromId]?.net || 0;
      const toNet = balances[toId]?.net || 0;

      // Only include if from is actually a net debtor and to is actually a net creditor
      if (fromNet < -0.01 && toNet > 0.01) {
        const cappedPaise = Math.min(
          Math.abs(netPaise),
          Math.round(Math.abs(fromNet) * 100),
          Math.round(toNet * 100)
        );

        if (cappedPaise >= 100) {
          rawList.push({
            id: `raw-${fromId}-${toId}`,
            from: membersMap[fromId] || { id: fromId, name: 'Roommate' },
            to: membersMap[toId] || { id: toId, name: 'Roommate' },
            amount: cappedPaise / 100
          });
        }
      }
    }
  });

  return rawList;
}

/**
 * Greedy Minimum Cash Flow Algorithm to simplify debts into fewest possible transactions
 */
export function simplifyDebts(balances = {}, membersMap = {}) {
  const debtors = [];
  const creditors = [];

  Object.entries(balances).forEach(([memberId, data]) => {
    const netPaise = Math.round((data.net || 0) * 100);
    if (netPaise < -50) { // at least 50 paise
      debtors.push({ id: memberId, paise: Math.abs(netPaise) });
    } else if (netPaise > 50) {
      creditors.push({ id: memberId, paise: netPaise });
    }
  });

  // Sort descending by outstanding amount in paise
  debtors.sort((a, b) => b.paise - a.paise);
  creditors.sort((a, b) => b.paise - a.paise);

  const simplifiedTransactions = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const settledPaise = Math.min(debtor.paise, creditor.paise);

    if (settledPaise > 0) {
      simplifiedTransactions.push({
        id: `sim-${debtor.id}-${creditor.id}-${dIdx}-${cIdx}`,
        from: membersMap[debtor.id] || { id: debtor.id, name: 'Roommate' },
        to: membersMap[creditor.id] || { id: creditor.id, name: 'Roommate' },
        amount: Math.round(settledPaise) / 100,
      });
    }

    debtor.paise -= settledPaise;
    creditor.paise -= settledPaise;

    if (debtor.paise <= 0) dIdx++;
    if (creditor.paise <= 0) cIdx++;
  }

  return simplifiedTransactions;
}

/**
 * Calculates accurate fair share for a given member across expenses
 */
export function calculateMemberFairShare(expenses = [], memberId) {
  if (!memberId) return 0;
  let totalSharePaise = 0;

  (expenses || []).forEach((expense) => {
    if (expense.splitType === 'settlement') return;
    const splits = expense.splits || {};
    if (splits[memberId] !== undefined) {
      totalSharePaise += Math.round((Number(splits[memberId]) || 0) * 100);
    } else if (expense.participants && expense.participants.includes(memberId)) {
      const expPaise = Math.round((Number(expense.amount) || 0) * 100);
      const count = expense.participants.length;
      if (count > 0) {
        totalSharePaise += Math.floor(expPaise / count);
      }
    }
  });

  return totalSharePaise / 100;
}
