import { ethers } from 'ethers';
import abiData from './abi.json';

const CONTRACT_ADDRESS = "0x4E8364aB888a4E7F299DcB3a383C4380DeA7aaA6";
const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"; 

export const getContract = async () => {
  let provider;

  if (!window.ethereum) {
    console.log("MetaMask не е намерен. Използвам публичен RPC...");
    provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  } else {
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    const network = await browserProvider.getNetwork();
    
    if (network.chainId !== 11155111n) {
      console.log("MetaMask е на грешна мрежа. Превключвам на публичен RPC за проверка...");
      provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    } else {
      provider = browserProvider;
    }
  }
  return new ethers.Contract(CONTRACT_ADDRESS, abiData.abi, provider);
};
