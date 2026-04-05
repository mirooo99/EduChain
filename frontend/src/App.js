import React, { useState, useEffect } from 'react';
import './App.css';
import Header from './components/Header';
import IssueForm from './components/IssueForm';
import VerifyForm from './components/VerifyForm';
import { getContract } from './utils/ethersHelper'; // Увери се, че пътят е правилен

function App() {
  const [view, setView] = useState('verify');
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false); // Нов стейт

  // Функция за проверка дали адресът е админ в Смарт Договора
  const checkAdminStatus = async (address) => {
    try {
      const contract = await getContract();
      // Извикваме mapping-а или функцията за проверка в договора
      const status = await contract.admins(address); 
      setIsAdmin(status);
    } catch (err) {
      console.error("Грешка при проверка на админ статус:", err);
      setIsAdmin(false);
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const userAddress = accounts[0];
        setAccount(userAddress);
        await checkAdminStatus(userAddress); // Проверяваме веднага след свързване
      } catch (err) {
        console.error("Грешка при свързване:", err);
      }
    } else {
      alert("Моля, инсталирайте MetaMask!");
    }
  };

  // Автоматична проверка, ако потребителят смени акаунта си в MetaMask
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          checkAdminStatus(accounts[0]);
        } else {
          setAccount(null);
          setIsAdmin(false);
          setView('verify');
        }
      });
    }
  }, []);

  return (
    <div className="container" dir="ltr"> {/* dir="ltr" заради превода */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <Header />
        </div>
        <button 
          onClick={connectWallet} 
          className="nav-button active" 
          style={{ background: account ? '#10b981' : '#4f46e5', marginLeft: '15px', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "Свържи Портфейл"}
        </button>
      </div>
      
      <div className="nav-container">
        <button 
          className={`nav-button ${view === 'verify' ? 'active' : ''}`} 
          onClick={() => setView('verify')}
        >
          Провери Сертификат
        </button>

        {/* ПОКАЗВАМЕ БУТОНА САМО АКО Е АДМИН */}
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
          // Тук вече знаем, че isAdmin е true, за да стигне дотук
          <IssueForm />
        )}
      </div>
    </div>
  );
}

export default App;
