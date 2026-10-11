# DeFAI Sentinel — Autonomous & Secure Economic Agent

> **Core Principle:**  
> AI can reason. Policy decides. Blockchain constrains. The user retains control. Payment executes only after authorization.

DeFAI Sentinel is a security-first financial authorization system that enables AI agents to interpret user instructions and request financial actions without receiving unrestricted financial authority.

---

## Architecture Overview

```text
User / Chat Request
        ↓
AI Reasoning Layer (Local Ollama / Qwen 2.5 14B)
        ↓
Structured Transaction Intent (Pydantic V2 Schema)
        ↓
Deterministic Policy Engine (Hard Limits, Auto-Thresholds, Merchants, Categories)
   ├── DENY ───────────→ Block & Audit Log
   ├── REQUIRE_APPROVAL → Human Approval Workflow
   └── ALLOW ──────────→ Scoped EVM Permission Check (Fail-Closed)
                               ↓
                        Mock INR Payment Executor (Row Locking, Ledger Bookkeeping)
                               ↓
                        Immutable Audit Trail (MySQL / SQLAlchemy)
```

- **Frontend**: React + Vite on `http://localhost:3000` (proxies `/api` to port 5001)
- **Backend**: Python 3.12 + FastAPI on `http://127.0.0.1:5001`
- **Database**: MySQL 8.0 / SQLAlchemy ORM + Alembic migrations (with local SQLite fallback during setup)
- **EVM Integration**: Web3.py connecting to scoped `DeFAIPolicy.sol` permissions (Fail-closed)
- **AI Brain**: Local Ollama instance (`richardyoung/qwen2.5-14b-instruct-abliterated`)

---

## Quickstart & Local Execution

### 1. Configure Environment (`.env`)
Copy `.env.example` to `.env` and fill in your MySQL credentials:
```bash
# In .env
DATABASE_URL=mysql+pymysql://root:YOUR_PASSWORD@localhost:3306/defai_sentinel
```

### 2. Start MySQL
Ensure the local MySQL service is running:
```powershell
Start-Service MySQL80
```

### 3. Run Alembic Database Migrations
```powershell
cd backend
python -m alembic upgrade head
python scripts/seed_mock_bank.py
```

### 4. Start Local EVM (Optional Anvil)
```powershell
anvil --port 8545
```

### 5. Start Backend Server (FastAPI)
```powershell
cd backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 5001 --reload
```

### 6. Start Frontend (React + Vite)
```powershell
cd frontend
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## Automated Test Suite

Run the full pytest test suite (covers limits, approvals, mock payments, kill switch, EVM fail-closed, and use cases):
```powershell
python -m pytest backend/tests/ -v
```

---

## Core Use Cases

1. **Controlled Purchase**:
   - Instruction: *"Buy a keyboard from Amazon for under 2,000"*
   - AI extracts structured intent -> deterministic policy evaluates against limits -> executes only if authorized.

2. **Subscription Terminator**:
   - Instruction: *"Cancel my Netflix subscription"*
   - Mock subscription registry cancels the service and logs the audit event.

3. **Ticket Sniper**:
   - Simulated ticket drop evaluates base price + taxes (18% GST) + convenience fees against user budget.

4. **Emergency Kill Switch**:
   - Emergency stop instantly blocks all autonomous financial execution.