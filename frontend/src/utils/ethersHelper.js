import { ethers } from 'ethers';
import abiData from './abi.json';

const CONTRACT_ADDRESS = "0x4E8364aB888a4E7F299DcB3a383C4380DeA7aaA6";
const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com"; 

export const getContract = async () => {
  if (window.ethereum) {
    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const signer = await browserProvider.getSigner().catch(() => null);
      
      if (signer) {
        console.log("Админ режим: Договорът е свързан със Signer.");
        return new ethers.Contract(CONTRACT_ADDRESS, abiData.abi, signer);
      } else {
        console.log("Режим четене през BrowserProvider.");
        return new ethers.Contract(CONTRACT_ADDRESS, abiData.abi, browserProvider);
      }
    } catch (e) {
      console.error("Грешка при инициализация на BrowserProvider:", e);
    }
  }

  console.log("Режим четене: Използва се публичен RPC.");
  const publicProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  return new ethers.Contract(CONTRACT_ADDRESS, abiData.abi, publicProvider);
};

export const connectWallet = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      window.location.reload();
    } catch (error) {
      console.error("Потребителят отказа връзка:", error);
    }
  } else {
    alert("Моля, инсталирайте MetaMask!");
  }
};
