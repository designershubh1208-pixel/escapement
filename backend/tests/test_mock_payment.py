import pytest
from app.services.mock_payment import MockPaymentExecutor
from app.models.mock_bank import MockBankAccount, MockBankLedger

def test_mock_payment_execution_updates_balance_and_ledger(test_db):
    account = test_db.query(MockBankAccount).filter(MockBankAccount.user_id == "user_1").first()
    initial_balance = account.balance_paise  # 5,000,000 paise (₹50,000)

    # Reserve ₹500 (50,000 paise)
    res_ok, res_msg = MockPaymentExecutor.reserve_funds(test_db, "user_1", 50000, "tx-test-1")
    assert res_ok is True
    assert res_msg == "FUNDS_RESERVED"

    # Execute payment
    pay_ok, pay_msg, pay_ref = MockPaymentExecutor.execute_payment(
        test_db, "user_1", 50000, "tx-test-1", "Amazon Keyboard Purchase"
    )
    assert pay_ok is True
    assert pay_ref.startswith("PAY-INR-")

    # Verify balance decreased by 50,000 paise
    test_db.refresh(account)
    assert account.balance_paise == initial_balance - 50000
    assert account.reserved_paise == 0

    # Verify ledger entries (1 RESERVE + 1 DEBIT)
    ledger_entries = test_db.query(MockBankLedger).filter(MockBankLedger.account_id == account.id).all()
    assert len(ledger_entries) == 2
    debit_entry = [e for e in ledger_entries if e.entry_type == "DEBIT"][0]
    assert debit_entry.amount_paise == 50000
    assert debit_entry.balance_after_paise == initial_balance - 50000

def test_insufficient_funds_rejected(test_db):
    account = test_db.query(MockBankAccount).filter(MockBankAccount.user_id == "user_1").first()
    account.balance_paise = 10000  # ₹100
    test_db.commit()

    # Attempt to reserve ₹500 (50,000 paise)
    res_ok, res_msg = MockPaymentExecutor.reserve_funds(test_db, "user_1", 50000, "tx-test-2")
    assert res_ok is False
    assert res_msg == "INSUFFICIENT_FUNDS"

def test_release_reservation_on_failure(test_db):
    account = test_db.query(MockBankAccount).filter(MockBankAccount.user_id == "user_1").first()
    initial_balance = account.balance_paise

    # Reserve ₹500
    MockPaymentExecutor.reserve_funds(test_db, "user_1", 50000, "tx-test-3")
    assert account.reserved_paise == 50000

    # Failure occurs -> release reservation
    released = MockPaymentExecutor.release_reservation(test_db, "user_1", 50000, "tx-test-3")
    assert released is True

    test_db.refresh(account)
    assert account.reserved_paise == 0
    assert account.balance_paise == initial_balance
