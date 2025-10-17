// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract VoterRegistry {
    address public electionAdmin;
    mapping(address => bool) public isRegisteredVoter;

    event VoterAdded(address indexed voterAddress);

    constructor() {
        electionAdmin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == electionAdmin, "Only admin can call this.");
        _;
    }

    function addVoter(address _voterAddress) public onlyAdmin {
        require(!isRegisteredVoter[_voterAddress], "Voter already registered.");
        isRegisteredVoter[_voterAddress] = true;
        emit VoterAdded(_voterAddress);
    }
}