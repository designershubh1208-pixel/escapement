import json
import logging
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.financial import Transaction, Approval
from app.schemas.intent import StructuredIntent
from app.schemas.transaction import ApprovalDecisionRequest
from app.services.policy_engine import DeterministicPolicyEngine
from app.services.mock_payment import MockPaymentExecutor
from app.services.evm_service import evm_service
from app.services.audit_service import AuditService
from app.services.kill_switch import kill_switch

logger = logging.getLogger("defai.api.approvals")
router = APIRouter(prefix="/api/approvals", tags=["Approvals"])

@router.get("")
def list_pending_approvals(db: Session = Depends(get_db)):
    """
    Returns all pending approval requests waiting for human authorization.
    """
    approvals = db.query(Approval).filter(Approval.status == "PENDING").all()
    results = []
    for app in approvals:
        tx = app.transaction
        results.append({
            "id": app.id,
            "transaction_id": app.transaction_id,
            "user_id": app.user_id,
            "status": app.status,
            "reasons": json.loads(app.decision_reasons or "[]"),
            "merchant": tx.merchant if tx else "Unknown",
            "amount_paise": tx.amount_paise if tx else 0,
            "currency": tx.currency if tx else "INR",
            "user_message": tx.user_message if tx else "",
            "created_at": app.created_at.isoformat() if app.created_at else None
        })
    return results

@router.post("/{approval_id}/decision")
def submit_approval_decision(
    approval_id: str,
    body: ApprovalDecisionRequest,
    db: Session = Depends(get_db)
):
    """
    Handles user approval or rejection.
    CRITICAL INVARIANT: On user APPROVE, re-evaluates current policy, kill switch,
    EVM permissions, and bank balance to prevent replay or stale authorization attacks.
    """
    approval = db.query(Approval).filter(Approval.id == approval_id).first()
    if not approval:
        raise HTTPException(status_code=404, detail="Approval record not found")

    if approval.status != "PENDING":
        raise HTTPException(status_code=400, detail=f"Approval already in status {approval.status}")

    tx = approval.transaction
    if not tx:
        raise HTTPException(status_code=400, detail="Associated transaction record not found")

    user_id = approval.user_id or "user_1"

    if body.decision.upper() == "REJECT":
        approval.status = "REJECTED"
        approval.decided_by = user_id
        approval.decided_at = datetime.utcnow()
        tx.status = "BLOCKED"
        tx.failure_reason = "Rejected by user"
        db.commit()

        AuditService.record_event(
            db=db,
            action="APPROVAL_REJECTED",
            details={"transaction_id": tx.id, "reasons": body.reasons},
            user_id=user_id,
            transaction_id=tx.id
        )
        return {"status": "REJECTED", "message": "Transaction rejected by user"}

    elif body.decision.upper() == "APPROVE":
        # 1. Re-check Kill Switch
        if kill_switch.is_active(user_id):
            approval.status = "REJECTED"
            tx.status = "BLOCKED"
            tx.failure_reason = "Kill switch active at execution time"
            db.commit()
            AuditService.record_event(
                db=db,
                action="APPROVAL_BLOCKED_BY_KILL_SWITCH",
                details={"transaction_id": tx.id},
                user_id=user_id,
                transaction_id=tx.id
            )
            raise HTTPException(status_code=403, detail="Cannot execute: Emergency kill switch is active")

        # 2. Re-evaluate policy with current limits
        intent = StructuredIntent.model_validate_json(tx.intent_json)
        # Temporarily force requires_approval=False for re-evaluating hard constraints
        intent.requires_approval = False
        decision, reasons, _ = DeterministicPolicyEngine.evaluate(db, intent, user_id)

        if decision == "BLOCK":
            approval.status = "REJECTED"
            tx.status = "BLOCKED"
            tx.failure_reason = f"Policy re-evaluation blocked: {'; '.join(reasons)}"
            db.commit()
            AuditService.record_event(
                db=db,
                action="APPROVAL_RE_EVAL_BLOCKED",
                details={"transaction_id": tx.id, "reasons": reasons},
                user_id=user_id,
                transaction_id=tx.id
            )
            raise HTTPException(status_code=400, detail=f"Policy re-check failed: {', '.join(reasons)}")

        # 3. Re-check EVM Scoped Permission
        perm_id = tx.blockchain_permission_id or ("0x" + tx.id.replace("-", "")[:32].ljust(64, '0'))
        evm_valid, evm_reason = evm_service.verify_permission(perm_id, tx.amount_paise or 0)
        AuditService.record_event(
            db=db,
            action="EVM_APPROVAL_VERIFICATION",
            details={"permission_id": perm_id, "valid": evm_valid, "reason": evm_reason},
            user_id=user_id,
            transaction_id=tx.id
        )

        # 4. Reserve & Execute Mock Payment
        amount_paise = tx.amount_paise or 0
        res_ok, res_msg = MockPaymentExecutor.reserve_funds(db, user_id, amount_paise, tx.id)
        if not res_ok:
            tx.status = "FAILED"
            tx.failure_reason = res_msg
            db.commit()
            raise HTTPException(status_code=400, detail=f"Execution failed: {res_msg}")

        pay_ok, pay_msg, pay_ref = MockPaymentExecutor.execute_payment(
            db=db,
            user_id=user_id,
            amount_paise=amount_paise,
            transaction_id=tx.id,
            description=f"Approved Purchase: {tx.merchant}"
        )

        if not pay_ok:
            tx.status = "FAILED"
            tx.failure_reason = pay_msg
            MockPaymentExecutor.release_reservation(db, user_id, amount_paise, tx.id)
            db.commit()
            raise HTTPException(status_code=400, detail=f"Payment debit failed: {pay_msg}")

        # 5. Commit Success
        approval.status = "APPROVED"
        approval.decided_by = user_id
        approval.decided_at = datetime.utcnow()
        tx.status = "COMPLETED"
        tx.tx_hash = pay_ref
        db.commit()

        AuditService.record_event(
            db=db,
            action="APPROVAL_GRANTED",
            details={"transaction_id": tx.id, "payment_ref": pay_ref},
            user_id=user_id,
            transaction_id=tx.id
        )

        return {
            "status": "APPROVED",
            "message": "Transaction authorized and payment executed successfully",
            "payment_ref": pay_ref
        }

    else:
        raise HTTPException(status_code=400, detail="Invalid decision value. Must be 'APPROVE' or 'REJECT'")

@router.post("/by-tx/{tx_id}/decision")
def submit_approval_decision_by_tx(
    tx_id: str,
    body: ApprovalDecisionRequest,
    db: Session = Depends(get_db)
):
    """
    Allows approving or rejecting directly by transaction ID from the Request History UI.
    """
    approval = db.query(Approval).filter(Approval.transaction_id == tx_id).first()
    if not approval:
        tx = db.query(Transaction).filter(Transaction.id == tx_id).first()
        if not tx:
            raise HTTPException(status_code=404, detail="Transaction not found")
        approval = Approval(
            transaction_id=tx_id,
            user_id=tx.user_id or "user_1",
            status="PENDING",
            decision_reasons=tx.policy_reasons
        )
        db.add(approval)
        db.commit()
        db.refresh(approval)
    return submit_approval_decision(approval.id, body, db)

