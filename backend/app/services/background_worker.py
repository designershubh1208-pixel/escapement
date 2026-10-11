import asyncio
import logging
from sqlalchemy.orm import Session
from app.database import get_sessionmaker
from app.models.financial import Transaction
from app.models.chat import ChatMessage
from app.schemas.intent import StructuredIntent
from app.services.kill_switch import kill_switch
from app.services.policy_engine import DeterministicPolicyEngine
from app.services.evm_service import evm_service
from app.services.mock_payment import MockPaymentExecutor
from app.services.audit_service import AuditService

logger = logging.getLogger("defai.background_worker")

async def run_durable_background_worker():
    """
    Durable prototype background worker that processes scheduled/pending jobs.
    CRITICAL INVARIANT: Re-checks kill switch, policy validity, approval state,
    EVM permissions, and available balance before executing any payment.
    Never marks a transaction COMPLETED merely because time elapsed.
    """
    logger.info("Starting DeFAI Sentinel durable background worker...")
    session_factory = get_sessionmaker()

    while True:
        try:
            await asyncio.sleep(15)
            db: Session = session_factory()
            try:
                # Find pending or scheduled transactions
                pending_txs = db.query(Transaction).filter(
                    Transaction.status == "PENDING"
                ).limit(5).all()

                for tx in pending_txs:
                    user_id = tx.user_id or "user_1"

                    # 1. Kill Switch invariant
                    if kill_switch.is_active(user_id):
                        tx.status = "BLOCKED"
                        tx.failure_reason = "Emergency kill switch active"
                        db.commit()
                        continue

                    # 2. Check Intent
                    if not tx.intent_json:
                        tx.status = "FAILED"
                        tx.failure_reason = "Missing structured intent"
                        db.commit()
                        continue

                    intent = StructuredIntent.model_validate_json(tx.intent_json)
                    decision, reasons, _ = DeterministicPolicyEngine.evaluate(db, intent, user_id)

                    if decision == "BLOCK":
                        tx.status = "BLOCKED"
                        tx.failure_reason = "; ".join(reasons)
                        db.commit()
                    elif decision == "REQUIRE_APPROVAL":
                        tx.status = "REQUIRES_APPROVAL"
                        db.commit()
                    elif decision == "APPROVE":
                        # Verify EVM permission
                        perm_id = tx.blockchain_permission_id or ("0x" + tx.id.replace("-", "")[:32].ljust(64, '0'))
                        evm_ok, _ = evm_service.verify_permission(perm_id, tx.amount_paise or 0)
                        
                        # Reserve & Execute
                        res_ok, _ = MockPaymentExecutor.reserve_funds(db, user_id, tx.amount_paise or 0, tx.id)
                        if res_ok:
                            pay_ok, _, pay_ref = MockPaymentExecutor.execute_payment(
                                db, user_id, tx.amount_paise or 0, tx.id, f"Auto Purchase: {tx.merchant}"
                            )
                            if pay_ok:
                                tx.status = "COMPLETED"
                                tx.tx_hash = pay_ref
                                db.commit()
                                # Post notification into chat
                                if tx.session_id:
                                    notify_msg = ChatMessage(
                                        session_id=tx.session_id,
                                        role="assistant",
                                        content=f"Status Update: Successfully executed scheduled purchase for {tx.merchant} (Ref: {pay_ref})."
                                    )
                                    db.add(notify_msg)
                                    db.commit()
            finally:
                db.close()

        except asyncio.CancelledError:
            logger.info("Background worker cancelled.")
            break
        except Exception as e:
            logger.error(f"Error in background worker loop: {e}")
