import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import IssueForm from './components/IssueForm';
import VerifyForm from './components/VerifyForm';
import { getContract } from './utils/ethersHelper';

function App() {
  const [view, setView] = useState('verify');
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const checkAdminStatus = useCallback(async (address) => {
    if (!address) return;
    try {
      const contract = await getContract();
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

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
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
          <VerifyForm />
        ) : (
          isAdmin ? <IssueForm /> : <div style={{textAlign: 'center'}}>Нямате достъп.</div>
        )}
      </div>
    </div>
  );
}

export default App;
