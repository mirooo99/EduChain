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
          const filterAdmin = contract.filters.AdminStatusChanged();
          const adminEvents = await contract.queryFilter(filterAdmin);
          
          const activeAdmins = new Set();
          adminEvents.forEach(e => {
            const adminAddr = e.args.admin;
            const isNowAdmin = e.args.status;
            
            if (isNowAdmin) {
              activeAdmins.add(adminAddr);
            } else {
              activeAdmins.delete(adminAddr);
            }
          });
          
          adminsCount = activeAdmins.size > 0 ? activeAdmins.size : 1;
        } catch (adminErr) {
          console.error("Грешка при броене на админи:", adminErr);
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
      <h3 style={{ marginTop: 0, color: 'var(--text-main)' }}>Анализ на мрежата</h3>
      {loading ? (
        <p style={{fontSize: '0.9rem', opacity: 0.7}}>Синхронизиране с блокчейн събитията...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
          <div style={cardStyle('#4f46e5')}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.6, color: 'var(--text-main)' }}>ИЗДАДЕНИ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.total}</div>
          </div>
          <div style={cardStyle('#10b981')}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.6, color: 'var(--text-main)' }}>АКТИВНИ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.active}</div>
          </div>
          <div style={cardStyle('#ef4444')}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.6, color: 'var(--text-main)' }}>АНУЛИРАНИ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.revoked}</div>
          </div>
          <div style={cardStyle('#f59e0b')}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', opacity: 0.6, color: 'var(--text-main)' }}>АДМИНИ</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.admins}</div>
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

  const connectWallet = useCallback(async () => {
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
  }, [checkAdminStatus]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && (event.key === 'k' || event.key === 'K')) {
        event.preventDefault();
        connectWallet();
      }

      if (event.key === 'Escape') {
        setView('verify');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [connectWallet]);

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

  return (
    <div className="container" dir="ltr">
      <header className="main-header">
        <div className="header-title">
          <Header />
        </div>
        <button 
          onClick={connectWallet} 
          className="nav-button active wallet-button" 
          style={{ 
            background: account 
              ? (isAdmin ? '#10b981' : '#ef4444') 
              : '#4f46e5' 
          }}
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
