import uuid
from datetime import datetime
from sqlalchemy import Column, String, BigInteger, Boolean, Integer, DateTime
from app.database import Base

class ProductCatalog(Base):
    """
    Live / authorized product catalog model representing actual verified e-commerce items,
    verified pricing, and real-time stock availability status.
    """
    __tablename__ = "product_catalog"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    merchant = Column(String(64), index=True, nullable=False)  # e.g., Amazon, Flipkart, Blinkit
    sku = Column(String(64), unique=True, index=True, nullable=False)
    title = Column(String(256), nullable=False)
    category = Column(String(64), default="General", index=True)
    price_paise = Column(BigInteger, nullable=False)
    currency = Column(String(8), default="INR", nullable=False)
    in_stock = Column(Boolean, default=True, nullable=False, index=True)
    stock_count = Column(Integer, default=10, nullable=False)
    source_url = Column(String(512), nullable=True)
    last_checked_at = Column(DateTime, default=datetime.utcnow)
    created_at = Column(DateTime, default=datetime.utcnow)

class StockAlert(Base):
    """
    Tracks out-of-stock items monitored by DeFAI Sentinel on behalf of the user.
    """
    __tablename__ = "stock_alerts"

    id = Column(String(64), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(64), index=True, default="user_1")
    merchant = Column(String(64), nullable=False)
    product_title = Column(String(256), nullable=False)
    sku = Column(String(64), nullable=True)
    target_price_paise = Column(BigInteger, nullable=True)
    # ACTIVE, NOTIFIED, CANCELLED
    status = Column(String(32), default="ACTIVE", index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    notified_at = Column(DateTime, nullable=True)
