from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict

class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    idempotency_key: Optional[str] = None
    session_id: Optional[str] = None
    user_id: Optional[str] = None
    user_message: Optional[str] = None
    intent_json: Optional[str] = None
    action: Optional[str] = None
    merchant: Optional[str] = None
    category: Optional[str] = None
    amount_paise: Optional[int] = None
    currency: str = "INR"
    status: str
    policy_decision: Optional[str] = None
    policy_reasons: Optional[str] = None
    blockchain_permission_id: Optional[str] = None
    tx_hash: Optional[str] = None
    created_at: datetime

class ApprovalDecisionRequest(BaseModel):
    decision: str  # "APPROVE" or "REJECT"
    reasons: Optional[str] = None
