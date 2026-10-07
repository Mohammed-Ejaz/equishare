# 🛠️ EquiShare Backend API Server

A lightweight, robust Node.js + Express REST API backend for the **EquiShare** group & roommate expense settlement platform.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Start Development Server
```bash
npm run dev
```
The server will start on **`http://localhost:5000`**.

---

## 📡 API Endpoints Overview

### 🔐 Authentication (`/api/auth`)
- `POST /api/auth/register` — Register a new account & create private group.
- `POST /api/auth/login` — Sign in and receive JWT token.
- `GET /api/auth/me` — Retrieve currently logged-in user profile (Requires `Authorization: Bearer <token>`).

### 🏡 Groups (`/api/groups`)
- `GET /api/groups` — List all groups for the authenticated user.
- `GET /api/groups/:id` — Retrieve group details.
- `POST /api/groups` — Create a new group/trip ledger.
- `POST /api/groups/:id/members` — Invite or add a new roommate/member.

### 🧾 Expenses (`/api/expenses`)
- `GET /api/expenses?groupId=<id>` — List all expenses in a group.
- `POST /api/expenses` — Record a shared expense or settle-up payment.
- `DELETE /api/expenses/:id?groupId=<id>` — Remove an expense entry.

### 🛒 Shared Supplies & Groceries (`/api/supplies`)
- `GET /api/supplies?groupId=<id>` — List communal apartment supplies.
- `POST /api/supplies` — Add low-stock supply to the checklist.
- `PATCH /api/supplies/:id/status` — Mark supply as `needed` or `purchased`.
- `DELETE /api/supplies/:id?groupId=<id>` — Remove an item from the list.

### ⚡ Smart Debt Simplification (`/api/debts`)
- `GET /api/debts/simplify?groupId=<id>` — Calculate minimized payment paths using graph simplification.

### 🏥 Health Check
- `GET /api/health` — Check server status.
