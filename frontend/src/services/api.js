/**
 * EquiShare API Client Service
 * Connects frontend to http://localhost:5000/api with robust error handling
 */

const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://equishare-backend.onrender.com/api' 
    : 'http://localhost:5000/api');

function getAuthHeader() {
  const token = localStorage.getItem('equishare_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const api = {
  // Check if backend server is live
  async checkHealth() {
    try {
      const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
      return res.ok;
    } catch {
      return false;
    }
  },

  // Auth
  async register(userData) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Registration failed');
    if (data.token) localStorage.setItem('equishare_auth_token', data.token);
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    if (data.token) localStorage.setItem('equishare_auth_token', data.token);
    return data;
  },

  async getMe() {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: { ...getAuthHeader() }
      });
      return res.ok ? await res.json() : null;
    } catch {
      return null;
    }
  },

  // Groups
  async getGroups() {
    try {
      const res = await fetch(`${API_BASE_URL}/groups`, {
        headers: { ...getAuthHeader() }
      });
      return res.ok ? await res.json() : { groups: [] };
    } catch {
      return { groups: [] };
    }
  },

  async getGroupById(groupId) {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      headers: { ...getAuthHeader() }
    });
    return await res.json();
  },

  async createGroup(groupData) {
    const res = await fetch(`${API_BASE_URL}/groups`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(groupData)
    });
    return await res.json();
  },

  async updateGroup(groupId, groupData) {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(groupData)
    });
    return await res.json();
  },

  async deleteGroup(groupId) {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return await res.json();
  },

  async getGroupByInviteCode(inviteCode) {
    const res = await fetch(`${API_BASE_URL}/groups/invite/${inviteCode}`);
    return await res.json();
  },

  async joinGroupViaInvite(inviteCode) {
    const res = await fetch(`${API_BASE_URL}/groups/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ inviteCode })
    });
    return await res.json();
  },

  async addMember(groupId, memberData) {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(memberData)
    });
    return await res.json();
  },

  async removeMember(groupId, memberId) {
    const res = await fetch(`${API_BASE_URL}/groups/${groupId}/members/${memberId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return await res.json();
  },

  // Expenses
  async addExpense(expenseData) {
    const res = await fetch(`${API_BASE_URL}/expenses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(expenseData)
    });
    return await res.json();
  },

  async updateExpense(expenseId, expenseData) {
    const res = await fetch(`${API_BASE_URL}/expenses/${expenseId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(expenseData)
    });
    return await res.json();
  },

  async deleteExpense(expenseId, groupId) {
    const res = await fetch(`${API_BASE_URL}/expenses/${expenseId}?groupId=${groupId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return await res.json();
  },

  // Supplies
  async addSupply(supplyData) {
    const res = await fetch(`${API_BASE_URL}/supplies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(supplyData)
    });
    return await res.json();
  },

  async updateSupplyStatus(supplyId, groupId, status) {
    const res = await fetch(`${API_BASE_URL}/supplies/${supplyId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ groupId, status })
    });
    return await res.json();
  },

  async deleteSupply(supplyId, groupId) {
    const res = await fetch(`${API_BASE_URL}/supplies/${supplyId}?groupId=${groupId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return await res.json();
  },

  // Settlements
  async addSettlement(settlementData) {
    const res = await fetch(`${API_BASE_URL}/settlements`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(settlementData)
    });
    return await res.json();
  },

  async deleteSettlement(settlementId, groupId) {
    const res = await fetch(`${API_BASE_URL}/settlements/${settlementId}?groupId=${groupId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() }
    });
    return await res.json();
  }
};
