// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./VoterRegistry.sol";
import "./CandidateRegistry.sol";

contract VotingContract {
    address public electionAdmin;
    VoterRegistry private voterRegistry;
    CandidateRegistry private candidateRegistry;

    uint public electionEndTime;
    mapping(uint => uint) public results;
    mapping(address => bool) public hasVoterVoted;

    event Voted(address indexed voter, uint indexed candidateId);

    constructor(address _voterRegistryAddress, address _candidateRegistryAddress) {
        electionAdmin = msg.sender;
        voterRegistry = VoterRegistry(_voterRegistryAddress);
        candidateRegistry = CandidateRegistry(_candidateRegistryAddress);
    }

    function startElection(uint _durationInMinutes) public {
        require(msg.sender == electionAdmin, "Only admin can start the election.");
        electionEndTime = block.timestamp + (_durationInMinutes * 1 minutes);
    }

    function vote(uint _candidateId) public {
        require(block.timestamp < electionEndTime, "Election has ended.");
        require(voterRegistry.isRegisteredVoter(msg.sender), "You are not registered to vote.");
        require(!hasVoterVoted[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidateRegistry.candidatesCount(), "Invalid candidate.");

        hasVoterVoted[msg.sender] = true;
        results[_candidateId]++;

        emit Voted(msg.sender, _candidateId);
    }

    function getResult(uint _candidateId) public view returns (uint) {
        require(block.timestamp >= electionEndTime, "Results are not available yet.");
        return results[_candidateId];
    }
}