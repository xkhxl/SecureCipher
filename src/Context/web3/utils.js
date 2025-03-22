import { ethers } from "ethers";
import { walletContractAddress, walletContractABI } from '../../ContractUtils/WalletContract';

// Holensky Testnet Chain ID (Replace with the actual Holensky Testnet Chain ID if different)
export const holenskyTestnetChainId = 17000;

// Holensky Testnet RPC URL (Update with the correct RPC if needed)
const HOLENSKY_RPC_URL = "https://eth-holesky.g.alchemy.com/v2/-ROZzVcmtO0LA_5LQ16PX6H6_7c7Re3F";

export const getWeb3 = () => {
  let ethereum,
    provider,
    signer;

  try {
    ethereum = window && window.ethereum;
    if (ethereum) {
      provider = new ethers.providers.Web3Provider(ethereum);
      signer = provider.getSigner();
    } else {
      // Use Holensky RPC as a fallback if Metamask is unavailable
      provider = new ethers.providers.JsonRpcProvider(HOLENSKY_RPC_URL);
      signer = provider.getSigner();
    }
  } catch (err) {
    console.log("Error initializing Web3:", err);
  }

  return {
    ethereum,
    provider,
    signer,
    isLoadingWeb3: false,
    isFetching: ethereum ? true : false
  };
};

const createContracts = signer => {
  if (!signer) return {};
  const walletContract = new ethers.Contract(walletContractAddress, walletContractABI, signer);

  return {
    walletContract
  };
};

export const getContracts = signer => {
  let contracts = {};

  try {
    if (signer) {
      contracts = createContracts(signer);
    }
  } catch (err) {
    console.log("Error getting contracts:", err);
  }

  return contracts;
};

export const setChain = chainId => {
  const validChain = chainId === holenskyTestnetChainId;

  return {
    validChain,
    chainId,
    isFetching: validChain ? true : false
  };
};
