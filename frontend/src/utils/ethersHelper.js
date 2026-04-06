import { ethers } from 'ethers';
import abiData from './abi.json';

const CONTRACT_ADDRESS = "0x4E8364aB888a4E7F299DcB3a383C4380DeA7aaA6";
const SEPOLIA_RPC_URL = "https://ethereum-sepolia-rpc.publicnode.com";

let cachedContract = null;

export const getContract = async () => {
  try {
    if (cachedContract) return cachedContract;

    if (window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum);

      try {
        const accounts = await provider.send("eth_accounts", []);

        if (accounts.length > 0) {
          const signer = await provider.getSigner();
          console.log("Админ режим: със signer");

          cachedContract = new ethers.Contract(
            CONTRACT_ADDRESS,
            abiData.abi,
            signer
          );

          return cachedContract;
        }
      } catch (err) {
        console.error("Signer грешка:", err);
      }

      console.log("Режим четене (Metamask без акаунт)");
      cachedContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        abiData.abi,
        provider
      );

      return cachedContract;
    }

    console.log("Публичен RPC режим");
    const publicProvider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);

    cachedContract = new ethers.Contract(
      CONTRACT_ADDRESS,
      abiData.abi,
      publicProvider
    );

    return cachedContract;

  } catch (error) {
    console.error("ГРЕШКА getContract:", error);
    throw error;
  }
};

export const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Инсталирай MetaMask!");
    return;
  }

  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });

    console.log("Wallet свързан");

  } catch (err) {
    console.error("Грешка при свързване:", err);
  }
};
