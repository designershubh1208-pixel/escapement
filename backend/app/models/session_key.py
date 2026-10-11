import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey
from app.database import Base

class UserSessionKey(Base):
    """
    Stores authenticated session keys (cookies / browser storage states)
    for e-commerce platforms (Flipkart, Amazon).
    ZERO-PASSWORD GUARANTEE: User passwords are NEVER collected, stored, or processed.
    """
    __tablename__ = "user_session_keys"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), ForeignKey("users.id"), index=True, default="user_1", nullable=False)
    merchant = Column(String(64), index=True, nullable=False)  # "Flipkart", "Amazon"
    session_name = Column(String(128), default="Default Session", nullable=False)
    
    # Serialized cookie list or Playwright storage state JSON
    cookies_json = Column(Text, nullable=False)
    
    is_active = Column(Boolean, default=True, nullable=False)
    last_used_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
