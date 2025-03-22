require('dotenv').config();
const HDWalletProvider = require('@truffle/hdwallet-provider');

module.exports = {
  contracts_build_directory: "./compiledContracts",
  test_directory: './contractTests',
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    holesky: {
      provider: () => {
        return new HDWalletProvider(
          process.env.PRIVATE_KEY,  // Using mnemonic instead of object structure
          process.env.HOLESKY_RPC_URL
        );
      },
      network_id: 17000, // Holešky Testnet Chain ID
      gas: 5500000,
      gasPrice: 10000000000, // 10 Gwei (same as the GitHub project)
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true,
    },
  },
  compilers: {
    solc: {
      version: "0.8.11",
    }
  },
};
