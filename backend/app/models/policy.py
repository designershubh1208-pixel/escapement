import uuid
from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Integer, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class UserPolicy(Base):
    __tablename__ = "user_policies"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), index=True, nullable=False)
    name = Column(String(100), default="Default Spending Policy")
    
    # Financial limits stored strictly in integer paise (₹1 = 100 paise)
    daily_limit_paise = Column(BigInteger, default=200000)  # ₹2,000
    per_transaction_limit_paise = Column(BigInteger, default=50000)  # ₹500
    monthly_limit_paise = Column(BigInteger, default=1000000)  # ₹10,000
    approval_threshold_paise = Column(BigInteger, default=50000)  # ₹500
    
    # JSON-encoded lists of merchants & categories
    allowlisted_merchants = Column(Text, default='["Amazon", "Flipkart"]')
    blocked_merchants = Column(Text, default='[]')
    allowlisted_categories = Column(Text, default='["electronics", "books", "groceries", "subscription", "ticket"]')
    blocked_categories = Column(Text, default='["gambling", "crypto", "adult"]')
    
    is_active = Column(Boolean, default=True)
    version = Column(Integer, default=1)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="policies")
    rules = relationship("PolicyRule", back_populates="policy", cascade="all, delete-orphan")
    versions = relationship("PolicyVersion", back_populates="policy", cascade="all, delete-orphan")

class PolicyRule(Base):
    __tablename__ = "policy_rules"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    policy_id = Column(String(64), ForeignKey("user_policies.id"), index=True, nullable=False)
    rule_type = Column(String(64), nullable=False)  # HARD_LIMIT, AUTO_THRESHOLD, MERCHANT_RESTRICTION, etc.
    rule_config = Column(Text, default="{}")  # JSON representation of parameters
    is_mandatory = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    policy = relationship("UserPolicy", back_populates="rules")

class PolicyVersion(Base):
    __tablename__ = "policy_versions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    policy_id = Column(String(64), ForeignKey("user_policies.id"), index=True, nullable=False)
    version_number = Column(Integer, nullable=False)
    snapshot_json = Column(Text, nullable=False)  # Complete JSON snapshot of limits & lists
    created_at = Column(DateTime, default=datetime.utcnow)

    policy = relationship("UserPolicy", back_populates="versions")
