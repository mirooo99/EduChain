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

  // Функция за проверка на админ права в Смарт Договора
  // Използваме useCallback, за да можем да я ползваме безопасно в useEffect
  const checkAdminStatus = useCallback(async (address) => {
    if (!address) return;
    try {
      const contract = await getContract();
      // Важно: Името съвпада с mapping(address => bool) public isAdmin в Solidity
      const status = await contract.isAdmin(address); 
      console.log("Проверка на права за:", address, "| Админ:", status);
      setIsAdmin(status);
    } catch (err) {
      console.error("Грешка при проверка на статус:", err);
      setIsAdmin(false);
    }
  }, []);

  // 1. Първоначална проверка при зареждане на страницата
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

  // 2. Следене за смяна на акаунти в MetaMask
  useEffect(() => {
    if (window.ethereum) {
      const handleAccountsChanged = async (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          await checkAdminStatus(accounts[0]);
        } else {
          // Потребителят се е отписал
          setAccount(null);
          setIsAdmin(false);
          setView('verify');
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);
      
      // Почистване на слушателя при затваряне
      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, [checkAdminStatus]);

  // Функция за ръчно свързване на портфейл
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
      {/* ГОРНА ЧАСТ: Header и Wallet Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <Header />
        </div>
        <button 
          onClick={connectWallet} 
          className="nav-button active" 
          style={{ 
            background: account ? '#10b981' : '#4f46e5', 
            marginLeft: '15px', 
            color: 'white', 
            border: 'none', 
            padding: '10px 20px', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontWeight: 'bold',
            transition: '0.3s'
          }}
        >
          {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Свържи Портфейл"}
        </button>
      </div>
      
      {/* НАВИГАЦИЯ: Сменя се спрямо правата */}
      <div className="nav-container">
        <button 
          className={`nav-button ${view === 'verify' ? 'active' : ''}`} 
          onClick={() => setView('verify')}
        >
          Провери Сертификат
        </button>

        {/* Бутонът се вижда само ако isAdmin е true */}
        {isAdmin && (
          <button 
            className={`nav-button ${view === 'issue' ? 'active' : ''}`} 
            onClick={() => setView('issue')}
          >
            Действия за админи
          </button>
        )}
      </div>

      {/* ОСНОВНО СЪДЪРЖАНИЕ */}
      <div className="main-card">
        {view === 'verify' ? (
          <VerifyForm />
        ) : (
          // Ако по някакъв начин потребител влезе тук без да е админ, правим допълнителна проверка
          isAdmin ? <IssueForm /> : <div style={{textAlign: 'center'}}>Нямате достъп.</div>
        )}
      </div>
    </div>
  );
}

export default App;
