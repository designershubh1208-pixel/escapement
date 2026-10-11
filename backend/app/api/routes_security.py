import logging
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.kill_switch import kill_switch
from app.services.audit_service import AuditService

logger = logging.getLogger("defai.api.security")
router = APIRouter(prefix="/api/security", tags=["Security & Kill Switch"])

@router.get("/kill-switch")
def get_kill_switch_status(user_id: str = "user_1"):
    return {
        "user_id": user_id,
        "is_active": kill_switch.is_active(user_id)
    }

@router.post("/kill-switch/trigger")
def trigger_kill_switch(user_id: str = "user_1", db: Session = Depends(get_db)):
    kill_switch.trigger(user_id)
    AuditService.record_event(
        db=db,
        action="KILL_SWITCH_TRIGGERED",
        details="User engaged emergency kill switch. All autonomous execution blocked.",
        user_id=user_id
    )
    return {
        "status": "TRIGGERED",
        "is_active": True,
        "message": "Emergency kill switch activated. All financial executions are now blocked."
    }

@router.post("/kill-switch/reset")
def reset_kill_switch(user_id: str = "user_1", db: Session = Depends(get_db)):
    kill_switch.reset(user_id)
    AuditService.record_event(
        db=db,
        action="KILL_SWITCH_RESET",
        details="User reset emergency kill switch. Policy controls resumed.",
        user_id=user_id
    )
    return {
        "status": "RESET",
        "is_active": False,
        "message": "Emergency kill switch has been reset. Standard policy controls are in effect."
    }
