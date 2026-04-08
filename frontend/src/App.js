import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Header from './components/Header';
import IssueForm from './components/IssueForm';
import VerifyForm from './components/VerifyForm';
import RecentCertificates from './components/RecentCertificates'; 
import { getContract } from './utils/ethersHelper';

function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, revoked: 0, active: 0, admins: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const contract = await getContract();
        
        const filterIssued = contract.filters.CertificateIssued();
        const eventsIssued = await contract.queryFilter(filterIssued);
        
        const filterRevoked = contract.filters.CertificateRevoked();
        const eventsRevoked = await contract.queryFilter(filterRevoked);
        const total = eventsIssued.length;
        const uniqueRevokedHashes = new Set(eventsRevoked.map(e => e.args.certId));
        const revoked = uniqueRevokedHashes.size;

        let adminsCount = 1;
        try {
          const addedEvents = await contract.queryFilter(contract.filters.AdminAdded());
          const removedEvents = await contract.queryFilter(contract.filters.AdminRemoved());
          
          const activeAdmins = new Set();
          
          addedEvents.forEach(e => activeAdmins.add(e.args[0]));
          
          removedEvents.forEach(e => activeAdmins.delete(e.args[0]));
          
          adminsCount = activeAdmins.size > 0 ? activeAdmins.size : 1;
        } catch (err) {
          console.error("Грешка при броене на админи през събития:", err);
        }

        setStats({
          total: total,
          revoked: revoked,
          active: total - revoked,
          admins: adminsCount
        });
      } catch (err) {
        console.error("Dashboard error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const cardStyle = (color) => ({
    background: 'var(--input-bg)',
    padding: '15px',
    borderRadius: '12px',
    borderLeft: `5px solid ${color}`,
    textAlign: 'center'
  });

  return (
    <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid var(--header-border)' }}>
      <h3 style={{ marginTop: 0 }}>Анализ на мрежата</h3>
      {loading ? (
        <p style={{fontSize: '0.9rem', opacity: 0.7}}>Синхронизиране с блокчейн събитията...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          <div style={cardStyle('#4f46e5')}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.6 }}>ИЗДАДЕНИ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.total}</div>
          </div>
          <div style={cardStyle('#10b981')}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.6 }}>АКТИВНИ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.active}</div>
          </div>
          <div style={cardStyle('#ef4444')}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.6 }}>АНУЛИРАНИ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.revoked}</div>
          </div>
          <div style={cardStyle('#f59e0b')}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.6 }}>АДМИНИ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stats.admins}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function App() {
  const [view, setView] = useState('verify');
  const [account, setAccount] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const checkAdminStatus = useCallback(async (address) => {
    if (!address) return;
    try {
      const contract = await getContract();
      const status = await contract.isAdmin(address); 
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
          <>
            <VerifyForm />
            <RecentCertificates />
          </>
        ) : (
          isAdmin ? (
            <>
              <AdminDashboard /> 
              <IssueForm />
            </>
          ) : (
            <div style={{textAlign: 'center'}}>Нямате достъп.</div>
          )
        )}
      </div>
    </div>
  );
}

export default App;
