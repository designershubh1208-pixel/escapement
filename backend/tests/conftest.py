import pytest
import os
import sys

# Ensure backend directory is in python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.database import Base
from app.models.user import User
from app.models.policy import UserPolicy
from app.services.mock_payment import MockPaymentExecutor
from app.services.kill_switch import kill_switch

# In-memory SQLite for high-speed isolated test execution
TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def test_db():
    engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = TestingSessionLocal()

    # Seed baseline user
    user = User(id="user_1", name="Test User")
    db.add(user)
    db.commit()

    # Seed baseline policy:
    # Auto threshold: ₹500 (50,000 paise)
    # Hard limit: ₹5,000 (500,000 paise)
    # Daily limit: ₹2,000 (200,000 paise)
    # Monthly limit: ₹10,000 (1,000,000 paise)
    # Allowed merchants: Amazon, Flipkart
    policy = UserPolicy(
        user_id="user_1",
        daily_limit_paise=200000,
        per_transaction_limit_paise=500000,
        monthly_limit_paise=1000000,
        approval_threshold_paise=50000,
        allowlisted_merchants='["Amazon", "Flipkart"]',
        blocked_merchants='["GamblingHub"]',
        allowlisted_categories='["electronics", "books", "groceries", "subscription", "ticket"]',
        blocked_categories='["gambling", "crypto"]'
    )
    db.add(policy)
    db.commit()

    # Seed mock bank account with ₹50,000 (5,000,000 paise)
    MockPaymentExecutor.get_or_create_account(db, "user_1")

    # Reset kill switch
    kill_switch.reset("user_1")
    kill_switch.reset_global()

    yield db

    db.close()
    Base.metadata.drop_all(bind=engine)
