import uuid
from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Boolean, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class PaymentOrder(Base):
    """
    Tracks payment gateway orders (Razorpay/Cashfree/Mock Sandbox) with full signature
    and webhook verification lifecycle to guarantee idempotency and non-repudiation.
    """
    __tablename__ = "payment_orders"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    transaction_id = Column(String(64), ForeignKey("transactions.id"), index=True, nullable=False)
    
    # Provider identity: razorpay, cashfree, mock
    provider = Column(String(32), default="razorpay", nullable=False)
    provider_order_id = Column(String(128), index=True, nullable=False)
    provider_payment_id = Column(String(128), nullable=True, index=True)
    provider_signature = Column(String(256), nullable=True)

    # Accounting in strict integer paise
    amount_paise = Column(BigInteger, nullable=False)
    currency = Column(String(8), default="INR", nullable=False)
    
    # Explicit lifecycle state: CREATED, AUTHORIZED, CAPTURED, FAILED, REFUNDED
    status = Column(String(32), default="CREATED", index=True, nullable=False)
    
    # Webhook audit verification & deduplication
    webhook_verified = Column(Boolean, default=False, nullable=False)
    webhook_event_id = Column(String(128), unique=True, index=True, nullable=True)
    webhook_payload = Column(Text, nullable=True)
    
    # Client idempotency key
    idempotency_key = Column(String(128), unique=True, index=True, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    transaction = relationship("Transaction", back_populates="payment_orders")
