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
        # Auto-seeding of mock subscriptions is disabled
        return

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
