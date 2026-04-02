import React, { useState } from 'react';
import { getContract } from '../utils/ethersHelper';

function IssueForm() {
  const [certHash, setCertHash] = useState('');
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [revokeId, setRevokeId] = useState('');
  const [newRoleAddr, setNewRoleAddr] = useState('');
  const [status, setStatus] = useState('');

  const handleIssue = async (e) => {
  e.preventDefault();
  setCertHash(''); // Нулираме стария хеш при нов опит
  try {
    setStatus('Свързване с MetaMask...');
    const contract = await getContract();
    
    setStatus('Моля, потвърдете транзакцията...');
    const tx = await contract.issueCertificate(name, course, date);
    
    setStatus('Записване в блокчейна... (~15 сек.)');
    const receipt = await tx.wait(); // Изчакваме потвърждението

    // Извличаме certId от лога на събитието CertificateIssued
    // В ethers v5 това обикновено става така:
    const event = receipt.events.find(x => x.event === "CertificateIssued");
    const id = event.args.certId;
    
    setCertHash(id);
    setStatus('✅ Успешно издаден сертификат!');
  } catch (err) {
    console.error(err);
    setStatus('❌ Грешка: Нямате права или транзакцията беше отказана.');
  }
};

  const handleRevoke = async () => {
    try {
      setStatus('Анулиране...');
      const contract = await getContract();
      const tx = await contract.revokeCertificate(revokeId);
      await tx.wait();
      setStatus('⚠️ Сертификатът е анулиран!');
    } catch (err) { setStatus('❌ Грешка при анулиране.'); }
  };

  const handleRole = async (action) => {
    try {
      setStatus('Промяна на права...');
      const contract = await getContract();
      let tx;
      if (action === 'addAdmin') tx = await contract.addAdmin(newRoleAddr);
      if (action === 'addSuper') tx = await contract.addSuperAdmin(newRoleAddr);
      if (action === 'remove') tx = await contract.removeAdmin(newRoleAddr);
      await tx.wait();
      setStatus('✅ Правата са обновени!');
    } catch (err) { setStatus('❌ Само SuperAdmin може да прави това.'); }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', gap: '20px', display: 'flex', flexDirection: 'column' }}>
      
      <section>
        <h2>🎓 Издаване</h2>
        <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Име" onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Постижение" onChange={(e) => setCourse(e.target.value)} required />
          <input type="date" onChange={(e) => setDate(e.target.value)} required />
          <button type="submit">Издай в Блокчейна</button>
        </form>

        {/* ТУК ДОБАВЯМЕ ПОКАЗВАНЕТО НА ХЕША */}
        {certHash && (
          <div style={{ 
            marginTop: '20px', 
            padding: '15px', 
            background: '#f0f7ff', 
            border: '1px dashed #007bff', 
            borderRadius: '8px' 
          }}>
            <p style={{ color: '#007bff', fontWeight: 'bold', marginBottom: '5px' }}>
              ID на сертификата (Копирайте за проверка):
            </p>
            <code style={{ 
              wordBreak: 'break-all', 
              fontSize: '14px', 
              backgroundColor: '#fff', 
              padding: '5px', 
              display: 'block' 
            }}>
              {certHash}
            </code>
            <button 
              onClick={() => navigator.clipboard.writeText(certHash)}
              style={{ marginTop: '10px', fontSize: '12px', padding: '5px 10px', cursor: 'pointer' }}
            >
              📋 Копирай хеша
            </button>
          </div>
        )}
      </section>

      <hr />

      <section>
        <h2>⚠️ Анулиране (Revoke)</h2>
        <input type="text" placeholder="Hash ID на сертификата" value={revokeId} onChange={(e) => setRevokeId(e.target.value)} />
        <button onClick={handleRevoke} style={{ backgroundColor: '#dc3545', cursor: 'pointer' }}>Анулирай Сертификат</button>
      </section>

      <hr />

      <section>
        <h2>👑 Управление на Роли (SuperAdmin)</h2>
        <input type="text" placeholder="0x Адрес на потребителя" value={newRoleAddr} onChange={(e) => setNewRoleAddr(e.target.value)} />
        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          <button onClick={() => handleRole('addAdmin')} style={{ cursor: 'pointer' }}>Добави Admin</button>
          <button onClick={() => handleRole('addSuper')} style={{ cursor: 'pointer' }}>Добави Super</button>
          <button onClick={() => handleRole('remove')} style={{ backgroundColor: '#666', cursor: 'pointer' }}>Премахни Admin</button>
        </div>
      </section>

      {status && <p style={{ padding: '10px', background: '#eee', borderRadius: '5px' }}><strong>Статус:</strong> {status}</p>}
    </div>
  );
}

export default IssueForm;