import React, { useState } from 'react';
import { getContract } from '../utils/ethersHelper';

function IssueForm() {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [revokeId, setRevokeId] = useState('');
  const [newRoleAddr, setNewRoleAddr] = useState('');
  const [status, setStatus] = useState('');

  const handleIssue = async (e) => {
    e.preventDefault();
    try {
      setStatus('Изчакайте...');
      const contract = await getContract();
      const tx = await contract.issueCertificate(name, course, date);
      await tx.wait();
      setStatus('✅ Успешно издаден сертификат!');
    } catch (err) { setStatus('❌ Грешка: Нямате права или отхвърлена транзакция.'); }
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
      </section>

      <hr />

      <section>
        <h2>⚠️ Анулиране (Revoke)</h2>
        <input type="text" placeholder="Hash ID на сертификата" value={revokeId} onChange={(e) => setRevokeId(e.target.value)} />
        <button onClick={handleRevoke} style={{ backgroundColor: '#dc3545' }}>Анулирай Сертификат</button>
      </section>

      <hr />

      <section>
        <h2>👑 Управление на Роли (SuperAdmin)</h2>
        <input type="text" placeholder="0x Адрес на потребителя" value={newRoleAddr} onChange={(e) => setNewRoleAddr(e.target.value)} />
        <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
          <button onClick={() => handleRole('addAdmin')}>Добави Admin</button>
          <button onClick={() => handleRole('addSuper')}>Добави Super</button>
          <button onClick={() => handleRole('remove')} style={{ backgroundColor: '#666' }}>Премахни Admin</button>
        </div>
      </section>

      {status && <p style={{ padding: '10px', background: '#eee', borderRadius: '5px' }}><strong>Статус:</strong> {status}</p>}
    </div>
  );
}

export default IssueForm;