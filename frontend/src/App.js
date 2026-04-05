import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import IssueForm from './components/IssueForm';
import VerifyForm from './components/VerifyForm';

function App() {
  const [view, setView] = useState('verify');
  const [account, setAccount] = useState(null);

  // Функция за свързване с MetaMask
  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
      } catch (err) {
        console.error("Грешка при свързване:", err);
      }
    } else {
      alert("Моля, инсталирайте MetaMask!");
    }
  };

  return (
    <div className="container">
      {/* Добавяме горен ред за Header и Wallet бутона */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ flex: 1 }}>
          <Header />
        </div>
        <button 
          onClick={connectWallet} 
          className="nav-button active" 
          style={{ background: account ? '#10b981' : '#4f46e5', marginLeft: '15px', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {account ? `${account.substring(0, 6)}...${account.substring(account.length - 4)}` : "🔌 Свържи Портфейл"}
        </button>
      </div>
      
      <div className="nav-container">
        <button 
          className={`nav-button ${view === 'verify' ? 'active' : ''}`} 
          onClick={() => setView('verify')}
        >
          Провери Сертификат
        </button>
        <button 
          className={`nav-button ${view === 'issue' ? 'active' : ''}`} 
          onClick={() => setView('issue')}
        >
          Действия за админи
        </button>
      </div>

      <div className="main-card">
        {/* Защитаваме IssueForm - показва се само ако има account */}
        {view === 'verify' ? (
          <VerifyForm />
        ) : (
          account ? <IssueForm /> : (
            <div style={{textAlign: 'center', padding: '40px'}}>
              <h3 style={{ color: '#4f46e5' }}>🔒 Достъпът е ограничен</h3>
              <p style={{ color: '#666' }}>Моля, свържете портфейла си (бутона горе вдясно), за да управлявате сертификати.</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
