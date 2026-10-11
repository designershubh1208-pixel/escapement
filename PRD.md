# DeFAI Sentinel — Product Requirements Document (PRD)

## 1. Product

**Name:** DeFAI Sentinel  
**Prototype:** INR-first Autonomous Financial Agent

**Core idea:**

> Let an AI agent act on a user's behalf while enforcing deterministic financial permissions before any payment is executed.

### Core Principle

> **AI can decide. Policy decides whether AI is allowed to act. The payment layer executes only an approved action.**

---

## 2. Product Thesis

DeFAI Sentinel gives users economic agency through an AI "Digital CFO" while preventing the AI from obtaining unrestricted control over the user's money.

The system separates:

1. AI reasoning
2. Deterministic policy enforcement
3. Payment authorization
4. Payment execution

The AI must never receive:

- Bank password
- UPI PIN
- Debit-card PIN
- OTP
- CVV
- Unrestricted banking credentials

---

## 3. Problem

AI agents can reason, plan and recommend actions, but giving them unrestricted financial authority is unsafe.

DeFAI Sentinel solves this by allowing users to define financial policies that are enforced by deterministic software before a transaction can execute.

---

## 4. Prototype Goal

Demonstrate that an AI agent can:

- Understand a user's financial instruction
- Convert it into a structured transaction request
- Evaluate the request against deterministic policies
- Approve, reject, or request human approval
- Create an auditable decision record
- Simulate INR payment execution

---

## 5. Non-Goals

The prototype will NOT:

- Connect to a real bank account
- Collect banking credentials
- Collect UPI PIN
- Collect OTP
- Move real INR
- Become a UPI network
- Act as a payment gateway
- Hold customer funds
- Claim RBI authorization
- Claim NPCI certification
- Claim production-grade financial security
- Use blockchain to represent real INR

---

# 6. Primary User

A technically aware consumer who wants an AI assistant to perform routine financial actions without giving the AI unrestricted financial authority.

---

# 7. Primary Use Case — Controlled Purchase

The user creates:

- Daily limit: ₹2,000
- Per-transaction limit: ₹500
- Monthly limit: ₹10,000
- Allowed merchants: Amazon, Flipkart
- Approval threshold: ₹500
- Expiry: 30 days

The user says:

> "Buy a keyboard from Amazon under ₹2,000."

The AI creates a structured transaction request.

The policy engine evaluates the final transaction.

### Examples

```text
₹450 Amazon
→ APPROVE

₹800 Amazon
→ REQUIRE_APPROVAL

₹450 Unknown Merchant
→ BLOCK

₹450 Amazon after policy expiry
→ BLOCK