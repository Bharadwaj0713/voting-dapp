// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CandidateRegistry {
    address public electionAdmin;

    struct Candidate {
        uint id;
        string name;
    }

    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    event CandidateAdded(uint indexed id, string name);

    constructor() {
        electionAdmin = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == electionAdmin, "Only admin can call this.");
        _;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name);
        emit CandidateAdded(candidatesCount, _name);
    }
}