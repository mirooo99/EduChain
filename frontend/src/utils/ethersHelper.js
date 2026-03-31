import { ethers } from 'ethers';
import abiData from './abi.json';

const CONTRACT_ADDRESS = "0x7F31c0e620263D57aC28E5AED0756a5Ac65e9565";

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