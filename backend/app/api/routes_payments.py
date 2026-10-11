import json
import logging
from typing import Optional, Dict
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import settings
from app.models.financial import Transaction
from app.models.payment_order import PaymentOrder
from app.services.payment_gateway_service import PaymentGatewayService
from app.services.audit_service import AuditService

logger = logging.getLogger("defai.api.payments")
router = APIRouter(prefix="/api/payments", tags=["Payments"])

class CreateOrderRequest(BaseModel):
    transaction_id: str
    idempotency_key: Optional[str] = None

class VerifyPaymentRequest(BaseModel):
    order_id: str
    payment_id: str
    signature: str

@router.post("/create-order")
def create_payment_gateway_order(req: CreateOrderRequest, db: Session = Depends(get_db)):
    """
    Creates a scoped payment gateway order (Razorpay Sandbox/Live) for an authorized transaction.
    CRITICAL SECURITY CHECK: Never creates a payment order if transaction is BLOCKED or requires approval.
    """
    tx = db.query(Transaction).filter(Transaction.id == req.transaction_id).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    if tx.status not in ["AUTHORIZED", "PENDING", "COMPLETED"]:
        raise HTTPException(
            status_code=400,
            detail=f"Cannot initiate payment gateway order: transaction is in state {tx.status}"
        )

    idemp_key = req.idempotency_key or f"order-{tx.id}-{int(tx.created_at.timestamp())}"
    ok, order, msg = PaymentGatewayService.create_order(
        db=db,
        transaction_id=tx.id,
        amount_paise=tx.amount_paise or 0,
        idempotency_key=idemp_key,
        notes={"merchant": tx.merchant or "Unknown", "user_id": tx.user_id}
    )

    if not ok:
        AuditService.record_event(
            db=db,
            action="GATEWAY_ORDER_CREATION_FAILED",
            details={"error": msg, "transaction_id": tx.id},
            user_id=tx.user_id,
            transaction_id=tx.id
        )
        raise HTTPException(status_code=400, detail=msg)

    AuditService.record_event(
        db=db,
        action="GATEWAY_ORDER_CREATED",
        details={
            "provider_order_id": order.provider_order_id,
            "amount_paise": order.amount_paise,
            "provider": order.provider
        },
        user_id=tx.user_id,
        transaction_id=tx.id
    )

    return {
        "status": "ORDER_CREATED",
        "provider": order.provider,
        "provider_order_id": order.provider_order_id,
        "amount_paise": order.amount_paise,
        "currency": order.currency,
        "key_id": settings.RAZORPAY_KEY_ID or "rzp_sandbox_sentinel_mock"
    }

@router.post("/verify")
def verify_payment_signature(req: VerifyPaymentRequest, db: Session = Depends(get_db)):
    """
    Verifies the client-submitted payment signature against server HMAC-SHA256 secret.
    Guarantees non-repudiation: client cannot falsify a successful payment.
    """
    order = db.query(PaymentOrder).filter(PaymentOrder.provider_order_id == req.order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Payment order not found")

    valid, reason = PaymentGatewayService.verify_payment_signature(
        order_id=req.order_id,
        payment_id=req.payment_id,
        signature=req.signature
    )

    if not valid:
        order.status = "FAILED"
        db.commit()
        AuditService.record_event(
            db=db,
            action="PAYMENT_SIGNATURE_VERIFICATION_FAILED",
            details={"order_id": req.order_id, "payment_id": req.payment_id},
            user_id=order.transaction.user_id if order.transaction else "unknown",
            transaction_id=order.transaction_id
        )
        raise HTTPException(status_code=400, detail="Invalid cryptographic payment signature")

    # Mark order captured & transaction completed
    order.status = "CAPTURED"
    order.provider_payment_id = req.payment_id
    order.provider_signature = req.signature
    
    tx = order.transaction
    if tx:
        tx.status = "COMPLETED"
        tx.tx_hash = req.payment_id
    db.commit()

    AuditService.record_event(
        db=db,
        action="PAYMENT_SIGNATURE_VERIFIED_SUCCESS",
        details={"order_id": req.order_id, "payment_id": req.payment_id},
        user_id=tx.user_id if tx else "unknown",
        transaction_id=order.transaction_id
    )

    return {
        "status": "PAYMENT_VERIFIED",
        "order_id": req.order_id,
        "payment_id": req.payment_id,
        "transaction_status": "COMPLETED"
    }
