import uuid
from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class MockBankAccount(Base):
    __tablename__ = "mock_bank_accounts"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), unique=True, index=True, nullable=False)
    account_number = Column(String(32), unique=True, nullable=False)
    
    # Balance stored strictly in integer paise (₹50,000 = 5,000,000 paise)
    balance_paise = Column(BigInteger, default=5000000)  # Initial ₹50,000 for demonstration
    reserved_paise = Column(BigInteger, default=0)
    currency = Column(String(8), default="INR")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="bank_account")
    ledger_entries = relationship("MockBankLedger", back_populates="account", cascade="all, delete-orphan", order_by="MockBankLedger.created_at.desc()")

class MockBankLedger(Base):
    __tablename__ = "mock_bank_ledger"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String(64), ForeignKey("mock_bank_accounts.id"), index=True, nullable=False)
    transaction_id = Column(String(64), ForeignKey("transactions.id"), nullable=True, index=True)
    
    # Entry type: DEBIT, CREDIT, RESERVE, RELEASE
    entry_type = Column(String(32), nullable=False)
    amount_paise = Column(BigInteger, nullable=False)
    balance_after_paise = Column(BigInteger, nullable=False)
    description = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    account = relationship("MockBankAccount", back_populates="ledger_entries")
    transaction = relationship("Transaction", back_populates="ledger_entries")
