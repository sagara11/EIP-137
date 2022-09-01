// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

// Import this file to use console.log
import "hardhat/console.sol";

contract Resolver {
    address owner;
    mapping(bytes32 => address) addresses;

    event AddrChanged(bytes32 indexed node, address a);
    modifier only_owner() {
        if (msg.sender != owner) revert();
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function addr(bytes32 node) public view returns (address) {
        return addresses[node];
    }

    function setAddr(bytes32 _node, address _addr) public only_owner {
        addresses[_node] = _addr;
        emit AddrChanged(_node, _addr);
    }

    function supportsInterface(bytes4 interfaceID) public pure returns (bool) {
        return interfaceID == 0x3b3b57de || interfaceID == 0x01ffc9a7;
    }

    receive() external payable {
        revert();
    }
}
