from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime
from app.database import Base

class MobileOTP(Base):
    __tablename__ = "mobile_otps"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    phone_number = Column(String(32), index=True, nullable=False)
    otp_code = Column(String(8), nullable=False)
    purpose = Column(String(32), default="auth", nullable=False)  # "login", "register", "verify"
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

class EmailOTP(Base):
    __tablename__ = "email_otps"

    id = Column(Integer, primary_key=True, autoincrement=True, index=True)
    email = Column(String(255), index=True, nullable=False)
    otp_code = Column(String(8), nullable=False)
    purpose = Column(String(32), default="auth", nullable=False)  # "login", "register", "verify"
    expires_at = Column(DateTime, nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    attempts = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

