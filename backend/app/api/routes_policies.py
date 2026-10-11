import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.policy import UserPolicy, PolicyVersion
from app.models.user import User
from app.schemas.policy import PolicyConfigSchema, PolicyResponseSchema
from app.services.audit_service import AuditService

logger = logging.getLogger("defai.api.policies")
router = APIRouter(prefix="/api/policies", tags=["Policies"])

@router.get("/{user_id}", response_model=PolicyResponseSchema)
def get_user_policy(user_id: str, db: Session = Depends(get_db)):
    policy = db.query(UserPolicy).filter(
        UserPolicy.user_id == user_id,
        UserPolicy.is_active == True
    ).first()

    if not policy:
        # Create default user & policy if not exists
        user = db.query(User).filter(User.id == user_id).first()
        if not user:
            user = User(id=user_id, name="Default User")
            db.add(user)
            db.commit()

        policy = UserPolicy(
            user_id=user_id,
            daily_limit_paise=200000,
            per_transaction_limit_paise=50000,
            monthly_limit_paise=1000000,
            approval_threshold_paise=50000,
            allowlisted_merchants='["Amazon", "Flipkart"]',
            blocked_merchants='[]',
            allowlisted_categories='["electronics", "books", "groceries", "subscription", "ticket"]',
            blocked_categories='["gambling", "crypto", "adult"]'
        )
        db.add(policy)
        db.commit()
        db.refresh(policy)

    return PolicyResponseSchema(
        id=policy.id,
        user_id=policy.user_id,
        version=policy.version,
        is_active=policy.is_active,
        daily_limit=policy.daily_limit_paise,
        per_transaction_limit=policy.per_transaction_limit_paise,
        monthly_limit=policy.monthly_limit_paise,
        approval_threshold=policy.approval_threshold_paise,
        allowlisted_merchants=json.loads(policy.allowlisted_merchants or "[]"),
        blocked_merchants=json.loads(policy.blocked_merchants or "[]"),
        allowlisted_categories=json.loads(policy.allowlisted_categories or "[]"),
        blocked_categories=json.loads(policy.blocked_categories or "[]")
    )

@router.put("/{user_id}", response_model=PolicyResponseSchema)
def update_user_policy(user_id: str, config: PolicyConfigSchema, db: Session = Depends(get_db)):
    policy = db.query(UserPolicy).filter(
        UserPolicy.user_id == user_id,
        UserPolicy.is_active == True
    ).first()

    if not policy:
        policy = UserPolicy(user_id=user_id)
        db.add(policy)

    # Update policy fields
    policy.daily_limit_paise = config.daily_limit
    policy.per_transaction_limit_paise = config.per_transaction_limit
    policy.monthly_limit_paise = config.monthly_limit
    policy.approval_threshold_paise = config.approval_threshold
    policy.allowlisted_merchants = json.dumps(config.allowlisted_merchants)
    policy.blocked_merchants = json.dumps(config.blocked_merchants or [])
    policy.allowlisted_categories = json.dumps(config.allowlisted_categories or [])
    policy.blocked_categories = json.dumps(config.blocked_categories or [])
    policy.version += 1

    # Persist immutable version snapshot
    snapshot = PolicyVersion(
        policy_id=policy.id,
        version_number=policy.version,
        snapshot_json=config.model_dump_json()
    )
    db.add(snapshot)
    db.commit()
    db.refresh(policy)

    # Record Audit Log
    AuditService.record_event(
        db=db,
        action="POLICY_UPDATED",
        details={
            "version": policy.version,
            "daily_limit_paise": policy.daily_limit_paise,
            "per_tx_limit_paise": policy.per_transaction_limit_paise,
            "merchants": config.allowlisted_merchants
        },
        user_id=user_id
    )

    return get_user_policy(user_id, db)
