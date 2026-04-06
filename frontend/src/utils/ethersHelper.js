import { ethers } from 'ethers';
import abiData from './abi.json';

const CONTRACT_ADDRESS = "0x4E8364aB888a4E7F299DcB3a383C4380DeA7aaA6";
const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"; 

export const getContract = async () => {
  if (window.ethereum) {
    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    
    try {
      const accounts = await browserProvider.listAccounts();
      
      if (accounts.length > 0) {
        const signer = await browserProvider.getSigner();
        console.log("Админ режим: Договорът е свързан с портфейл.");
        return new ethers.Contract(CONTRACT_ADDRESS, abiData.abi, signer);
      }
    } catch (e) {
      console.error("Грешка при взимане на Signer:", e);
    }

    return new ethers.Contract(CONTRACT_ADDRESS, abiData.abi, browserProvider);
  } 

  console.log("Режим четене: Използва се публичен RPC.");
  const publicProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, abiData.abi, publicProvider);
};

export const connectWallet = async () => {
  if (window.ethereum) {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    window.location.reload();
  } else {
    alert("Моля, инсталирайте MetaMask!");
  }
};
