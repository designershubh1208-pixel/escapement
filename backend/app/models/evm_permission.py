import uuid
from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Boolean, DateTime
from app.database import Base

class BlockchainPermission(Base):
    __tablename__ = "blockchain_permissions"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    permission_id_hex = Column(String(66), unique=True, index=True, nullable=False)  # bytes32 0x...
    user_address = Column(String(42), nullable=False)
    agent_address = Column(String(42), nullable=False)
    policy_id_hex = Column(String(66), nullable=False)
    max_amount_paise = Column(BigInteger, nullable=False)
    spent_amount_paise = Column(BigInteger, default=0)
    expires_at = Column(DateTime, nullable=False)
    is_active = Column(Boolean, default=True)
    on_chain_tx_hash = Column(String(66), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
