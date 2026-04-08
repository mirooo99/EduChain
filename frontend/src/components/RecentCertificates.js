import React, { useEffect, useState } from 'react';
import { getContract } from '../utils/ethersHelper';

function RecentCertificates() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(true);

  const timeAgo = (timestamp) => {
    const now = Math.floor(Date.now() / 1000);
    const diff = now - timestamp;

    if (diff < 60) return 'току-що';
    if (diff < 3600) return `преди ${Math.floor(diff / 60)} мин.`;
    if (diff < 86400) return `преди ${Math.floor(diff / 3600)} ч.`;
    return `преди ${Math.floor(diff / 86400)} дни`;
  };

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const contract = await getContract();
        const filter = contract.filters.CertificateIssued();
        const events = await contract.queryFilter(filter, -10000, 'latest');

        const slicedEvents = events.reverse().slice(0, 5);

        const parsedEvents = await Promise.all(slicedEvents.map(async (event) => {
          const block = await event.getBlock();
          return {
            certId: event.args[0],
            name: event.args[1],
            course: event.args[2],
            txHash: event.transactionHash,
            timestamp: block.timestamp
          };
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
    <div style={{ marginTop: '30px', padding: '15px', borderTop: '1px solid var(--header-border)' }}>
      <h3 style={{ fontSize: '1.2rem', marginBottom: '15px', color: 'var(--text-main)' }}>
        Последно издадени сертификати
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {recent.map((cert, index) => (
          <div key={index} style={{ 
            padding: '10px', 
            backgroundColor: 'var(--card-bg)', 
            borderRadius: '6px',
            borderLeft: '4px solid #d4af37',
            fontSize: '0.9rem',
            border: '1px solid var(--card-border)',
            position: 'relative'
          }}>
            <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>{cert.name}</div>
            <div style={{ color: 'var(--text-main)', opacity: 0.7 }}>{cert.course}</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '5px', alignItems: 'center' }}>
              <a 
                href={`/?hash=${cert.certId}`} 
                style={{ fontSize: '0.75rem', color: 'var(--link-color)', textDecoration: 'none' }}
              >
                Провери сертификат
              </a>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-main)', opacity: 0.5 }}>
                {timeAgo(cert.timestamp)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default RecentCertificates;
