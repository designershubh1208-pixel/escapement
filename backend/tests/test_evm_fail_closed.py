import pytest
from app.services.evm_service import evm_service

def test_evm_unreachable_node_fails_closed():
    """
    FAIL-CLOSED PROPERTY:
    If local EVM node / Anvil RPC is offline or unreachable,
    verify_permission MUST return False with fail-closed reason.
    A blockchain outage must NEVER result in automatic approval.
    """
    perm_id = "0x" + "11" * 32
    # Ensure offline port is tested
    evm_service.rpc_url = "http://127.0.0.1:59999"  # non-existent port
    evm_service._w3 = None

    valid, reason = evm_service.verify_permission(perm_id, 50000)
    assert valid is False
    assert "FAIL_CLOSED" in reason or "UNREACHABLE" in reason

def test_evm_invalid_permission_format_fails_closed():
    """Malformed or invalid permission format fails closed"""
    valid, reason = evm_service.verify_permission("", 50000)
    assert valid is False
