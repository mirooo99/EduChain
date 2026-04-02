import { ethers } from 'ethers';
import abiData from './abi.json';

const CONTRACT_ADDRESS = "0x4E8364aB888a4E7F299DcB3a383C4380DeA7aaA6";

export const getContract = async () => {
  if (!window.ethereum) {
    alert("Моля, инсталирайте MetaMask, за да ползвате EduChain!");
    throw new Error("MetaMask not found");
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    const provider = new ethers.BrowserProvider(window.ethereum);
    
    const signer = await provider.getSigner();
    
    const contract = new ethers.Contract(CONTRACT_ADDRESS, abiData.abi, signer);
    
    return contract;
  } catch (error) {
    console.error("Грешка при свързване с блокчейна:", error);
    throw error;
  }
};