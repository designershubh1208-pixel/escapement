# DeFAI Sentinel — Development Tasks

> This file is the execution backlog for Ralph Loop.
>
> `RALPH.md` defines HOW the agent must work.
> `PRD.md` defines WHAT the product must become.
> `tasks.md` defines WHAT WORK REMAINS.
> `progress.md` defines WHAT HAS ALREADY HAPPENED.
>
> Ralph must update this file after completing tasks.
>
> Status:
> [ ] Not started
> [~] In progress
> [x] Completed
> [!] Blocked
>
> IMPORTANT:
> Never mark a task [x] unless its acceptance criteria have actually been verified.

---

# PHASE 0 — Repository Audit

## 0.1 Project Discovery

- [x] Inspect complete repository structure
- [x] Identify frontend framework and entry points
- [x] Identify backend framework and entry points
- [x] Identify database configuration
- [x] Inspect all existing database migrations
- [x] Inspect existing models
- [x] Inspect existing API routes
- [x] Inspect authentication implementation
- [x] Inspect AI/LLM integration
- [x] Inspect blockchain/Web3 implementation
- [x] Inspect payment/mock-payment implementation
- [x] Inspect existing tests
- [x] Inspect environment configuration
- [x] Inspect existing documentation
- [x] Identify currently implemented features
- [x] Identify incomplete features
- [x] Identify broken features
- [x] Identify duplicate implementations
- [x] Identify security risks

### Acceptance Criteria

- Repository architecture is understood.
- Existing working functionality is not unnecessarily rebuilt.
- Existing frontend functionality is preserved.
- Existing backend functionality is preserved unless modification is required.
- Findings are recorded in `progress.md`.

---

# PHASE 1 — Project Foundation

## 1.1 Environment

- [x] Verify backend environment configuration
- [x] Verify frontend environment configuration
- [x] Verify database environment variables
- [x] Verify AI model/API configuration
- [x] Verify blockchain configuration
- [x] Verify mock payment configuration
- [x] Ensure secrets are loaded from environment variables
- [x] Ensure secrets are not hard-coded

## 1.2 Backend Foundation

- [x] Verify FastAPI application startup
- [x] Verify application configuration
- [x] Verify logging
- [x] Verify exception handling
- [x] Verify API health endpoint
- [x] Verify database connectivity
- [x] Verify CORS configuration
- [x] Verify request validation

### Acceptance Criteria

- Backend starts successfully.
- Database connection works.
- Health endpoint works.
- No secrets are committed.
- Errors do not expose internal stack traces.

---

# PHASE 2 — Database

## 2.1 Schema

Verify or implement the following logical entities:

- [x] users
- [x] user_policies
- [x] policy_rules
- [x] transactions
- [x] approvals
- [x] subscriptions
- [x] chat_sessions
- [x] chat_messages
- [x] audit_logs
- [x] blockchain_permissions

## 2.2 Database Integrity

- [ ] Verify primary keys
- [ ] Verify foreign keys
- [ ] Verify unique constraints
- [ ] Verify indexes
- [ ] Verify timestamps
- [ ] Verify transaction relationships
- [ ] Verify cascade behavior
- [ ] Verify nullable fields
- [ ] Verify financial amount data types
- [ ] Verify migration consistency

## 2.3 Migration Safety

- [ ] Review all existing migrations
- [ ] Do not recreate existing tables
- [ ] Add missing migrations safely
- [ ] Verify migrations on a clean database
- [ ] Verify migrations against existing schema

### Acceptance Criteria

- Database schema matches the application architecture.
- No destructive migration is introduced.
- Financial amounts use precision-safe representation.
- Relationships and constraints are enforced by the database where appropriate.

---

# PHASE 3 — Authentication

## 3.1 Authentication

- [ ] Verify user registration
- [ ] Verify password hashing
- [ ] Verify login
- [ ] Verify authentication token/session generation
- [ ] Verify token validation
- [ ] Verify logout/session invalidation where applicable
- [ ] Verify invalid credentials handling

## 3.2 Authorization

- [ ] Verify authenticated-user ownership
- [ ] Prevent cross-user resource access
- [ ] Verify role/permission checks
- [ ] Verify protected API endpoints
- [ ] Prevent client-controlled authorization fields

## 3.3 Security Tests

- [ ] Invalid login test
- [ ] Invalid token test
- [ ] Expired token test
- [ ] Unauthorized API access test
- [ ] Cross-user access test
- [ ] Privilege escalation test

