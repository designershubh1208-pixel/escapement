import uuid
import logging
from typing import Tuple, Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.mock_bank import MockBankAccount, MockBankLedger
from app.models.financial import Transaction

logger = logging.getLogger("defai.mock_payment")

class MockPaymentExecutor:
    @staticmethod
    def get_or_create_account(db: Session, user_id: str = "user_1") -> MockBankAccount:
        account = db.query(MockBankAccount).filter(MockBankAccount.user_id == user_id).first()
        if not account:
            account = MockBankAccount(
                user_id=user_id,
                account_number="IN99DEF" + str(uuid.uuid4().int)[:10],
                balance_paise=5000000,  # ₹50,000 initial balance in paise
                reserved_paise=0,
                currency="INR",
                is_active=True
            )
            db.add(account)
            db.commit()
            db.refresh(account)
        return account

    @staticmethod
    def reserve_funds(
        db: Session,
        user_id: str,
        amount_paise: int,
        transaction_id: str
    ) -> Tuple[bool, str]:
        """
        Atomically locks account and reserves funds prior to settlement.
        """
        # Row locking to prevent concurrent balance overdrafts
        account = db.query(MockBankAccount).filter(
            MockBankAccount.user_id == user_id
        ).with_for_update().first()

        if not account:
            account = MockPaymentExecutor.get_or_create_account(db, user_id)

        available_funds = account.balance_paise - account.reserved_paise
        if available_funds < amount_paise:
            logger.warning("Insufficient funds: available=%d paise, requested=%d paise", available_funds, amount_paise)
            return False, "INSUFFICIENT_FUNDS"

        account.reserved_paise += amount_paise
        
        # Record reservation ledger entry
        ledger_entry = MockBankLedger(
            account_id=account.id,
            transaction_id=transaction_id,
            entry_type="RESERVE",
            amount_paise=amount_paise,
            balance_after_paise=account.balance_paise - account.reserved_paise,
            description=f"Fund reservation for transaction {transaction_id}"
        )
        db.add(ledger_entry)
        db.commit()
        return True, "FUNDS_RESERVED"

    @staticmethod
    def release_reservation(
        db: Session,
        user_id: str,
        amount_paise: int,
        transaction_id: str
    ) -> bool:
        """
        Releases reserved funds after a failure or rejection.
        """
        account = db.query(MockBankAccount).filter(
            MockBankAccount.user_id == user_id
        ).with_for_update().first()

        if not account:
            return False

        account.reserved_paise = max(0, account.reserved_paise - amount_paise)
        ledger_entry = MockBankLedger(
            account_id=account.id,
            transaction_id=transaction_id,
            entry_type="RELEASE",
            amount_paise=amount_paise,
            balance_after_paise=account.balance_paise - account.reserved_paise,
            description=f"Released reservation for failed transaction {transaction_id}"
        )
        db.add(ledger_entry)
        db.commit()
        return True

    @staticmethod
    def execute_payment(
        db: Session,
        user_id: str,
        amount_paise: int,
        transaction_id: str,
        description: str
    ) -> Tuple[bool, str, Optional[str]]:
        """
        Debits funds from mock account with row locking and records ledger entry.
        Returns: (success: bool, status_message: str, payment_reference: str)
        """
        account = db.query(MockBankAccount).filter(
            MockBankAccount.user_id == user_id
        ).with_for_update().first()

        if not account:
            return False, "ACCOUNT_NOT_FOUND", None

        # Check total balance
        if account.balance_paise < amount_paise:
            return False, "INSUFFICIENT_BALANCE", None

        # Deduct balance and clear reservation
        account.balance_paise -= amount_paise
        account.reserved_paise = max(0, account.reserved_paise - amount_paise)

        payment_ref = "PAY-INR-" + uuid.uuid4().hex[:12].upper()

        ledger_entry = MockBankLedger(
            account_id=account.id,
            transaction_id=transaction_id,
            entry_type="DEBIT",
            amount_paise=amount_paise,
            balance_after_paise=account.balance_paise,
            description=f"{description} (Ref: {payment_ref})"
        )
        db.add(ledger_entry)
        db.commit()

        logger.info(f"Payment executed successfully: {payment_ref}, amount={amount_paise} paise, new balance={account.balance_paise}")
        return True, "PAYMENT_EXECUTED", payment_ref
