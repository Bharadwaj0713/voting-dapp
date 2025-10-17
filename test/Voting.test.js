// test/Voting.test.js
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Decentralized Voting System", function () {
    let admin, voter1, voter2;
    let voterRegistry, candidateRegistry, votingContract;

    // This runs before each test, deploying fresh contracts every time
    beforeEach(async function () {
        [admin, voter1, voter2] = await ethers.getSigners();

        // Deploy VoterRegistry
        const VoterRegistry = await ethers.getContractFactory("VoterRegistry");
        voterRegistry = await VoterRegistry.deploy();

        // Deploy CandidateRegistry
        const CandidateRegistry = await ethers.getContractFactory("CandidateRegistry");
        candidateRegistry = await CandidateRegistry.deploy();

        // Deploy VotingContract and link the other two contracts
        const VotingContract = await ethers.getContractFactory("VotingContract");
        votingContract = await VotingContract.deploy(
            await voterRegistry.getAddress(),
            await candidateRegistry.getAddress()
        );
    });

    it("Should allow a registered voter to cast a vote", async function () {
        // Admin adds a candidate
        await candidateRegistry.connect(admin).addCandidate("Candidate 1");
        // Admin registers voter1
        await voterRegistry.connect(admin).addVoter(voter1.address);
        // Admin starts the election for 10 minutes
        await votingContract.connect(admin).startElection(10);

        // Voter1 casts a vote for candidate with ID 1
        await votingContract.connect(voter1).vote(1);

        // Check if the vote count for candidate 1 is now 1
        const voteCount = await votingContract.results(1);
        expect(voteCount).to.equal(1);
    });

    it("Should prevent an unregistered voter from voting", async function () {
        // Admin adds a candidate
        await candidateRegistry.connect(admin).addCandidate("Candidate 1");
        // Admin starts the election
        await votingContract.connect(admin).startElection(10);

        // voter2 is NOT registered, so this transaction should fail
        await expect(votingContract.connect(voter2).vote(1)).to.be.revertedWith("You are not registered to vote.");
    });

    it("Should prevent a voter from voting twice", async function () {
        await candidateRegistry.connect(admin).addCandidate("Candidate 1");
        await voterRegistry.connect(admin).addVoter(voter1.address);
        await votingContract.connect(admin).startElection(10);

        // Voter1 votes successfully the first time
        await votingContract.connect(voter1).vote(1);

        // Voter1 tries to vote again, which should fail
        await expect(votingContract.connect(voter1).vote(1)).to.be.revertedWith("You have already voted.");
    });
});