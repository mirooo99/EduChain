import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/ethersHelper';

function RecentCertificates() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const contract = await getContract();
        
        const filter = contract.filters.CertificateIssued();
        
        const events = await contract.queryFilter(filter, -10000, 'latest');

        const parsedEvents = events.reverse().slice(0, 5).map(event => ({
          certId: event.args[0],
          name: event.args[1],
          course: event.args[2],
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
      <h3 style={{ fontSize: '1.2rem', marginBottom: '15px' }}>
        Последно издадени сертификати
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
              Провери сертификат
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentCertificates;
