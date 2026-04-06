import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/ethersHelper';

function RecentCertificates() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const contract = await getContract();
        
        // 1. Дефинираме филтър за събитието (името трябва да е точно както е в Solidity)
        const filter = contract.filters.CertificateIssued();
        
        // 2. Взимаме събитията (например от последните 5000 блока или от началото)
        // 'latest' е текущият блок, -5000 означава 5000 блока назад
        const events = await contract.queryFilter(filter, -10000, 'latest');

        // 3. Обработваме данните и взимаме последните 5
        const parsedEvents = events.reverse().slice(0, 5).map(event => ({
          certId: event.args[0], // bytes32 хешът
          name: event.args[1],   // Името на ученика
          course: event.args[2], // Курсът
          txHash: event.transactionHash
        }));

        setRecent(parsedEvents);
      } catch (err) {
        console.error("Грешка при четене на събития:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) return <p>Зареждане на история...</p>;

  return (
    <div style={{ marginTop: '30px', padding: '15px', borderTop: '1px solid #eee' }}>
      <h3 style={{ fontSize: '1.2rem', color: '#102a43', marginBottom: '15px' }}>
        📜 Последно издадени сертификати
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {recent.map((cert, index) => (
          <div key={index} style={{ 
            padding: '10px', 
            backgroundColor: '#f8fafc', 
            borderRadius: '6px',
            borderLeft: '4px solid #d4af37',
            fontSize: '0.9rem'
          }}>
            <div style={{ fontWeight: 'bold', color: '#334155' }}>{cert.name}</div>
            <div style={{ color: '#64748b' }}>{cert.course}</div>
            <a 
              href={`/?hash=${cert.certId}`} 
              style={{ fontSize: '0.75rem', color: '#0052cc', textDecoration: 'none' }}
            >
              Провери сертификат →
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentCertificates;
