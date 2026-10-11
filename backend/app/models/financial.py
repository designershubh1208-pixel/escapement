import uuid
from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Integer, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    session_id = Column(String(64), ForeignKey("chat_sessions.id"), nullable=True, index=True)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, default="user_1")
    user_message = Column(Text, nullable=True)
    intent_json = Column(Text, nullable=True)
    
    # Financial Action: PURCHASE, TRANSFER, CANCEL_SUBSCRIPTION, TICKET_PURCHASE, NONE
    action = Column(String(64), default="NONE")
    merchant = Column(String(128), nullable=True)
    category = Column(String(128), nullable=True)
    amount_paise = Column(BigInteger, nullable=True)  # Strictly in integer paise
    currency = Column(String(8), default="INR")
    
    # State Machine: PENDING, REQUIRES_APPROVAL, AUTHORIZED, EXECUTING, COMPLETED, FAILED, BLOCKED
    status = Column(String(32), default="PENDING", index=True)
    
    # Policy Evaluation details
    policy_id = Column(String(64), nullable=True)
    policy_version = Column(Integer, nullable=True)
    policy_decision = Column(String(32), nullable=True)  # APPROVE, REQUIRE_APPROVAL, BLOCK
    policy_reasons = Column(Text, nullable=True)  # JSON encoded list of reason codes
    
    # EVM & Settlement references
    blockchain_permission_id = Column(String(64), nullable=True)
    tx_hash = Column(String(128), nullable=True)
    failure_reason = Column(Text, nullable=True)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="transactions")
    approval = relationship("Approval", back_populates="transaction", uselist=False, cascade="all, delete-orphan")
    ledger_entries = relationship("MockBankLedger", back_populates="transaction")
    payment_orders = relationship("PaymentOrder", back_populates="transaction")

class Approval(Base):
    __tablename__ = "approvals"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String(64), ForeignKey("transactions.id"), unique=True, index=True, nullable=False)
    user_id = Column(String(64), ForeignKey("users.id"), index=True, default="user_1")
    
    # PENDING, APPROVED, REJECTED
    status = Column(String(32), default="PENDING", index=True)
    decision_reasons = Column(Text, nullable=True)
    decided_by = Column(String(64), nullable=True)
    decided_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="approval")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), index=True, default="user_1")
    service_name = Column(String(128), nullable=False)
    plan_name = Column(String(128), default="Standard")
    amount_paise = Column(BigInteger, nullable=False)  # e.g., 49900 = ₹499
    currency = Column(String(8), default="INR")
    billing_cycle = Column(String(32), default="monthly")
    
    # ACTIVE, CANCELLED, EXPIRED
    status = Column(String(32), default="ACTIVE", index=True)
    trial_ends_at = Column(DateTime, nullable=True)
    cancellation_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
