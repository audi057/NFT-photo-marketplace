import Web3 from "web3";
require('dotenv').config();
// const INFURA_API_KEY = process.env.INFURA_API_KEY;

//const FALLBACK_WEB3_PROVIDER = process.env.REACT_APP_NETWORK || 'https://rinkeby.infura.io/v3/' + INFURA_API_KEY;    // Rinkeby
//const FALLBACK_WEB3_PROVIDER = process.env.REACT_APP_NETWORK || 'http://0.0.0.0:7545';                                 // Ganache-GUI
// const FALLBACK_WEB3_PROVIDER = 'https://ropsten.infura.io/v3/bad8eca31ec64badbbe7489a92c03416';
// const FALLBACK_WEB3_PROVIDER = process.env.REACT_APP_NETWORK || 'http://0.0.0.0:8545';
const FALLBACK_WEB3_PROVIDER = 'http://0.0.0.0:8545';


const getWeb3 = () =>
  new Promise((resolve, reject) => {
    // Wait for loading completion to avoid race conditions with web3 injection timing.
    window.addEventListener("load", async () => {
      // Modern dapp browsers...
      if (window.ethereum) {
        const web3 = new Web3(window.ethereum);
        try {
          // Request account access if needed
          await window.ethereum.enable();
          // await window.ethereum.request({ method: 'eth_requestAccounts' });
          // Acccounts now exposed
          resolve(web3);
        } catch (error) {
          reject(error);
        }
      }
      // Legacy dapp browsers...
      else if (window.web3) {
        // Use Mist/MetaMask's provider.
        const web3 = window.web3;
        console.log("Injected web3 detected.");
        resolve(web3);
      }
      // Fallback to localhost; use dev console port by default...
      else {
        console.log(FALLBACK_WEB3_PROVIDER);
        const provider = new Web3.providers.HttpProvider(
          FALLBACK_WEB3_PROVIDER
        );
        const web3 = new Web3(provider);
        console.log("No web3 instance injected, using Infura/Local web3.");
        resolve(web3);
      }
    });
  });

const getGanacheWeb3 = () => {
  console.log(process.env.NODE_ENV + process.env.NODE_ENV);
  const isProd = process.env.NODE_ENV === 'development';
  // const isProd = process.env.NODE_ENV === 'production';
  // return null;
  
  if (isProd) {
    return null;
  }
  
  const provider = new Web3.providers.HttpProvider(
    //'https://rinkeby.infura.io/v3/' + INFURA_API_KEY  // Rinkeby
    //'http://0.0.0.0:7545'  // Ganache-GUI
    'http://0.0.0.0:8545'  // Ganache-CLI
  );
  // const provider = new HDWalletProvider(
  //   'margin evil bid clarify divorce shrimp over caution iron turn service accident',
  //   'https://kovan.infura.io/v3/9a72ff6cb5cb4438a8181767d6ec3d71'
  // );

  const web3 = new Web3(provider);
  console.log("No local ganache found.");
  return web3;
}

export default getWeb3;
export { getGanacheWeb3, Web3 };
