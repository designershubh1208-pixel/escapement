import logging
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.financial import Subscription
from app.services.subscription_service import SubscriptionService

logger = logging.getLogger("defai.api.subscriptions")
router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

class CancelSubscriptionRequest(BaseModel):
    service_name: str
    user_id: str = "user_1"

@router.get("")
def get_user_subscriptions(user_id: str = "user_1", db: Session = Depends(get_db)):
    SubscriptionService.ensure_seed_subscriptions(db, user_id)
    subs = db.query(Subscription).filter(Subscription.user_id == user_id).all()
    return [
        {
            "id": s.id,
            "service_name": s.service_name,
            "plan_name": s.plan_name,
            "amount_paise": s.amount_paise,
            "amount_rupees": s.amount_paise / 100.0,
            "billing_cycle": s.billing_cycle,
            "status": s.status,
            "trial_ends_at": s.trial_ends_at.isoformat() if s.trial_ends_at else None,
            "created_at": s.created_at.isoformat() if s.created_at else None
        }
        for s in subs
    ]

@router.post("/cancel")
def cancel_subscription_endpoint(body: CancelSubscriptionRequest, db: Session = Depends(get_db)):
    success, message = SubscriptionService.cancel_subscription(db, body.service_name, body.user_id)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"status": "SUCCESS", "message": message}
