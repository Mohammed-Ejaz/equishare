import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readDB, writeDB } from '../data/store.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'equishare_super_secure_jwt_secret_2026_dev_key';

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, avatar, upiId, phone } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }

    const db = readDB();
    const existing = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (existing) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      upiId: upiId ? upiId.trim() : '',
      phone: phone ? phone.trim() : '',
      createdAt: new Date().toISOString()
    };

    // Auto create an isolated group for the new user
    const newGroup = {
      id: `group-${Date.now()}`,
      name: `${newUser.name.split(' ')[0]}'s Flat 🏠`,
      description: 'Personal expense ledger & roommate splits',
      currency: '₹',
      createdBy: newUser.id,
      members: [
        {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          avatar: newUser.avatar,
          color: '#10B981'
        }
      ],
      expenses: [],
      supplies: []
    };

    db.users.push(newUser);
    db.groups.push(newGroup);
    writeDB(db);

    const token = jwt.sign({ id: newUser.id, email: newUser.email, name: newUser.name }, JWT_SECRET, {
      expiresIn: '30d'
    });

    const { passwordHash: _, ...safeUser } = newUser;
    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: safeUser,
      group: newGroup
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Server error during registration.' });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const db = readDB();
    const user = db.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Support bcrypt or direct comparison for demo users
    const isMatch = user.passwordHash
      ? await bcrypt.compare(password, user.passwordHash)
      : (user.password === password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, JWT_SECRET, {
      expiresIn: '30d'
    });

    const { passwordHash: _, ...safeUser } = user;
    res.json({
      message: 'Login successful',
      token,
      user: safeUser
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Server error during login.' });
  }
});

// GET /api/auth/me
router.get('/me', authenticateToken, (req, res) => {
  const db = readDB();
  const user = db.users.find((u) => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }
  const { passwordHash: _, ...safeUser } = user;
  res.json({ user: safeUser });
});

export default router;
