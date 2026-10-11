import uuid
import logging
from typing import Tuple, List, Optional
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models.financial import Subscription

logger = logging.getLogger("defai.subscription")

class SubscriptionService:
    @staticmethod
    def ensure_seed_subscriptions(db: Session, user_id: str = "user_1"):
        existing = db.query(Subscription).filter(Subscription.user_id == user_id).first()
        if not existing:
            subs = [
                Subscription(
                    user_id=user_id,
                    service_name="Netflix",
                    plan_name="Premium 4K",
                    amount_paise=64900,  # ₹649
                    billing_cycle="monthly",
                    status="ACTIVE"
                ),
                Subscription(
                    user_id=user_id,
                    service_name="Spotify",
                    plan_name="Individual",
                    amount_paise=11900,  # ₹119
                    billing_cycle="monthly",
                    status="ACTIVE"
                ),
                Subscription(
                    user_id=user_id,
                    service_name="Amazon Prime",
                    plan_name="Annual",
                    amount_paise=149900,  # ₹1,499
                    billing_cycle="yearly",
                    status="ACTIVE"
                ),
                Subscription(
                    user_id=user_id,
                    service_name="Gym Free Trial",
                    plan_name="Trial Session Key",
                    amount_paise=250000,
                    billing_cycle="trial",
                    status="EXPIRED",
                    trial_ends_at=datetime.utcnow() - timedelta(days=2)
                )
            ]
            db.add_all(subs)
            db.commit()

    @staticmethod
    def cancel_subscription(db: Session, service_name: str, user_id: str = "user_1") -> Tuple[bool, str]:
        sub = db.query(Subscription).filter(
            Subscription.user_id == user_id,
            Subscription.service_name.ilike(f"%{service_name}%")
        ).first()

        if not sub:
            return False, f"No active subscription found for {service_name} in user registry."

        if sub.status == "CANCELLED":
            return False, f"Subscription for {sub.service_name} is already cancelled."

        sub.status = "CANCELLED"
        sub.cancellation_reason = "User requested cancellation via AI Sentinel"
        sub.updated_at = datetime.utcnow()
        db.commit()

        logger.info(f"Successfully cancelled subscription for {sub.service_name} (User: {user_id})")
        return True, f"Subscription for {sub.service_name} was successfully cancelled."