### Acceptance Criteria

Authentication and authorization are separate concerns.

An authenticated user must not automatically receive permission for every operation.

---

# PHASE 4 — Deterministic Policy Engine

> CRITICAL SECURITY COMPONENT
>
> The policy engine is the final authority for whether a financial action is permitted.

## 4.1 Policy Model

- [ ] Implement/verify policy model
- [ ] Implement/verify policy rules
- [ ] Implement/verify user-policy relationship
- [ ] Implement/verify policy versioning if required
- [ ] Implement/verify policy status

## 4.2 Rule Evaluation

- [ ] Implement amount limit rule
- [ ] Implement daily transaction limit
- [ ] Implement recipient restriction
- [ ] Implement currency restriction
- [ ] Implement account status restriction
- [ ] Implement transaction frequency restriction
- [ ] Implement approval threshold
- [ ] Implement policy expiration where required

## 4.3 Decision Engine

Implement deterministic decisions:

- [ ] ALLOW
- [ ] DENY
- [ ] REQUIRE_APPROVAL
- [ ] ERROR

Each decision must contain:

- [ ] decision
- [ ] reason
- [ ] policy identifier
- [ ] evaluated rules
- [ ] relevant transaction identifier

## 4.4 Policy Tests

- [ ] Allowed transaction
- [ ] Amount exceeds limit
- [ ] Daily limit exceeded
- [ ] Unauthorized recipient
- [ ] Invalid currency
- [ ] Frozen account
- [ ] Missing policy
- [ ] Expired policy
- [ ] Conflicting rules
- [ ] Boundary amount
- [ ] Zero amount
- [ ] Negative amount
- [ ] Malformed transaction

### Acceptance Criteria

The policy engine produces deterministic results.

The policy engine does not use an LLM to make authorization decisions.

---

# PHASE 5 — Transaction Engine

## 5.1 Transaction Lifecycle

Implement/verify:

- [ ] CREATED
- [ ] PENDING_POLICY
- [ ] DENIED
- [ ] REQUIRES_APPROVAL
- [ ] APPROVED
- [ ] REJECTED
- [ ] EXECUTING
- [ ] COMPLETED
- [ ] FAILED
- [ ] CANCELLED

## 5.2 Transaction Creation

- [ ] Validate transaction input
- [ ] Validate amount
- [ ] Validate currency
- [ ] Validate recipient
- [ ] Validate authenticated user
- [ ] Generate transaction ID
- [ ] Generate/request idempotency key
- [ ] Run policy evaluation

## 5.3 Idempotency

- [ ] Implement idempotency key handling
- [ ] Prevent duplicate transaction creation
- [ ] Prevent duplicate execution
- [ ] Add database uniqueness constraints where appropriate
- [ ] Test repeated requests

## 5.4 Transaction Tests

- [ ] Valid transaction
- [ ] Invalid transaction
- [ ] Unauthorized transaction
- [ ] Duplicate transaction
- [ ] Policy denial
- [ ] Approval-required transaction
- [ ] Failed execution
- [ ] Retry behavior

### Acceptance Criteria

A transaction cannot reach execution without passing the required authorization flow.

---

# PHASE 6 — AI Reasoning Layer

> AI IS UNTRUSTED.
>
> AI can understand and propose.
> AI cannot authorize or execute.

## 6.1 AI Intent Extraction

- [ ] Implement/verify chat-to-intent conversion
- [ ] Define strict intent schema
- [ ] Validate AI output
- [ ] Reject malformed AI output
- [ ] Handle missing information
- [ ] Handle ambiguous requests
- [ ] Normalize financial amounts
- [ ] Normalize currency
- [ ] Normalize recipient information

## 6.2 AI Safety

- [ ] Prevent AI from directly executing transactions
- [ ] Prevent AI from bypassing policy
- [ ] Prevent AI from modifying security rules
- [ ] Prevent AI from modifying approval status
- [ ] Prevent AI from accessing secrets
- [ ] Prevent arbitrary tool execution

## 6.3 AI Failure Tests

- [ ] Malformed JSON
- [ ] Missing fields
- [ ] Incorrect amount
- [ ] Incorrect recipient
- [ ] Hallucinated transaction
- [ ] Prompt injection
- [ ] User asks to bypass policy
- [ ] AI unavailable
- [ ] AI timeout
- [ ] AI returns unsafe tool request

### Acceptance Criteria

AI output is treated as untrusted input.

