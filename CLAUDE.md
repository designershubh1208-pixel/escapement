# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# DeFAI Sentinel — Claude Code Instructions

## Project Identity

You are working on **DeFAI Sentinel**, an INR-first prototype for secure autonomous financial agents.

The central principle is:

> AI can reason and request an action. Deterministic policy code decides whether that action is allowed.

Never weaken this principle for convenience.

---

## Critical Safety Rules

### NEVER implement
- Real bank credential collection
- UPI PIN collection
- OTP collection
- Debit-card PIN collection
- CVV collection
- Unrestricted bank APIs
- Direct autonomous access to a user's bank account
- Real-money execution in the prototype

### NEVER claim
- RBI approval
- NPCI certification
- Production financial security
- Real UPI integration
- Real bank connectivity

Unless those things are actually obtained and documented.

---

## Architecture Rule

Use:

```
User
 ↓
AI Agent
 ↓
Structured Intent
 ↓
Deterministic Policy Engine
 ↓
Risk / Approval
 ↓
Mock Payment Executor
```

---

## Quickstart & Common Commands

**Local Development**

- Install dependencies: `cd frontend && npm install`
- Run in development mode: `cd frontend && npm run dev`
  - Starts Vite dev server on `http://localhost:3000` and proxies API calls (`/api/*`) to `http://127.0.0.1:5001`.
- Build production assets: `cd frontend && npm run build`
- Preview the built bundle locally: `cd frontend && npm run preview`

**Testing**

No tests are defined in this repository. If tests are added (e.g., Jest), run with `npm test` or the appropriate script.

**Linting**

No linting script is provided. To add linting, install ESLint and add a script like `"lint": "eslint 'frontend/src/**/*.{js,jsx,ts,tsx}'"` to the `package.json`.

**Directory Structure**

- `frontend/`
  - `src/` – Contains all React source files.
    - `components/` – Shared UI components such as Header, Footer, SplashScreen.
    - `pages/` – Route‑specific pages (Landing, Services, Work, About, Pricing, Insights, Q&A Chat, Chat Interface, Policy Configurator, etc.).
    - `styles/` – Global CSS (e.g., Tailwind CSS configuration).
    - `main.jsx` – React entry point.
  - `vite.config.js` – Vite configuration with proxy to the backend on port 5001.

**API Integration**

The front‑end communicates with a backend API via `/api/*` endpoints. The proxy configuration in `vite.config.js` forwards these requests to `http://127.0.0.1:5001`. Typical endpoints used:

- `/api/chat/qa` – Send user messages for general Q&A.
- `/api/chat/` – Send financial transaction requests.
- `/api/policies/:userId` – Get or update user policy settings.
- `/api/chat/sessions/:id` – Fetch chat session history.

The backend is responsible for:
- Parsing the user input into a Structured Intent.
- Running the deterministic policy engine.
- Returning a decision (APPROVE, REQUIRE_APPROVAL, BLOCK) along with any structured request details.
- (Mock) executing payments when approved.

**Design Guidelines**

See the `DESIGN.md` file for UI/UX guidelines, brand personality, and best‑practice design decisions.

---

## Security Guidance

- Never hard‑code sensitive data (API keys, secrets) in source files.
- Ensure the backend implements proper authentication and input validation before executing any financial operation.
- The application intentionally does not provide real money capabilities; all executions are mocked for safety.
