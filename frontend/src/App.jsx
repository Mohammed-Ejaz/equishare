import React, { useState, useMemo, useEffect } from 'react';
import { INITIAL_GROUPS, INITIAL_USERS } from './data/mockData';
import { calculateNetBalances, simplifyDebts, getRawDebts } from './utils/debtSimplifier';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardPage } from './pages/DashboardPage';
import { ExpensesPage } from './pages/ExpensesPage';
import { DebtsPage } from './pages/DebtsPage';
import { GroceriesPage } from './pages/GroceriesPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { GroupSettingsPage } from './pages/GroupSettingsPage';
import { CalculatorPage } from './pages/CalculatorPage';
import { SettingsPage } from './pages/SettingsPage';
import { LandingPage } from './pages/LandingPage';
import { AddExpenseModal } from './components/AddExpenseModal';
import { ReceiptScannerModal } from './components/ReceiptScannerModal';
import { SettleModal } from './components/SettleModal';
import { NewGroupModal } from './components/NewGroupModal';
import { AuthModal } from './components/AuthModal';
import { LogoutModal } from './components/LogoutModal';
import { AnimatedBackground } from './components/AnimatedBackground';
import { InteractiveCursor } from './components/InteractiveCursor';
import { api } from './services/api';
import { getLocalDateString } from './utils/formatters';
import { normalizeCategory } from './utils/categories';


