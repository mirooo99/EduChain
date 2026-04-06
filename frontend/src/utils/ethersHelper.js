import { ethers } from 'ethers';
import abiData from './abi.json';

const CONTRACT_ADDRESS = "0x4E8364aB888a4E7F299DcB3a383C4380DeA7aaA6";
const SEPOLIA_RPC_URL = "https://rpc.ankr.com/eth_sepolia"; 

export const getContract = async () => {
  let provider;
  let signer = null;

  if (window.ethereum) {
    provider = new ethers.BrowserProvider(window.ethereum);
    
    try {
      const accounts = await provider.listAccounts();
      if (accounts.length > 0) {
        signer = await provider.getSigner();
      }
    } catch (e) {
      console.log("Потребителят не е свързан с портфейл, в момента е в режим 'само четене'.");
    }
  } else {
    provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
    console.log("MetaMask не е намерен. Използва се публичен RPC за проверка.");
  }
  
  const contract = new ethers.Contract(
    CONTRACT_ADDRESS, 
    abiData.abi, 
    signer || provider
  );

  return contract;
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Моля, инсталирайте MetaMask, за да издавате сертификати!");
    return null;
  }
  const provider = new ethers.BrowserProvider(window.ethereum);
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  return await provider.getSigner();
};
