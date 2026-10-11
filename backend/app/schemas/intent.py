from typing import Optional, Literal
from pydantic import BaseModel, Field, field_validator, model_validator

SupportedAction = Literal[
    "PURCHASE",
    "TRANSFER",
    "CANCEL_SUBSCRIPTION",
    "TICKET_PURCHASE",
    "NONE"
]

class StructuredIntent(BaseModel):
    action: SupportedAction
    merchant: Optional[str] = None
    category: Optional[str] = None
    amount_paise: Optional[int] = Field(None, description="Amount in integer paise (e.g. ₹500 is 50000)")
    currency: str = Field(default="INR", description="Three-letter currency code, INR-first")
    purpose: Optional[str] = None
    recurring: bool = False
    requires_approval: bool = False
    identifier: Optional[str] = Field(None, description="Product, subscription, or event identifier")
    uncertainty_notes: Optional[str] = None

    @field_validator("amount_paise")
    @classmethod
    def validate_amount(cls, v):
        if v is not None and v < 0:
            raise ValueError("Amount in paise must not be negative")
        if v is not None and v > 100_000_000_00:  # Max upper bound safeguard (₹1 Crore)
            raise ValueError("Amount exceeds maximum allowed system bounds")
        return v

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v):
        if v.upper() != "INR":
            raise ValueError("Only INR currency is supported in this prototype")
        return v.upper()

    @model_validator(mode="after")
    def validate_action_fields(self):
        if self.action in ["PURCHASE", "TICKET_PURCHASE"] and not self.merchant and not self.purpose:
            self.uncertainty_notes = "Missing merchant and item details for purchase action"
        return self
