import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import IssueForm from './components/IssueForm';
import VerifyForm from './components/VerifyForm';
import RecentCertificates from './components/RecentCertificates'; 
import { getContract } from './utils/ethersHelper';

function App() {
  const [view, setView] = useState('verify');
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCorrectNetwork, setIsCorrectNetwork] = useState(true);

  const checkAdminStatus = useCallback(async (address) => {
    if (!address) return;
    try {
      const contract = await getContract();
      
      if (window.ethereum) {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        setIsCorrectNetwork(chainId === '0xaa36a7' || chainId === 11155111 || chainId === '11155111');
      }

      const status = await contract.isAdmin(address); 
      console.log("Проверка на права за:", address, "| Админ:", status);
      setIsAdmin(status);
    } catch (err) {
      console.error("Грешка при проверка на статус:", err);
      setIsAdmin(false);
    }
  }, []);

  useEffect(() => {
    const init = async () => {
      if (window.ethereum) {
        try {
          const accounts = await window.ethereum.request({ method: 'eth_accounts' });
          if (accounts.length > 0) {
            const userAddr = accounts[0];
            setAccount(userAddr);
            await checkAdminStatus(userAddr);
          }
        } catch (err) {
          console.error("Грешка при инициализация:", err);
        }
      }
    };
    init();
  }, [checkAdminStatus]);

  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await checkAdminStatus(accounts[0]);
        } else {
          setAccount(null);
          setIsAdmin(false);
          setView('verify');
        }
      };

      const handleChainChanged = () => {
        window.location.reload();
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      };
    }
  }, [checkAdminStatus]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        setAccount(userAddress);
        await checkAdminStatus(userAddress);
      } catch (err) {
        console.error("Грешка при свързване:", err);
      }
    } else {
      alert("Моля, инсталирайте MetaMask!");
    }
  };

  return (
    <div className="container" dir="ltr">
      <header className="main-header">
        <div className="header-title">
          <Header />
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '0.75rem', 
            marginTop: '4px',
            color: isCorrectNetwork ? '#10b981' : '#ef4444',
            fontWeight: '600'
          }}>
            <span style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: isCorrectNetwork ? '#10b981' : '#ef4444',
              display: 'inline-block',
              boxShadow: isCorrectNetwork ? '0 0 5px #10b981' : '0 0 5px #ef4444'
            }}></span>
            {isCorrectNetwork ? "Sepolia Network Active" : "Switch to Sepolia Network"}
          </div>
        </div>
        
        <button 
          onClick={connectWallet} 
          className="nav-button active wallet-button" 
          style={{ background: account ? '#10b981' : '#4f46e5' }}
        >
          {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Свържи Портфейл"}
        </button>
      </header>
      
      <div className="nav-container">
        <button 
          className={`nav-button ${view === 'verify' ? 'active' : ''}`} 
          onClick={() => setView('verify')}
        >
          Провери Сертификат
        </button>

        {isAdmin && (
          <button 
            className={`nav-button ${view === 'issue' ? 'active' : ''}`} 
            onClick={() => setView('issue')}
          >
            Действия за админи
          </button>
        )}
      </div>

      <div className="main-card">
        {view === 'verify' ? (
          <>
            <VerifyForm />
            <RecentCertificates />
          </>
        ) : (
          isAdmin ? <IssueForm /> : <div style={{textAlign: 'center', padding: '20px'}}>Нямате администраторски права.</div>
        )}
      </div>
    </div>
  );
}

export default App;
