// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract DeFAIPolicy {
    struct Permission {
        address user;
        bytes32 policyId;
        address agent;
        uint256 maxAmount;
        uint256 spentAmount;
        uint256 expiresAt;
        bool active;
    }

    mapping(bytes32 => Permission) public permissions;
    
    event PermissionCreated(bytes32 indexed permissionId, address indexed user, address indexed agent, uint256 maxAmount);
    event PermissionRevoked(bytes32 indexed permissionId);
    event SpendRecorded(bytes32 indexed permissionId, uint256 amount);

    function createPermission(
        bytes32 permissionId,
        bytes32 policyId,
        address agent,
        uint256 maxAmount,
        uint256 durationSeconds
    ) external {
        require(!permissions[permissionId].active, "Permission already exists");
        
        permissions[permissionId] = Permission({
            user: msg.sender,
            policyId: policyId,
            agent: agent,
            maxAmount: maxAmount,
            spentAmount: 0,
            expiresAt: block.timestamp + durationSeconds,
            active: true
        });
        
        emit PermissionCreated(permissionId, msg.sender, agent, maxAmount);
    }

    function revokePermission(bytes32 permissionId) external {
        require(permissions[permissionId].user == msg.sender, "Only owner can revoke");
        permissions[permissionId].active = false;
        
        emit PermissionRevoked(permissionId);
    }

    function isPermissionValid(bytes32 permissionId, uint256 requestedAmount) public view returns (bool) {
        Permission storage p = permissions[permissionId];
        
        if (!p.active) return false;
        if (block.timestamp > p.expiresAt) return false;
        if (p.spentAmount + requestedAmount > p.maxAmount) return false;
        
        return true;
    }

    function recordSpend(bytes32 permissionId, uint256 amount) external {
        require(isPermissionValid(permissionId, amount), "Invalid permission or amount exceeds allowance");
        // In a real implementation, only the agent or authorized executor should be able to record spend.
        
        permissions[permissionId].spentAmount += amount;
        emit SpendRecorded(permissionId, amount);
    }
}
