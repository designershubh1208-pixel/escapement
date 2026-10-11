from typing import List, Optional
from pydantic import BaseModel, Field

class PolicyConfigSchema(BaseModel):
    daily_limit: int = Field(200000, description="Daily limit in integer paise")
    per_transaction_limit: int = Field(50000, description="Per-transaction hard limit in integer paise")
    monthly_limit: int = Field(1000000, description="Monthly limit in integer paise")
    approval_threshold: int = Field(50000, description="Automatic approval threshold in integer paise")
    allowlisted_merchants: List[str] = Field(default_factory=lambda: ["Amazon", "Flipkart"])
    blocked_merchants: Optional[List[str]] = Field(default_factory=list)
    allowlisted_categories: Optional[List[str]] = Field(default_factory=lambda: ["electronics", "books", "groceries", "subscription", "ticket"])
    blocked_categories: Optional[List[str]] = Field(default_factory=lambda: ["gambling", "crypto", "adult"])

class PolicyResponseSchema(PolicyConfigSchema):
    id: Optional[str] = None
    user_id: Optional[str] = None
    version: int = 1
    is_active: bool = True