Every financial intent must pass deterministic validation and policy evaluation.

---

# PHASE 7 — Chat System

## 7.1 Chat

- [ ] Verify chat sessions
- [ ] Verify chat messages
- [ ] Verify conversation persistence
- [ ] Verify user ownership
- [ ] Verify AI response handling
- [ ] Verify intent extraction
- [ ] Verify transaction preview

## 7.2 UI State Separation

Clearly distinguish:

- [ ] AI suggestion
- [ ] Policy decision
- [ ] Approval state
- [ ] Actual transaction state

### Acceptance Criteria

The user must never confuse an AI response with an actual executed transaction.

---

# PHASE 8 — Approval System

## 8.1 Approval Workflow

- [ ] Create approval request
- [ ] Display pending approval
- [ ] Approve transaction
- [ ] Reject transaction
- [ ] Expire approval where required
- [ ] Record approval timestamp
- [ ] Record approver identity
- [ ] Record approval audit event

## 8.2 Approval Security

- [ ] Prevent client-side approval spoofing
- [ ] Verify approver identity
- [ ] Verify approver permission
- [ ] Prevent duplicate approval
- [ ] Prevent approval after expiration
- [ ] Prevent approval of modified transaction

### Acceptance Criteria

Approval is an explicit authorization event.

The client cannot simply submit:

approved=true

and bypass the server-side approval system.

---

# PHASE 9 — Mock Payment Execution

> Default execution must remain simulated.

## 9.1 Mock Payment

- [ ] Create mock payment service
- [ ] Validate authorized transaction
- [ ] Execute simulated payment
- [ ] Return deterministic mock result
- [ ] Update transaction status
- [ ] Write audit event

## 9.2 Safety

- [ ] Ensure AI cannot directly call payment execution
- [ ] Ensure denied transactions cannot execute
- [ ] Ensure unapproved transactions cannot execute
- [ ] Ensure duplicate execution is impossible
- [ ] Clearly identify mock transactions

### Acceptance Criteria

No real money is moved.

The system never falsely represents a simulated transaction as a real bank transfer.

---

# PHASE 10 — Blockchain Authorization Layer

> Only implement this after the deterministic application policy engine is stable.

## 10.1 Blockchain Architecture

- [ ] Define exact blockchain responsibility
- [ ] Define authorization data stored on-chain
- [ ] Define off-chain/on-chain boundary
- [ ] Define policy hash strategy
- [ ] Define permission verification strategy

## 10.2 Smart Contract

- [ ] Implement permission structure
- [ ] Implement authorization verification
- [ ] Implement transaction limits if required
- [ ] Implement expiration if required
- [ ] Implement revocation if required
- [ ] Add contract tests

## 10.3 Blockchain Security

- [ ] Never expose private keys
- [ ] Never store sensitive personal information on-chain
- [ ] Never allow LLM control of private keys
- [ ] Verify authorization cryptographically
- [ ] Handle blockchain unavailability safely
- [ ] Fail closed when blockchain verification is mandatory

### Acceptance Criteria

Blockchain provides a clearly defined security/integrity property.

Blockchain is not used merely for marketing.

---

# PHASE 11 — Audit System

## 11.1 Audit Events

Record:

- [ ] Login
- [ ] Logout
- [ ] Failed authentication
- [ ] Policy creation
- [ ] Policy modification
- [ ] Transaction creation
- [ ] AI intent creation
- [ ] Policy evaluation
- [ ] Authorization
- [ ] Approval
- [ ] Rejection
- [ ] Execution
- [ ] Failure
- [ ] Blockchain verification
- [ ] Security violation

## 11.2 Audit Security

- [ ] Prevent unauthorized modification
- [ ] Prevent sensitive secret logging
- [ ] Add timestamps
- [ ] Add event IDs
- [ ] Add user IDs where appropriate
- [ ] Add transaction IDs where appropriate
- [ ] Add request/correlation IDs where appropriate

### Acceptance Criteria

Important financial/security events can be reconstructed from the audit trail.

---

# PHASE 12 — Frontend Integration

> Existing frontend must be preserved unless a functional/security requirement requires modification.

## 12.1 Authentication

- [ ] Connect login
- [ ] Connect registration
- [ ] Connect session handling
- [ ] Handle authentication errors

## 12.2 Dashboard

- [ ] Connect dashboard APIs
- [ ] Display transaction status
- [ ] Display policy status
- [ ] Display approval status
- [ ] Display audit information where required

