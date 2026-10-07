import jwt from 'jsonwebtoken';
import { readDB } from '../data/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'equishare_super_secure_jwt_secret_2026_dev_key';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No authentication token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired authentication token.' });
  }
}

/**
 * IDOR Protection Middleware:
 * Resolves the groupId safely regardless of whether it's in query, body, params, or parent resource,
 * and ensures the authenticated user is actually a member or owner of the group.
 */
export function requireGroupMember(req, res, next) {
  let groupId = req.query.groupId || req.body.groupId || req.params.groupId || req.headers['x-group-id'];

  // If on /api/groups/:id, then req.params.id IS the group ID
  if (!groupId && req.baseUrl === '/api/groups' && req.params.id) {
    groupId = req.params.id;
  }

  const db = readDB();

  // If not explicitly provided, find the group owning the target expense, supply or settlement
  if (!groupId && req.params.id) {
    const targetId = req.params.id;
    if (req.baseUrl.includes('expenses')) {
      const parentGroup = db.groups.find((g) => (g.expenses || []).some((e) => e.id === targetId));
      if (parentGroup) groupId = parentGroup.id;
    } else if (req.baseUrl.includes('supplies')) {
      const parentGroup = db.groups.find((g) => (g.supplies || []).some((s) => s.id === targetId));
      if (parentGroup) groupId = parentGroup.id;
    } else if (req.baseUrl.includes('settlements')) {
      const parentGroup = db.groups.find((g) => (g.settlements || []).some((s) => s.id === targetId));
      if (parentGroup) groupId = parentGroup.id;
    }
  }

  if (!groupId) {
    return res.status(400).json({ error: 'groupId is required.' });
  }

  const group = db.groups.find((g) => g.id === groupId);
  if (!group) {
    return res.status(404).json({ error: 'Group not found.' });
  }

  const userId = req.user.id;
  const userEmail = req.user.email?.toLowerCase();

  const isMember = (group.members || []).some(
    (m) => m.id === userId || (m.email && userEmail && m.email.toLowerCase() === userEmail)
  );

  if (!isMember && group.createdBy !== userId) {
    return res.status(403).json({ error: 'Access denied: You are not a member of this group.' });
  }

  req.group = group;
  next();
}
