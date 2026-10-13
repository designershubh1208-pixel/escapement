import logging
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.financial import Subscription
from app.services.subscription_service import SubscriptionService
from app.services.auth_service import AuthService

logger = logging.getLogger("defai.api.subscriptions")
router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

class CancelSubscriptionRequest(BaseModel):
    service_name: str
    user_id: str = "user_1"

class CreateSubscriptionRequest(BaseModel):
    service_name: str
    plan_name: Optional[str] = "Standard"
    amount_rupees: float
    billing_cycle: Optional[str] = "monthly"

@router.get("")
def get_user_subscriptions(
    authorization: Optional[str] = Header(None),
    user_id: Optional[str] = None, 
    db: Session = Depends(get_db)
):
    resolved_id = AuthService.resolve_user_id(db, authorization, user_id)
    subs = db.query(Subscription).filter(Subscription.user_id == resolved_id).all()
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

@router.post("")
def add_user_subscription(
    body: CreateSubscriptionRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    resolved_id = AuthService.resolve_user_id(db, authorization, None)
    new_sub = Subscription(
        user_id=resolved_id,
        service_name=body.service_name.strip(),
        plan_name=body.plan_name.strip() if body.plan_name else "Standard",
        amount_paise=int(round(body.amount_rupees * 100)),
        billing_cycle=body.billing_cycle or "monthly",
        status="ACTIVE"
    )
    db.add(new_sub)
    db.commit()
    db.refresh(new_sub)
    return {
        "success": True,
        "subscription": {
            "id": new_sub.id,
            "service_name": new_sub.service_name,
            "plan_name": new_sub.plan_name,
            "amount_rupees": new_sub.amount_paise / 100.0,
            "status": new_sub.status
        }
    }

@router.delete("/{subscription_id}")
def delete_user_subscription(
    subscription_id: str,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    resolved_id = AuthService.resolve_user_id(db, authorization, None)
    sub = db.query(Subscription).filter(
        Subscription.id == subscription_id,
        Subscription.user_id == resolved_id
    ).first()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found")
    db.delete(sub)
    db.commit()
    return {"success": True, "message": "Subscription removed"}

@router.post("/cancel")
def cancel_subscription_endpoint(
    body: CancelSubscriptionRequest, 
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    resolved_id = AuthService.resolve_user_id(db, authorization, body.user_id)
    success, message = SubscriptionService.cancel_subscription(db, body.service_name, resolved_id)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"status": "SUCCESS", "message": message}
