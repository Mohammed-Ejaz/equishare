# 💎 EquiShare — Smart Expense & Debt Settlement Platform

EquiShare is a high-performance, fullstack web application designed for roommates, friends, and travel groups to effortlessly split bills, track communal household supplies, and simplify mutual debts with minimum transactions.

---

## 📂 Project Structure

```
EquiShare/
├── 🌐 frontend/                # React 19 + Vite + Tailwind CSS v4 UI
│   ├── public/                 # Static assets & icons
│   ├── src/                    # Components, Pages, Utilities, Services
│   │   ├── components/         # Modals, Sidebar, Header, Interactive Elements
│   │   ├── pages/              # Dashboard, Expenses, Debts, Groceries, Calculator, Settings, LandingPage
│   │   ├── services/           # Backend API Client (api.js)
│   │   ├── utils/              # Graph-based Debt Simplifier Algorithm
│   │   ├── data/               # Mock data & category seeds
│   │   ├── App.jsx             # Master application root
│   │   └── main.jsx            # React entry point
│   ├── index.html              # HTML shell
│   ├── vite.config.js          # Vite configuration
│   └── package.json            # Frontend dependencies
│
├── 🛠️ backend/                 # Node.js + Express REST API Server
│   ├── data/                   # Persistent JSON Database store (store.js & database.json)
│   ├── middleware/             # JWT Authentication middleware
│   ├── routes/                 # Express API Routes
│   │   ├── auth.js             # Registration, Login, Profile
│   │   ├── groups.js           # Group & Member management
│   │   ├── expenses.js         # Expense records & splits
│   │   ├── supplies.js         # Communal groceries & supplies
│   │   └── debts.js            # Server-side debt minimization calculations
│   ├── .env                    # Environment variables (PORT, JWT_SECRET, etc.)
│   ├── server.js               # Express application entry
│   └── package.json            # Backend dependencies
│
├── package.json                # Root monorepo workspace runner
└── README.md                   # Project documentation
```

---

## 🚀 Getting Started

### 1. Run Frontend
```bash
npm run dev:frontend
```
> Or directly inside `frontend/`:
> ```bash
> cd frontend && npm run dev
> ```
Runs on **`http://localhost:5173`**.

### 2. Run Backend API Server
```bash
npm run dev:backend
```
> Or directly inside `backend/`:
> ```bash
> cd backend && npm run dev
> ```
Runs on **`http://localhost:5000`** (API Base: `http://localhost:5000/api`, Health: `http://localhost:5000/api/health`).

---

## ✨ Key Capabilities

1. **Smart Debt Simplification**: Graph-based debt simplification minimizing total transactions.
2. **Ambient Display Modes**: Dark (*Midnight Obsidian*), Dim (*Charcoal Slate*), and Light (*Porcelain Minimal*) modes.
3. **Real Indian Cash & UPI Payments**: Official vector branding for Google Pay, PhonePe, Paytm, super.money, and BHIM UPI.
4. **Built-in Expense Calculator Studio**: High-speed mathematical calculator directly integrated with expense entries.
5. **Shared Supplies Tracker**: Communal grocery inventory with single-click conversion to split expenses.
6. **Hybrid Local & Cloud Architecture**: Works 100% offline via localStorage with optional Node.js REST API sync.
