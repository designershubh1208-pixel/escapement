import logging
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.mock_payment import MockPaymentExecutor
from app.models.mock_bank import MockBankLedger

logger = logging.getLogger("defai.api.mock_bank")
router = APIRouter(prefix="/api/mock-bank", tags=["Mock Bank & Ledger"])

@router.get("/account")
def get_mock_bank_account(user_id: str = "user_1", db: Session = Depends(get_db)):
    account = MockPaymentExecutor.get_or_create_account(db, user_id)
    return {
        "id": account.id,
        "user_id": account.user_id,
        "account_number": account.account_number,
        "balance_paise": account.balance_paise,
        "balance_rupees": account.balance_paise / 100.0,
        "reserved_paise": account.reserved_paise,
        "reserved_rupees": account.reserved_paise / 100.0,
        "available_paise": account.balance_paise - account.reserved_paise,
        "available_rupees": (account.balance_paise - account.reserved_paise) / 100.0,
        "currency": account.currency,
        "is_active": account.is_active
    }

@router.get("/ledger")
def get_mock_bank_ledger(user_id: str = "user_1", db: Session = Depends(get_db)):
    account = MockPaymentExecutor.get_or_create_account(db, user_id)
    entries = db.query(MockBankLedger).filter(
        MockBankLedger.account_id == account.id
    ).order_by(MockBankLedger.created_at.desc()).limit(50).all()

    return [
        {
            "id": e.id,
            "transaction_id": e.transaction_id,
            "entry_type": e.entry_type,
            "amount_paise": e.amount_paise,
            "amount_rupees": e.amount_paise / 100.0,
            "balance_after_paise": e.balance_after_paise,
            "balance_after_rupees": e.balance_after_paise / 100.0,
            "description": e.description,
            "created_at": e.created_at.isoformat() if e.created_at else None
        }
        for e in entries
    ]
