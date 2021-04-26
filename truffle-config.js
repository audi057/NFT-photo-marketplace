require('dotenv').config();

const HDWalletProvider = require('@truffle/hdwallet-provider');  // @notice - Should use new module.
// const mnemonic = process.env.MNEMONIC;
const mnemonic = 'margin evil bid clarify divorce shrimp over caution iron turn service accident';

module.exports = {
  networks: {
    gather: {
      provider: () => new HDWalletProvider(mnemonic, `http://testnet.gather.network`),
      port: 80,
      network_id: "*",
      gas: 4700000,
      skipDryRun: true
    },
    ropsten: {
      provider: () => new HDWalletProvider(
        'margin evil bid clarify divorce shrimp over caution iron turn service accident', 
        'https://ropsten.infura.io/v3/bad8eca31ec64badbbe7489a92c03416'),
      network_id: '3',
      gas: 4712388,
      //gas: 4465030,          // Original
      gasPrice: 5000000000,  // 5 gwei (Original)
      //gasPrice: 10000000000, // 10 gwei
      // gasPrice: 100000000000,  // 100 gwei
      skipDryRun: true,        // Skip dry run before migrations? (default: false for public nets)
    },
    kovan: {
      provider: () => new HDWalletProvider(mnemonic, 'https://kovan.infura.io/v3/bad8eca31ec64badbbe7489a92c03416'),
      network_id: '42',
      gas: 6465030,
      gasPrice: 5000000000, // 5 gwei
      skipDryRun: true,     // Skip dry run before migrations? (default: false for public nets)
    },
    rinkeby: {
      provider: () => new HDWalletProvider(mnemonic, "https://rinkeby.infura.io/v3/" + process.env.INFURA_KEY),
      network_id: 4,
      gas: 6000000,         // 2 times than before
      gasPrice: 5000000000, // 5 gwei,
      skipDryRun: true,     // Skip dry run before migrations? (default: false for public nets)
      //from: process.env.DEPLOYER_ADDRESS
    },
    goerli: {
      provider: () => new HDWalletProvider(mnemonic, "https://goerli.infura.io/v3/" + process.env.INFURA_KEY),
      network_id: 5,
      gas: 7500000,
      gasPrice: 5000000000, // 5 gwei,
      skipDryRun: true,     // Skip dry run before migrations? (default: false for public nets)
      //from: process.env.DEPLOYER_ADDRESS
    },
    binancetest: {
      provider: () => new HDWalletProvider('margin evil bid clarify divorce shrimp over caution iron turn service accident', 'https://data-seed-prebsc-1-s1.binance.org:8545'),
      network_id: 97,
      // confirmations: 10,
      // timeoutBlocks: 200,
      gas: 4712388,
      gasPrice: 5000000000, // 5 gwei
      skipDryRun: true
    },
    // main ethereum network(mainnet)
    live: {
      provider: () => new HDWalletProvider(mnemonic, "https://mainnet.infura.io/v3/" + process.env.INFURA_KEY),
      network_id: 1,
      gas: 5500000,
      gasPrice: 2000000000 // 2 gwei
    },
    bsc: {
      provider: () => new HDWalletProvider(mnemonic, `https://bsc-dataseed1.binance.org`),
      network_id: 56,
      // confirmations: 10,
      // timeoutBlocks: 200,
      gas: 4712388,
      gasPrice: 5000000000, // 5 gwei
      skipDryRun: true
    },
    local: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*',
      skipDryRun: true,
      gas:6721975,
      gasPrice: 5000000000
    }
  },
  compilers: {
    solc: {
      //version: "0.5.16",  /// Final version of solidity-v0.5.x
      settings: {
        optimizer: {
          enabled: true,
          runs: 200
        }
      }
    }
  }
};
