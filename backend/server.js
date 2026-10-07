import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import groupRoutes from './routes/groups.js';
import expenseRoutes from './routes/expenses.js';
import supplyRoutes from './routes/supplies.js';
import debtRoutes from './routes/debts.js';
import settlementRoutes from './routes/settlements.js';
import { initDB } from './data/store.js';

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';

// Initialize Database Storage
initDB();

// Middlewares
app.use(cors({
  origin: [CLIENT_ORIGIN, 'http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));
app.use(express.json());

// Handle Bad JSON Payloads Gracefully (400 Bad Request instead of 500)
app.use((err, _req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload in request body.' });
  }
  next(err);
});

// Request logger
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'online',
    app: 'EquiShare REST API Server',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/supplies', supplyRoutes);
app.use('/api/debts', debtRoutes);
app.use('/api/settlements', settlementRoutes);

// Global Error Handler
app.use((err, _req, res, _next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error' });
});

// Start listening
app.listen(PORT, () => {
  console.log(`
  ======================================================
  🚀 EquiShare Backend Server is running on port ${PORT}
  📡 API Base URL: http://localhost:${PORT}/api
  🏥 Health Check: http://localhost:${PORT}/api/health
  ======================================================
  `);
});
