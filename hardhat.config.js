// hardhat.config.js

require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config(); // This line reads your .env file

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.24",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545",
      // This tells Hardhat to use your new account for Ganache
      accounts: [process.env.GANACHE_PRIVATE_KEY], 
    },
    // We are keeping the Sepolia config for later
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "", // Added || "" to prevent errors if not set
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [], // Checks if key exists
    },
  },
};