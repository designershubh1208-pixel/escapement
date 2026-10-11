import logging
from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.financial import Transaction
from app.schemas.transaction import TransactionResponse

logger = logging.getLogger("defai.api.requests")
router = APIRouter(tags=["Requests & Transactions"])

@router.get("/api/requests")
def get_requests_feed(db: Session = Depends(get_db)):
    """
    Returns financial requests in the format expected by the frontend ChatInterface Request History.
    """
    rows = db.query(Transaction).order_by(Transaction.created_at.desc()).all()
    return [
        {
            "id": r.id,
            "session_id": r.session_id,
            "user_message": r.user_message,
            "intent_json": r.intent_json,
            "action": r.action or "PURCHASE",
            "merchant": r.merchant or "Unknown",
            "category": r.category or "General",
            "amount_paise": r.amount_paise or 0,
            "amount_inr": (r.amount_paise / 100.0) if r.amount_paise else 0.0,
            "currency": r.currency or "INR",
            "status": r.status,
            "policy_id": r.policy_id,
            "policy_decision": r.policy_decision,
            "policy_reasons": r.policy_reasons,
            "failure_reason": r.failure_reason,
            "tx_hash": r.tx_hash,
            "blockchain_permission_id": r.blockchain_permission_id,
            "approval_id": r.approval.id if r.approval else None,
            "approval_status": r.approval.status if r.approval else None,
            "created_at": r.created_at.isoformat() if r.created_at else None,
            "updated_at": r.updated_at.isoformat() if r.updated_at else None
        }
        for r in rows
    ]

@router.get("/api/transactions", response_model=List[TransactionResponse])
def get_all_transactions(db: Session = Depends(get_db)):
    transactions = db.query(Transaction).order_by(Transaction.created_at.desc()).all()
    return transactions

@router.get("/api/transactions/{tx_id}", response_model=TransactionResponse)
def get_transaction_by_id(tx_id: str, db: Session = Depends(get_db)):
    tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
    if not tx:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Transaction not found")
    return tx
