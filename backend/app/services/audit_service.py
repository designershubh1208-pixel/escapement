import json
import logging
from typing import Any, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit import AuditLog

logger = logging.getLogger("defai.audit")

class AuditService:
    @staticmethod
    def record_event(
        db: Session,
        action: str,
        details: Any,
        user_id: str = "user_1",
        transaction_id: Optional[str] = None,
        ip_address: Optional[str] = None
    ) -> AuditLog:
        """
        Appends an immutable audit event to the audit_logs table.
        Sensitive data (pins, keys, secrets) must never be passed in details.
        """
        if isinstance(details, dict) or isinstance(details, list):
            details_str = json.dumps(details, default=str)
        else:
            details_str = str(details)

        log_entry = AuditLog(
            user_id=user_id,
            action=action.upper(),
            details=details_str,
            transaction_id=transaction_id,
            ip_address=ip_address,
            timestamp=datetime.utcnow()
        )
        db.add(log_entry)
        try:
            db.commit()
            db.refresh(log_entry)
        except Exception as e:
            db.rollback()
            logger.error(f"Failed to write audit log event {action}: {e}")
            raise
        
        return log_entry
