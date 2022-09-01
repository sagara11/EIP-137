// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";
import "./ENS.sol";

contract FIFSRegistrar {
    ENS ens;
    bytes32 rootNode;

    constructor(address ensAddr, bytes32 node) {
        ens = ENS(ensAddr);
        rootNode = node;
    }

    event Register(
        bytes32 indexed _node,
        bytes32 indexed _label,
        address _owner
    );

    function register(bytes32 subnode, address owner) public {
        bytes32 node = keccak256(abi.encode(rootNode, subnode));
        address currentOwner = ens.owner(node);
        if (currentOwner != address(0) && currentOwner != msg.sender) revert();

        ens.setSubnodeOwner(rootNode, subnode, owner);
        emit Register(rootNode, subnode, owner);
    }
}
