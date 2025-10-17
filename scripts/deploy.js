// scripts/deploy.js
async function main() {
  // Get the account that will deploy the contracts
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // 1. Deploy VoterRegistry
  const voterRegistry = await ethers.deployContract("VoterRegistry");
  await voterRegistry.waitForDeployment();
  const voterRegistryAddress = await voterRegistry.getAddress();
  console.log("VoterRegistry deployed to:", voterRegistryAddress);

  // 2. Deploy CandidateRegistry
  const candidateRegistry = await ethers.deployContract("CandidateRegistry");
  await candidateRegistry.waitForDeployment();
  const candidateRegistryAddress = await candidateRegistry.getAddress();
  console.log("CandidateRegistry deployed to:", candidateRegistryAddress);

  // 3. Deploy VotingContract with the addresses of the other two
  const votingContract = await ethers.deployContract("VotingContract", [
    voterRegistryAddress,
    candidateRegistryAddress
  ]);
  await votingContract.waitForDeployment();
  console.log("VotingContract deployed to:", await votingContract.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });