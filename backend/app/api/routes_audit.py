import logging
from typing import Optional, List
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.audit import AuditLog

logger = logging.getLogger("defai.api.audit")
router = APIRouter(tags=["Audit Logs"])

@router.get("/api/audit-logs")
def get_audit_logs(
    userId: Optional[str] = Query("user_1"),
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """
    Returns audit trail events matching AuditLogViewer.jsx schema.
    """
    query = db.query(AuditLog)
    if userId:
        query = query.filter(AuditLog.user_id == userId)
    
    logs = query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

    return [
        {
            "id": log.id,
            "timestamp": log.timestamp.isoformat() if log.timestamp else None,
            "action": log.action,
            "details": log.details,
            "transaction_id": log.transaction_id
        }
        for log in logs
    ]
