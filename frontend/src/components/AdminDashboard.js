import React, { useState, useEffect } from 'react';
import { getContract } from '../utils/ethersHelper';

function AdminDashboard() {
  const [stats, setStats] = useState({ total: 0, revoked: 0, active: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const contract = await getContract();
        const totalRaw = await contract.certificateCount(); 
        const total = Number(totalRaw);
        
        let revoked = 0;
        const promises = [];
        for (let i = 1; i <= total; i++) {
          promises.push(contract.verifyCertificate(i)); // или contract.certificates(i)
        }

        const allCerts = await Promise.all(promises);
        
        allCerts.forEach(cert => {
          if (cert[3] === false) {
            revoked++;
          }
        });

        setStats({
          total: total,
          revoked: revoked,
          active: total - revoked
        });
      } catch (err) {
        console.error("Грешка при статистика:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="main-card" style={{ marginTop: '20px' }}>
      <h2 style={{ marginBottom: '25px' }}>Анализ на мрежата</h2>
      
      {loading ? (
        <p>Зареждане на данни от Sepolia...</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '20px' }}>
          
          <div style={cardStyle('#5a67d8')}>
            <span style={labelStyle}>Общо издадени</span>
            <span style={valueStyle}>{stats.total}</span>
          </div>

          <div style={cardStyle('#10b981')}>
            <span style={labelStyle}>Активни</span>
            <span style={valueStyle}>{stats.active}</span>
          </div>

          <div style={cardStyle('#ef4444')}>
            <span style={labelStyle}>Анулирани</span>
            <span style={valueStyle}>{stats.revoked}</span>
          </div>

        </div>
      )}
    </div>
  );
}

const cardStyle = (color) => ({
  background: 'var(--input-bg)',
  padding: '20px',
  borderRadius: '15px',
  borderLeft: `6px solid ${color}`,
  display: 'flex',
  flexDirection: 'column',
  gap: '5px',
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
});

const labelStyle = { fontSize: '0.8rem', fontWeight: 'bold', opacity: 0.6, textTransform: 'uppercase' };
const valueStyle = { fontSize: '2rem', fontWeight: '800' };

export default AdminDashboard;
