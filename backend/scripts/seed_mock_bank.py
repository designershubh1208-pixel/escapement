import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

from app.database import get_sessionmaker, get_engine, Base
from app.models.user import User
from app.models.policy import UserPolicy
from app.services.mock_payment import MockPaymentExecutor
from app.services.subscription_service import SubscriptionService

def seed():
    Base.metadata.create_all(bind=get_engine())
    session_factory = get_sessionmaker()
    db = session_factory()
    try:
        user = db.query(User).filter(User.id == "user_1").first()
        if not user:
            user = User(id="user_1", name="Sentinel User", email="user@defai.local")
            db.add(user)
            db.commit()

        # Seed policy if not present
        policy = db.query(UserPolicy).filter(UserPolicy.user_id == "user_1").first()
        if not policy:
            policy = UserPolicy(
                user_id="user_1",
                daily_limit_paise=200000,           # ₹2,000
                per_transaction_limit_paise=50000,  # ₹500
                monthly_limit_paise=1000000,        # ₹10,000
                approval_threshold_paise=50000,     # ₹500
                allowlisted_merchants='["Amazon", "Flipkart"]',
                blocked_merchants='[]',
                allowlisted_categories='["electronics", "books", "groceries", "subscription", "ticket"]',
                blocked_categories='["gambling", "crypto", "adult"]'
            )
            db.add(policy)
            db.commit()

        # Seed bank account
        account = MockPaymentExecutor.get_or_create_account(db, "user_1")
        print(f"Mock bank account ready: {account.account_number}, Balance: INR {account.balance_paise/100:.2f}")

        # Seed subscriptions
        SubscriptionService.ensure_seed_subscriptions(db, "user_1")
        print("Mock subscriptions seeded.")

    finally:
        db.close()

if __name__ == "__main__":
    seed()