export default function App() {
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('equishare_users');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .filter((u) => !['m1', 'm2', 'm3', 'm4'].includes(u.id))
        .map((u) => ({
          ...u,
          // Clean legacy fake auto-generated "@upi" handles
          upiId: (u.upiId && u.upiId.endsWith('@upi')) ? '' : (u.upiId || '')
        }));
    } catch {
      return [];
    }
  });

  const [currentUserId, setCurrentUserId] = useState(() => {
    const saved = localStorage.getItem('equishare_current_user_id');
    if (['m1', 'm2', 'm3', 'm4'].includes(saved)) return null;
    return saved || null;
  });

  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('equishare_groups');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      const clean = parsed
        .filter((g) => !['group-apt402', 'group-goa', 'group-lunch-squad', 'group-goa-trip'].includes(g.id))
        .map((g) => ({
          ...g,
          members: (g.members || []).map((m) => ({
            ...m,
            upiId: (m.upiId && m.upiId.endsWith('@upi')) ? '' : (m.upiId || '')
          })),
          expenses: (g.expenses || []).map((e) => {
            let catSource = e.category;
            if (e.supplyId) {
              const linkedSupply = (g.supplies || []).find((s) => s.id === e.supplyId);
              if (linkedSupply?.category) {
                catSource = linkedSupply.category;
              }
            }
            return {
              ...e,
              category: normalizeCategory(catSource, e.title)
            };
          })
        }));
      // Deduplicate any groups with identical name and members
      const seen = new Set();
      return clean.filter((g) => {
        const memberIds = (g.members || []).map((m) => m.id || m.email || m.name).sort().join('|');
        const key = `${g.name}_${memberIds}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    } catch {
      return [];
    }
  });


  const [activeGroupId, setActiveGroupId] = useState(() => {
    const saved = localStorage.getItem('equishare_active_group_id');
    return saved || groups[0]?.id || null;
  });

  const [activePage, setActivePage] = useState(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '').trim();
      const validPages = ['dashboard', 'expenses', 'debts', 'calculator', 'groceries', 'analytics', 'members', 'settings'];
      if (validPages.includes(hash)) return hash;
      const saved = localStorage.getItem('equishare_active_page');
      if (validPages.includes(saved)) return saved;
    }
    return 'dashboard';
  });

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // App Settings state with persistence (dark, dim, light)
  const [theme, setTheme] = useState(() => {
    const saved = localStorage.getItem('equishare_theme');
    return (saved === 'dim' || saved === 'light' || saved === 'dark') ? saved : 'dark';
  });
  const [defaultPaymentApp, setDefaultPaymentApp] = useState(() => localStorage.getItem('equishare_default_payment') || 'gpay');

  // Modals state
  const [isAddExpenseOpen, setIsAddExpenseOpen] = useState(false);
  const [initialExpenseAmount, setInitialExpenseAmount] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isNewGroupOpen, setIsNewGroupOpen] = useState(false);
  const [settleDebtTarget, setSettleDebtTarget] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('signin'); // 'signin' | 'signup' | 'profile' | 'switch'
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // Sync settings & auth state to localStorage & URL hash
  useEffect(() => {
    localStorage.setItem('equishare_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('equishare_default_payment', defaultPaymentApp);
  }, [defaultPaymentApp]);

  useEffect(() => {
    localStorage.setItem('equishare_groups', JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    if (activeGroupId) {
      localStorage.setItem('equishare_active_group_id', activeGroupId);
    }
  }, [activeGroupId]);

  useEffect(() => {
    if (activePage && activePage !== 'landing') {
      localStorage.setItem('equishare_active_page', activePage);
      if (typeof window !== 'undefined' && window.location.hash.replace('#', '') !== activePage) {
        window.location.hash = activePage;
      }
    }
  }, [activePage]);

  // Handle browser back / forward navigation via hash change
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').trim();
      const validPages = ['dashboard', 'expenses', 'debts', 'calculator', 'groceries', 'analytics', 'members', 'settings'];
      if (validPages.includes(hash)) {
        setActivePage(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('equishare_users', JSON.stringify(users));
  }, [users]);

  useEffect(() => {
    if (currentUserId) {
      localStorage.setItem('equishare_current_user_id', currentUserId);
    } else {
      localStorage.removeItem('equishare_current_user_id');
    }
  }, [currentUserId]);

  // Current Logged In User
  const currentUser = useMemo(() => {
    if (!currentUserId) return null;
    return users.find((u) => u.id === currentUserId) || null;
  }, [users, currentUserId]);

  const isLoggedIn = Boolean(currentUser);

  // Groups scoped strictly to the active logged in user
  const userGroups = useMemo(() => {
    if (!currentUser) return [];
    return groups.filter((g) =>
      g.members && g.members.some((m) => m.id === currentUser.id || (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase()))
    );
  }, [groups, currentUser]);

  // If activeGroupId is not part of the user's groups, auto-sync to their first group
  useEffect(() => {
    if (userGroups.length > 0 && !userGroups.some((g) => g.id === activeGroupId)) {
      setActiveGroupId(userGroups[0].id);
    }
  }, [userGroups, activeGroupId]);

  // Active Group with user perspective
  const activeGroup = useMemo(() => {
    // When logged in, strictly scope to the logged in user's groups; never leak global mock groups
    const list = currentUser ? userGroups : groups;
    let rawGroup = list.find((g) => g.id === activeGroupId);

    if (!rawGroup && list.length > 0) {
      rawGroup = list[0];
    }

    if (!rawGroup) {
      rawGroup = {
        id: currentUser ? `group-${currentUser.id}` : 'default-space',
        name: currentUser ? `${currentUser.name.split(' ')[0]}'s Space 🏠` : 'Personal Space 🏠',
        description: 'Personal expense ledger & roommate splits',
        currency: '₹',
        members: currentUser ? [{
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
          email: currentUser.email,
          color: '#10B981',
          isCurrentUser: true
        }] : [],
        expenses: [],
        supplies: []
      };
    }

    // Map members to mark the authenticated user as current user
    const updatedMembers = (rawGroup.members || []).map((m) => ({
      ...m,
      isCurrentUser: currentUser ? (m.id === currentUser.id || (m.email && currentUser.email && m.email.toLowerCase() === currentUser.email.toLowerCase())) : false
    }));

    return {
      ...rawGroup,
      members: updatedMembers,
      expenses: rawGroup.expenses || [],
      supplies: rawGroup.supplies || []
    };
  }, [userGroups, groups, activeGroupId, currentUser]);

  // Members Map
  const membersMap = useMemo(() => {
    const map = {};
    activeGroup.members.forEach((m) => {
      map[m.id] = m;
    });
    return map;
  }, [activeGroup.members]);

  // Balances & Debt Simplification Algorithm
  const balances = useMemo(() => {
    return calculateNetBalances(activeGroup.members, activeGroup.expenses, activeGroup.settlements || []);
  }, [activeGroup.members, activeGroup.expenses, activeGroup.settlements]);

  const simplifiedDebts = useMemo(() => {
    return simplifyDebts(balances, membersMap);
  }, [balances, membersMap]);

  const rawDebts = useMemo(() => {
    return getRawDebts(activeGroup.members, activeGroup.expenses, activeGroup.settlements || [], membersMap);
  }, [activeGroup.members, activeGroup.expenses, membersMap, activeGroup.settlements]);


  // Current logged in user net balance
  const currentNetBalance = useMemo(() => {
    const activeMember = activeGroup.members.find((m) => m.isCurrentUser) || activeGroup.members[0];
    return balances[activeMember?.id]?.net || 0;
  }, [activeGroup.members, balances]);

  // Handlers
  const handleAddExpense = (newExpense) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroupId) {
          // If editing an existing expense
          const existingIndex = g.expenses.findIndex((e) => e.id === newExpense.id);
          if (existingIndex >= 0) {
            const updated = [...g.expenses];
            updated[existingIndex] = newExpense;
            return { ...g, expenses: updated };
          }
          return {
            ...g,
            expenses: [newExpense, ...g.expenses]
          };
        }
        return g;
      })
    );
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setIsAddExpenseOpen(true);
  };

  const handleDeleteExpense = (expenseId) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroupId) {
          return {
            ...g,
            expenses: g.expenses.filter((e) => e.id !== expenseId)
          };
        }
        return g;
      })
    );
  };

  const handleAddSupply = (newSupply) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroupId) {
          return {
            ...g,
            supplies: [newSupply, ...(g.supplies || [])]
          };
        }
        return g;
      })
    );
  };

  const handleUpdateSupplyStatus = (supplyId, status) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroupId) {
          const supplyItem = (g.supplies || []).find((s) => s.id === supplyId);
          const expenseId = `exp-supply-${supplyId}`;

          if (status === 'needed') {
            // Undo/uncheck tick mark: remove any restocked expense linked to this supply item
            return {
              ...g,
              supplies: (g.supplies || []).map((s) =>
                s.id === supplyId ? { ...s, status: 'needed', expenseId: null } : s
              ),
              expenses: (g.expenses || []).filter(
                (e) => e.supplyId !== supplyId && e.id !== expenseId && e.id !== supplyItem?.expenseId
              )
            };
          } else {
            // Marking as purchased: create/link restocked expense if amount > 0
            const activeMember = g.members?.find((m) => m.isCurrentUser) || g.members?.[0];
            const amount = Number(supplyItem?.estimatedPrice) || 0;
            let updatedExpenses = g.expenses || [];

            if (amount > 0 && activeMember && g.members?.length > 0) {
              const n = g.members.length;
              const totalPaise = Math.round(amount * 100);
              const baseShare = Math.floor(totalPaise / n);
              let remainder = totalPaise % n;

              const splits = {};
              g.members.forEach((m) => {
                let memberPaise = baseShare;
                if (remainder > 0) {
                  memberPaise += 1;
                  remainder -= 1;
                }
                splits[m.id] = memberPaise / 100;
              });

              const newExpense = {
                id: expenseId,
                supplyId: supplyId,
                title: `${supplyItem.name} (Restocked)`,
                amount,
                category: normalizeCategory(supplyItem?.category, supplyItem?.name),
                paidBy: activeMember.id,
                date: getLocalDateString(),
                splitType: 'equal',
                participants: g.members.map((m) => m.id),
                splits,
                notes: `Communal item purchased by ${activeMember.name}`
              };

              updatedExpenses = [
                newExpense,
                ...updatedExpenses.filter(
                  (e) => e.supplyId !== supplyId && e.id !== expenseId && e.id !== supplyItem?.expenseId
                )
              ];
            }

            return {
              ...g,
              supplies: (g.supplies || []).map((s) =>
                s.id === supplyId ? { ...s, status: 'purchased', expenseId } : s
              ),
              expenses: updatedExpenses
            };
          }
        }
        return g;
      })
    );
  };

  const handleDeleteSupply = (supplyId) => {
    const expenseId = `exp-supply-${supplyId}`;
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroupId) {
          const supplyItem = (g.supplies || []).find((s) => s.id === supplyId);
          return {
            ...g,
            supplies: (g.supplies || []).filter((s) => s.id !== supplyId),
            expenses: (g.expenses || []).filter(
              (e) => e.supplyId !== supplyId && e.id !== expenseId && e.id !== supplyItem?.expenseId
            )
          };
        }
        return g;
      })
    );
  };

  const handleConvertSupplyToExpense = (supply) => {
    const activeMember = activeGroup.members.find((m) => m.isCurrentUser) || activeGroup.members[0];
    const amount = Number(supply.estimatedPrice) || 0;
    if (amount <= 0) return;

    const n = activeGroup.members.length;
    const totalPaise = Math.round(amount * 100);
    const baseShare = Math.floor(totalPaise / n);
    let remainder = totalPaise % n;

    const splits = {};
    activeGroup.members.forEach((m) => {
      let memberPaise = baseShare;
      if (remainder > 0) {
        memberPaise += 1;
        remainder -= 1;
      }
      splits[m.id] = memberPaise / 100;
    });

    const expenseId = `exp-supply-${supply.id}`;
    const newExpense = {
      id: expenseId,
      supplyId: supply.id,
      title: `${supply.name} (Restocked)`,
      amount,
      category: normalizeCategory(supply.category, supply.name),
      paidBy: activeMember.id,
      date: getLocalDateString(),
      splitType: 'equal',
      participants: activeGroup.members.map((m) => m.id),
      splits,
      notes: `Communal item purchased by ${activeMember.name}`
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroupId) {
          const filteredExpenses = (g.expenses || []).filter(
            (e) => e.supplyId !== supply.id && e.id !== expenseId && e.id !== supply.expenseId
          );
          return {
            ...g,
            supplies: (g.supplies || []).map((s) =>
              s.id === supply.id ? { ...s, status: 'purchased', expenseId } : s
            ),
            expenses: [newExpense, ...filteredExpenses]
          };
        }
        return g;
      })
    );
  };


  const handleConfirmSettlement = (settlement) => {
    const newSettlement = {
      id: `settle-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      from: settlement.from,
      to: settlement.to,
      amount: settlement.amount,
      method: settlement.method || 'gpay',
      note: settlement.note || 'Settlement',
      date: new Date().toISOString()
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroupId) {
          return {
            ...g,
            settlements: [newSettlement, ...(g.settlements || [])]
          };
        }
        return g;
      })
    );
  };

  const handleDeleteSettlement = (settlementId) => {
    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroupId) {
          return {
            ...g,
            settlements: (g.settlements || []).filter((s) => s.id !== settlementId)
          };
        }
        return g;
      })
    );
  };

  const handleCreateGroup = (newGroup) => {
    setGroups((prev) => [newGroup, ...prev]);
    setActiveGroupId(newGroup.id);
    setActivePage('dashboard');
  };

  const handleUpdateGroup = (updatedGroup) => {
    setGroups((prev) => prev.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
  };

  const handleDeleteGroup = (groupId) => {
    const remaining = groups.filter((g) => g.id !== groupId);
    setGroups(remaining);
    if (activeGroupId === groupId) {
      setActiveGroupId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleAddMemberToGroup = (memberData) => {
    const avatarList = [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&auto=format&fit=crop&q=80'
    ];
    const colors = ['#10B981', '#6366F1', '#EC4899', '#F59E0B', '#3B82F6', '#14B8A6'];
    const count = activeGroup.members.length;

    const newMember = {
      id: `m-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: memberData.name.trim(),
      email: memberData.email?.trim() || '',
      upiId: memberData.upiId?.trim() || '',
      avatar: memberData.avatar || avatarList[count % avatarList.length],
      color: colors[count % colors.length],
      isCurrentUser: false
    };

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroup.id) {
          return {
            ...g,
            members: [...g.members, newMember]
          };
        }
        return g;
      })
    );
  };

  const handleRemoveMemberFromGroup = (memberId) => {
    // Check if member has existing expenses or debts to protect ledger
    const hasExpenses = (activeGroup.expenses || []).some(
      (e) => e.paidBy === memberId || (e.participants && e.participants.includes(memberId))
    );
    if (hasExpenses) {
      alert('Cannot delete this member because they have recorded expenses or splits in this group.');
      return;
    }

    setGroups((prev) =>
      prev.map((g) => {
        if (g.id === activeGroup.id) {
          return {
            ...g,
            members: g.members.filter((m) => m.id !== memberId)
          };
        }
        return g;
      })
    );
  };

  const handleOpenAuth = (mode = 'signin') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  // Check if there is an active invite in URL query param
  const getInviteGroupId = () => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('join') || params.get('invite') || params.get('code') || null;
    }
    return null;
  };

  const handleLogin = (user) => {
    setCurrentUserId(user.id);
    const inviteGroupId = getInviteGroupId();

    if (inviteGroupId) {
      const targetInviteGroup = groups.find((g) => g.id === inviteGroupId || g.inviteCode === inviteGroupId);
      if (targetInviteGroup) {
        const isAlreadyMember = targetInviteGroup.members?.some(
          (m) => m.id === user.id || (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase())
        );
        if (!isAlreadyMember) {
          const userMember = {
            id: user.id,
            name: user.name,
            avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
            email: user.email,
            upiId: user.upiId || '',
            color: '#10B981',
            isCurrentUser: true
          };
          setGroups((prevGroups) =>
            prevGroups.map((g) => (g.id === targetInviteGroup.id ? { ...g, members: [...(g.members || []), userMember] } : g))
          );
        }
        setActiveGroupId(targetInviteGroup.id);
        // Clear join param from URL
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        return;
      }
    }

    const userMatchedGroups = groups.filter((g) =>
      g.members && g.members.some((m) => m.id === user.id || (m.email && user.email && m.email.toLowerCase() === user.email.toLowerCase()))
    );
    if (userMatchedGroups.length > 0) {
      setActiveGroupId(userMatchedGroups[0].id);
    } else {
      const newPersonalGroup = {
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
        inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
        name: `${user.name.split(' ')[0]}'s Space 🏠`,
        description: 'Personal expense ledger & roommate splits',
        currency: '₹',
        members: [
          {
            id: user.id,
            name: user.name,
            avatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
            email: user.email,
            upiId: user.upiId || '',
            color: '#10B981',
            isCurrentUser: true,
            role: 'admin'
          }
        ],
        expenses: [],
        supplies: [],
        settlements: []
      };
      setGroups((prevGroups) => [newPersonalGroup, ...prevGroups]);
      setActiveGroupId(newPersonalGroup.id);
    }
  };

  const handleRegister = (newUser) => {
    const updatedUsers = [newUser, ...users];
    setUsers(updatedUsers);
    setCurrentUserId(newUser.id);

    const userMember = {
      id: newUser.id,
      name: newUser.name,
      avatar: newUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120&auto=format&fit=crop&q=80',
      email: newUser.email,
      upiId: newUser.upiId || '',
      color: '#10B981',
      isCurrentUser: true,
      role: 'admin'
    };

    const inviteGroupId = getInviteGroupId();
    if (inviteGroupId) {
      const targetInviteGroup = groups.find((g) => g.id === inviteGroupId || g.inviteCode === inviteGroupId);
      if (targetInviteGroup) {
        setGroups((prevGroups) =>
          prevGroups.map((g) => {
            if (g.id === targetInviteGroup.id) {
              const exists = g.members?.some((m) => m.id === newUser.id || m.email === newUser.email);
              return exists ? g : { ...g, members: [...(g.members || []), userMember] };
            }
            return g;
          })
        );
        setActiveGroupId(targetInviteGroup.id);
        window.history.replaceState({}, document.title, window.location.pathname + window.location.hash);
        setActivePage('dashboard');
        return;
      }
    }

    // Create a clean personal group for the new user
    const newPersonalGroup = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      inviteCode: Math.random().toString(36).substring(2, 10).toUpperCase(),
      name: `${newUser.name.split(' ')[0]}'s Space 🏠`,
      description: 'Personal expense ledger & roommate splits',
      currency: '₹',
      members: [userMember],
      expenses: [],
      supplies: [],
      settlements: []
    };
    setGroups((prevGroups) => [newPersonalGroup, ...prevGroups]);
    setActiveGroupId(newPersonalGroup.id);
    setActivePage('dashboard');
  };

  const handleUpdateProfile = (updatedUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
    setGroups((prevGroups) =>
      prevGroups.map((g) => ({
        ...g,
        members: (g.members || []).map((m) =>
          m.id === updatedUser.id
            ? { ...m, name: updatedUser.name, avatar: updatedUser.avatar, email: updatedUser.email, upiId: updatedUser.upiId || '' }
            : m
        )
      }))
    );
  };

  const promptLogout = () => {
    setIsLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setIsLogoutModalOpen(false);
    setIsAuthModalOpen(false);
    setCurrentUserId(null);
    localStorage.removeItem('equishare_current_user_id');
    localStorage.removeItem('equishare_active_group_id');
    setActivePage('landing');
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to reset all data on this browser? This action cannot be undone.')) {
      localStorage.removeItem('equishare_groups');
      localStorage.removeItem('equishare_users');
      localStorage.removeItem('equishare_current_user_id');
      localStorage.removeItem('equishare_active_group_id');
      setGroups([]);
      setUsers([]);
      setCurrentUserId(null);
      setActiveGroupId(null);
      setActivePage('landing');
    }
  };

  const handleExportData = () => {
    // Sanitize user passwords out of export bundle
    const sanitizedUsers = users.map((u) => {
      const { password, ...safeUser } = u;
      return safeUser;
    });

    const exportBundle = {
      version: '2.0.0',
      exportedAt: new Date().toISOString(),
      currentUser: currentUser ? { id: currentUser.id, name: currentUser.name, email: currentUser.email } : null,
      users: sanitizedUsers,
      groups
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `equishare_export_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };


  // If user is not logged in or activePage is 'landing', show the full immersive landing page
  if (!isLoggedIn || activePage === 'landing') {
    return (
      <div className="h-full min-h-screen overflow-y-auto bg-[#070A12] text-slate-100 relative font-sans custom-scrollbar">
        <InteractiveCursor />
        <LandingPage
          onEnterApp={() => setActivePage('dashboard')}
          onOpenAuth={handleOpenAuth}
          currentUser={currentUser}
          isLoggedIn={isLoggedIn}
          allUsers={users}
          currency={activeGroup.currency || '₹'}
        />

        {/* User Authentication & Profile Modal */}
        <AuthModal
          key={`landing-auth-${isAuthModalOpen}-${authModalMode}-${currentUser?.id}`}
          isOpen={isAuthModalOpen}
          onClose={() => setIsAuthModalOpen(false)}
          currentUser={currentUser}
          allUsers={users}
          initialMode={authModalMode}
          onLogin={handleLogin}
          onRegister={handleRegister}
          onUpdateProfile={handleUpdateProfile}
          onLogout={promptLogout}
        />

        {/* Logout Confirmation Dialog Modal */}
        <LogoutModal
          isOpen={isLogoutModalOpen}
          onClose={() => setIsLogoutModalOpen(false)}
          onConfirm={handleConfirmLogout}
          userName={currentUser?.name || 'User'}
        />
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] md:h-[100dvh] bg-[var(--color-app-bg)] text-slate-100 flex flex-col md:flex-row relative md:overflow-hidden font-sans transition-colors duration-300 w-full" data-theme={theme}>
      {/* Interactive Magnetic Cursor Follower */}
      <InteractiveCursor />

      {/* Dynamic Animated Theme-Aware Background Graphics */}
      <AnimatedBackground theme={theme} />

      {/* 1. Desktop & Mobile Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-40 md:static md:h-[100dvh] shrink-0 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <Sidebar
          activePage={activePage}
          onNavigate={(page) => {
            setActivePage(page);
            setIsMobileMenuOpen(false);
          }}
          groups={userGroups.length > 0 ? userGroups : [activeGroup]}
          activeGroupId={activeGroup.id}
          onSelectGroup={(id) => {
            setActiveGroupId(id);
            setIsMobileMenuOpen(false);
          }}
          onOpenAddExpense={() => {
            setIsAddExpenseOpen(true);
            setIsMobileMenuOpen(false);
          }}
          onOpenReceiptScanner={() => {
            setIsReceiptScannerOpen(true);
            setIsMobileMenuOpen(false);
          }}
          onOpenNewGroup={() => {
            setIsNewGroupOpen(true);
            setIsMobileMenuOpen(false);
          }}
          currentNetBalance={currentNetBalance}
          currency={activeGroup.currency || '₹'}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          appName="EquiShare"
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onLogout={promptLogout}
        />
      </div>

      {/* Backdrop for mobile drawer */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)}
          className="fixed inset-0 z-30 bg-black/70 backdrop-blur-sm md:hidden"
        />
      )}

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 md:min-h-0 md:h-full md:overflow-hidden z-10 w-full">
        {/* Top Header - Always Fixed at Top */}
        <Header
          activePage={activePage}
          groupName={activeGroup.name}
          currency={activeGroup.currency || '₹'}
          currentNetBalance={currentNetBalance}
          onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          onNavigate={(p) => setActivePage(p)}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
        />

        {/* Page Content Viewport - Seamless native document scroll on mobile, contained viewport on desktop */}
        <main 
          style={{ paddingBottom: 'max(7rem, calc(5rem + env(safe-area-inset-bottom, 0px)))' }}
          className="flex-1 w-full p-4 md:p-6 md:pb-12 lg:p-8 max-w-7xl mx-auto md:overflow-y-auto md:min-h-0 custom-scrollbar"
        >
          {activePage === 'dashboard' && (
            <DashboardPage
              group={activeGroup}
              balances={balances}
              simplifiedDebts={simplifiedDebts}
              rawDebts={rawDebts}
              currency={activeGroup.currency || '₹'}
              currentUser={currentUser}
              onNavigate={(page) => setActivePage(page)}
              onOpenAddExpense={() => setIsAddExpenseOpen(true)}
              onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
              onOpenSettleModal={(debt) => setSettleDebtTarget(debt)}
            />
          )}


          {activePage === 'expenses' && (
            <ExpensesPage
              expenses={activeGroup.expenses || []}
              members={activeGroup.members || []}
              currency={activeGroup.currency || '₹'}
              onDeleteExpense={handleDeleteExpense}
              onEditExpense={handleEditExpense}
              onOpenAddExpense={() => {
                setEditingExpense(null);
                setIsAddExpenseOpen(true);
              }}
              onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
            />
          )}

          {activePage === 'debts' && (
            <DebtsPage
              group={activeGroup}
              simplifiedDebts={simplifiedDebts}
              rawDebts={rawDebts}
              currency={activeGroup.currency || '₹'}
              onOpenSettleModal={(debt) => setSettleDebtTarget(debt)}
              onDeleteSettlement={handleDeleteSettlement}
            />
          )}

          {activePage === 'calculator' && (
            <CalculatorPage
              currency={activeGroup.currency || '₹'}
              onOpenAddExpenseWithAmount={(amt) => {
                setEditingExpense(null);
                setInitialExpenseAmount(amt);
                setIsAddExpenseOpen(true);
              }}
            />
          )}

          {activePage === 'groceries' && (
            <GroceriesPage
              supplies={activeGroup.supplies || []}
              members={activeGroup.members || []}
              currency={activeGroup.currency || '₹'}
              onAddSupply={handleAddSupply}
              onUpdateSupplyStatus={handleUpdateSupplyStatus}
              onDeleteSupply={handleDeleteSupply}
              onConvertSupplyToExpense={handleConvertSupplyToExpense}
            />
          )}

          {activePage === 'analytics' && (
            <AnalyticsPage
              group={activeGroup}
              balances={balances}
              currency={activeGroup.currency || '₹'}
            />
          )}

          {activePage === 'members' && (
            <GroupSettingsPage
              group={activeGroup}
              currentUser={currentUser}
              onOpenNewGroup={() => setIsNewGroupOpen(true)}
              onAddMember={handleAddMemberToGroup}
              onRemoveMember={handleRemoveMemberFromGroup}
              onUpdateGroup={handleUpdateGroup}
              onDeleteGroup={handleDeleteGroup}
            />
          )}

          {activePage === 'settings' && (
            <SettingsPage
              theme={theme}
              onThemeChange={setTheme}
              defaultPaymentApp={defaultPaymentApp}
              onDefaultPaymentAppChange={setDefaultPaymentApp}
              onResetData={handleResetData}
              onExportData={handleExportData}
              currentUser={currentUser}
              onOpenAuth={handleOpenAuth}
              onLogout={promptLogout}
            />
          )}
        </main>
      </div>

      {/* 3. Global Modals */}
      <AddExpenseModal
        isOpen={isAddExpenseOpen}
        onClose={() => {
          setIsAddExpenseOpen(false);
          setInitialExpenseAmount('');
          setEditingExpense(null);
        }}
        members={activeGroup.members || []}
        currency={activeGroup.currency || '₹'}
        initialAmount={initialExpenseAmount}
        editingExpense={editingExpense}
        onAddExpense={handleAddExpense}
      />

      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        members={activeGroup.members || []}
        currency={activeGroup.currency || '₹'}
        onImportReceipt={handleAddExpense}
      />

      <SettleModal
        isOpen={Boolean(settleDebtTarget)}
        onClose={() => setSettleDebtTarget(null)}
        debt={settleDebtTarget}
        currency={activeGroup.currency || '₹'}
        defaultPaymentApp={defaultPaymentApp}
        onConfirmSettlement={handleConfirmSettlement}
      />


      <NewGroupModal
        isOpen={isNewGroupOpen}
        onClose={() => setIsNewGroupOpen(false)}
        onCreateGroup={handleCreateGroup}
        currentUser={currentUser}
      />

      {/* User Authentication & Profile Modal */}
      <AuthModal
        key={`auth-${isAuthModalOpen}-${authModalMode}-${currentUser?.id}`}
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        currentUser={currentUser}
        allUsers={users}
        initialMode={authModalMode}
        onLogin={handleLogin}
        onRegister={handleRegister}
        onUpdateProfile={handleUpdateProfile}
        onLogout={promptLogout}
      />

      {/* Logout Confirmation Dialog Modal */}
      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        userName={currentUser?.name || 'User'}
      />
    </div>
  );
}