## 12.3 Chat

- [ ] Connect chat API
- [ ] Display AI response
- [ ] Display transaction intent
- [ ] Display policy decision
- [ ] Display approval requirement
- [ ] Display final transaction state

## 12.4 Transactions

- [ ] Transaction list
- [ ] Transaction details
- [ ] Transaction status
- [ ] Approval interface
- [ ] Error states
- [ ] Loading states

## 12.5 UI Safety

- [ ] Do not imply AI authorization
- [ ] Clearly show policy decisions
- [ ] Clearly show simulated transactions
- [ ] Prevent misleading "successful payment" messaging

---

# PHASE 13 — Security Hardening

## 13.1 Application Security

- [ ] Input validation
- [ ] Authentication review
- [ ] Authorization review
- [ ] IDOR testing
- [ ] Privilege escalation testing
- [ ] SQL injection testing
- [ ] XSS review
- [ ] CSRF review where applicable
- [ ] Rate limiting review
- [ ] Secrets review
- [ ] Error leakage review

## 13.2 AI Security

- [ ] Prompt injection tests
- [ ] AI hallucination tests
- [ ] Tool abuse tests
- [ ] Policy bypass tests
- [ ] Authorization spoofing tests
- [ ] Malformed AI output tests

## 13.3 Financial Security

- [ ] Duplicate transaction testing
- [ ] Replay attack testing
- [ ] Amount manipulation testing
- [ ] Recipient manipulation testing
- [ ] Approval bypass testing
- [ ] Policy bypass testing
- [ ] Currency manipulation testing

---

# PHASE 14 — Testing

## 14.1 Unit Tests

- [ ] Policy engine
- [ ] Transaction validation
- [ ] Authentication
- [ ] Authorization
- [ ] AI schema validation
- [ ] Idempotency
- [ ] Approval logic
- [ ] Mock payment logic

## 14.2 Integration Tests

- [ ] Authentication flow
- [ ] Policy flow
- [ ] Transaction flow
- [ ] Approval flow
- [ ] AI-to-policy flow
- [ ] Policy-to-payment flow
- [ ] Audit flow

## 14.3 End-to-End Tests

- [ ] User registration
- [ ] Login
- [ ] Chat request
- [ ] AI intent generation
- [ ] Policy evaluation
- [ ] Approval
- [ ] Mock execution
- [ ] Transaction history

## 14.4 Security Scenario Tests

- [ ] AI says ALLOW but policy says DENY
- [ ] AI says DENY but policy says ALLOW
- [ ] User attempts policy bypass
- [ ] User attempts approval bypass
- [ ] User accesses another user's transaction
- [ ] Duplicate transaction request
- [ ] AI unavailable
- [ ] Database unavailable
- [ ] Blockchain unavailable
- [ ] Malformed AI output

---

# PHASE 15 — Documentation

- [ ] Update README
- [ ] Document architecture
- [ ] Document setup
- [ ] Document environment variables
- [ ] Document database
- [ ] Document API
- [ ] Document policy engine
- [ ] Document AI safety model
- [ ] Document transaction lifecycle
- [ ] Document approval workflow
- [ ] Document blockchain architecture
- [ ] Document security model
- [ ] Document mock payment limitations
- [ ] Document known limitations

---

# PHASE 16 — Final Quality Gate

- [ ] Backend starts successfully
- [ ] Frontend starts successfully
- [ ] Database works
- [ ] Authentication works
- [ ] Authorization works
- [ ] Policy engine works
- [ ] Transaction engine works
- [ ] Idempotency works
- [ ] Approval workflow works
- [ ] AI intent extraction works
- [ ] AI cannot bypass policy
- [ ] Mock payment works
- [ ] Audit logging works
- [ ] Blockchain layer works if enabled
- [ ] Frontend integration works
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Security tests pass
- [ ] No secrets committed
- [ ] No destructive changes introduced
- [ ] Documentation updated
- [ ] Git diff reviewed

---

# FINAL ACCEPTANCE PRINCIPLE

The system must demonstrate:

User
  ↓
AI understands request
  ↓
Structured intent
  ↓
Deterministic Policy Engine
  ↓
ALLOW / DENY / REQUIRE_APPROVAL
  ↓
Authorization
  ↓
Human Approval when required
  ↓
Mock Payment Execution
  ↓
Audit Log

The AI is never the final financial authority.

The system must fail closed.

PROJECT_READY_FOR_HUMAN_REVIEW