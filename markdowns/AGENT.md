# DeFAI Sentinel — Agent Specification

## 1. Agent Role

The DeFAI Agent is an autonomous assistant that can reason about financial tasks and create transaction requests.

It is NOT the authorization authority.

---

# 2. Agent Authority

The agent MAY:

- Interpret user requests
- Search permitted information
- Calculate candidate purchases
- Identify merchants
- Propose transactions
- Summarize subscriptions
- Request user approval

The agent MAY NOT:

- Change user policies
- Increase spending limits
- Disable security
- Bypass the policy engine
- Access bank credentials
- Access UPI PIN
- Access OTP
- Execute a blocked transaction
- Approve its own approval request

---

# 3. Agent Pipeline

```text
User Request
     ↓
Intent Understanding
     ↓
Structured Intent
     ↓
Transaction Construction
     ↓
Policy Engine
     ↓
Risk Checks
     ↓
Decision
  /      |       \
APPROVE APPROVAL BLOCK
  |       |
  |       └── User
  ↓
Mock Payment Executor