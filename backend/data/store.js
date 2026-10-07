import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'database.json');

// Generate valid bcrypt hash for default demo credentials (password123)
const DEFAULT_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

const DEFAULT_DATA = {
  users: [
    {
      id: 'm1',
      name: 'Alex Rivera',
      email: 'alex@roomie.io',
      passwordHash: DEFAULT_PASSWORD_HASH,
      upiId: 'alexrivera@okhdfcbank',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'm2',
      name: 'Maya Chen',
      email: 'maya@roomie.io',
      passwordHash: DEFAULT_PASSWORD_HASH,
      upiId: 'mayachen@okaxis',
      phone: '+91 98765 43211',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  groups: [
    {
      id: 'group-apt402',
      name: 'Apt 402 — The Penthouse 🏠',
      description: 'Shared 4-bedroom flat (Rent, Utilities, Groceries & House Help)',
      currency: '₹',
      createdBy: 'm1',
      inviteCode: 'apt402-invite',
      members: [
        { id: 'm1', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80', email: 'alex@roomie.io', color: '#10B981', role: 'owner' },
        { id: 'm2', name: 'Maya Chen', avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&auto=format&fit=crop&q=80', email: 'maya@roomie.io', color: '#6366F1', role: 'member' }
      ],
      expenses: [
        {
          id: 'exp-1',
          title: 'Monthly Flat Rent (April)',
          amount: 36000.00,
          category: 'rent',
          paidBy: 'm1',
          date: '2026-04-01',
          splitType: 'equal',
          participants: ['m1', 'm2'],
          splits: { m1: 18000, m2: 18000 },
          notes: 'Direct Bank NEFT transfer'
        }
      ],
      supplies: [
        { id: 'sup-1', name: 'Dishwasher Pods & Detergent', category: 'cleaning', estimatedPrice: 420.00, addedBy: 'm1', status: 'needed' }
      ],
      settlements: []
    }
  ]
};

// Initialize DB file if not present
export function initDB() {
  if (!fs.existsSync(DB_FILE)) {
    fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });
    writeDB(DEFAULT_DATA);
  }
}

// Read database
export function readDB() {
  initDB();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Critical: Error reading or parsing database file:', err);
    try {
      if (fs.existsSync(DB_FILE)) {
        const corruptedBackup = path.join(__dirname, `database.corrupted.${Date.now()}.json`);
        fs.copyFileSync(DB_FILE, corruptedBackup);
        console.warn(`Preserved corrupted database to ${corruptedBackup}`);
      }
    } catch (backupErr) {
      console.error('Failed to create backup of corrupted database:', backupErr);
    }
    return DEFAULT_DATA;
  }
}

// Write database atomically via temp file rename
export function writeDB(data) {
  try {
    const tempFile = `${DB_FILE}.tmp.${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempFile, DB_FILE);
    return true;
  } catch (err) {
    console.error('Error writing database atomically:', err);
    throw new Error('Database write failure: could not persist changes');
  }
}
