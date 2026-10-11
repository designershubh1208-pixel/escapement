import json
import logging
from typing import Any, Optional, Dict
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.session_key import UserSessionKey
from app.services.browser_automation import BrowserAutomationService
from app.services.audit_service import AuditService

logger = logging.getLogger("defai.api.session_keys")
router = APIRouter(prefix="/api/session-keys", tags=["Session Keys"])

class SessionKeyUploadRequest(BaseModel):
    user_id: Optional[str] = "user_1"
    merchant: str  # "Flipkart", "Amazon"
    session_name: Optional[str] = "Personal Account"
    cookies: Any  # JSON array of cookie objects or raw cookie export

@router.post("")
def register_session_key(req: SessionKeyUploadRequest, db: Session = Depends(get_db)):
    """
    Uploads an authenticated e-commerce session key (cookies/storage state).
    ZERO-PASSWORD GUARANTEE: Never collects user passwords.
    """
    user_id = req.user_id or "user_1"
    key = BrowserAutomationService.save_session_key(
        db=db,
        user_id=user_id,
        merchant=req.merchant,
        session_name=req.session_name or f"{req.merchant} Session",
        cookies=req.cookies
    )

    AuditService.record_event(
        db=db,
        action="SESSION_KEY_REGISTERED",
        details={"merchant": req.merchant, "session_name": key.session_name},
        user_id=user_id
    )

    return {
        "status": "SUCCESS",
        "message": f"Session key for {req.merchant} registered successfully without passwords.",
        "id": key.id,
        "merchant": key.merchant,
        "session_name": key.session_name,
        "is_active": key.is_active
    }

@router.get("")
def list_session_keys(user_id: str = "user_1", db: Session = Depends(get_db)):
    """
    Lists all registered session keys for the user (cookie content is masked for security).
    """
    return BrowserAutomationService.list_session_keys(db, user_id)

@router.delete("/{key_id}")
def delete_session_key(key_id: str, db: Session = Depends(get_db)):
    """
    Revokes and permanently deletes a session key.
    """
    key = db.query(UserSessionKey).filter(UserSessionKey.id == key_id).first()
    if not key:
        raise HTTPException(status_code=404, detail="Session key not found")

    user_id = key.user_id
    merchant = key.merchant
    db.delete(key)
    db.commit()

    AuditService.record_event(
        db=db,
        action="SESSION_KEY_REVOKED",
        details={"merchant": merchant, "key_id": key_id},
        user_id=user_id
    )

    return {"status": "SUCCESS", "message": f"Session key for {merchant} deleted."}
