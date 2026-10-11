import uuid
from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), index=True, default="user_1")
    action = Column(String(64), index=True, nullable=False)  # POLICY_CREATED, DECISION_APPROVE, DECISION_BLOCK, etc.
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    details = Column(Text, nullable=False)  # JSON or text details of event
    transaction_id = Column(String(64), nullable=True, index=True)
    ip_address = Column(String(45), nullable=True)

    user = relationship("User", back_populates="audit_logs")
