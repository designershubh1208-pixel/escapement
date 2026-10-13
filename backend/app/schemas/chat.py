from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import datetime
from app.schemas.intent import StructuredIntent

class ChatMessageRequest(BaseModel):
    message: str
    session_id: Optional[str] = None
    user_id: Optional[str] = "user_1"

class ChatSessionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: str
    title: Optional[str] = None
    created_at: datetime

class ChatMessageItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    role: str
    content: str
    timestamp: datetime
    intent_json: Optional[str] = None

class ChatResponse(BaseModel):
    session_id: str
    response: str
    intent: Optional[StructuredIntent] = None
    hasFinancialIntent: bool = False
    decision: Optional[str] = None  # APPROVE, REQUIRE_APPROVAL, BLOCK, NONE
    policy_reasons: Optional[List[str]] = None
    transaction_id: Optional[str] = None

class UpdateChatSessionRequest(BaseModel):
    title: Optional[str] = None

