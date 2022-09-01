// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

error InvalidOwner();

contract ENS {
    struct Record {
        address owner;
        address resolver;
        uint64 ttl;
    }

    bytes32 constant NULL = "";

    mapping(bytes32 => Record) records;

    event NewOwner(bytes32 indexed node, bytes32 indexed label, address owner);
    event Transfer(bytes32 indexed node, address owner);
    event NewResolver(bytes32 indexed node, address resolver);
    event NewTTL(bytes32 indexed node, uint64 ttl);

    modifier only_owner(bytes32 node) {
        if (records[node].owner != msg.sender) revert InvalidOwner();
        _;
    }

    constructor(address _owner, bytes32 _node) {
        records[_node].owner = _owner;
    }

    function owner(bytes32 _node) public view returns (address) {
        return records[_node].owner;
    }

    function resolver(bytes32 _node) public view returns (address) {
        return records[_node].resolver;
    }

    function ttl(bytes32 _node) public view returns (uint64) {
        return records[_node].ttl;
    }

    function setOwner(bytes32 _node, address _owner) public only_owner(_node) {
        records[_node].owner = _owner;
        emit Transfer(_node, _owner);
    }

    function setSubnodeOwner(
        bytes32 _node,
        bytes32 _label,
        address _owner
    ) public {
        bytes32 subnode = keccak256(abi.encode(_node, _label));
        records[subnode].owner = _owner;
        emit NewOwner(_node, _label, _owner);
    }

    function setResolver(bytes32 _node, address _resolver)
        public
        only_owner(_node)
    {
        records[_node].resolver = _resolver;
        emit NewResolver(_node, _resolver);
    }

    function setTTL(bytes32 _node, uint64 _ttl) public only_owner(_node) {
        records[_node].ttl = _ttl;
        emit NewTTL(_node, _ttl);
    }
}
