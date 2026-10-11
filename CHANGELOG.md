# DeFAI Sentinel — Changelog

All notable changes to the prototype are documented here.

---

# [1.0.0] — FastAPI & Deterministic Authorization Release — 2026-10-11

## Added
- Complete FastAPI (Python 3.12) backend replacing legacy Node.js server.
- MySQL persistence with SQLAlchemy 2.0 ORM and Alembic migrations.
- Complete data migration preserving legacy SQLite sessions, messages, and requests.
- Strict Pydantic V2 structured intent validation schema with integer paise accounting.
- Deterministic multi-dimensional policy engine enforcing hard limits, auto thresholds, merchant/category blocklists.
- Human approval workflow with fresh authorization checks on approval.
- Scoped EVM permission verification with fail-closed security via Web3.py.
- Persistent mock INR payment executor with database row-level locking (`with_for_update`) and ledger auditability.
- Emergency kill switch preventing autonomous execution.
- Subscription Terminator mock registry and Ticket Sniper budget simulation services.
- Comprehensive 21-test pytest test suite.
- Archived legacy Node.js backend to `node-backend-legacy/`.

---

# [0.1.0] — Prototype Foundation — 2026-10-02

## Added

- Initial DeFAI Sentinel prototype specification
- INR-first product direction
- AI agent architecture
- Deterministic policy engine concept
- Transaction decision states:
  - APPROVE
  - REQUIRE_APPROVAL
  - BLOCK
- Per-transaction spending limit
- Daily spending limit
- Monthly spending limit
- Merchant allowlist
- Category restrictions
- Policy expiry
- Approval threshold
- Agent emergency stop
- Audit-log requirements
- Simulated INR payment executor
- Subscription Terminator prototype use case
- Controlled Purchase prototype use case
- Optional blockchain permission layer
- Explicit separation between AI reasoning and payment authorization

---

## Security

- Prohibited storage of bank passwords
- Prohibited storage of UPI PIN
- Prohibited storage of OTP
- Prohibited storage of card PIN/CVV
- Added fail-closed authorization behavior
- Added server-side authorization requirement
- Added idempotency requirement
- Added integer-paise representation for INR
- Added policy-version tracking for auditability

---

## Architecture

- Next.js + React + TypeScript frontend
- FastAPI + Python backend
- PostgreSQL database
- LLM with structured output
- Optional Solidity/EVM permission prototype
- Mock payment provider for MVP

---

## Not Implemented

- Real UPI integration
- Real bank integration
- Real-money transactions
- RBI/NPCI certification
- Production payment gateway
- Custodial wallet
- Real crypto payments

---

# [Unreleased]

## Planned

- Policy engine implementation
- Mock bank/payment service
- Agent transaction simulator
- Approval workflow
- Audit-log UI
- Subscription simulation
- Security test suite
- Optional EVM permission demonstration