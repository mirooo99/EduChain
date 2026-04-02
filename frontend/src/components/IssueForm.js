import React, { useState } from 'react';
import { getContract } from '../utils/ethersHelper';

function IssueForm() {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [certHash, setCertHash] = useState('');
  const [revokeId, setRevokeId] = useState('');
  const [newAdminAddr, setNewAdminAddr] = useState('');

  const handleIssue = async (e) => {
    e.preventDefault();
    setCertHash('');
    try {
      setStatus('Свързване с MetaMask...');
      const contract = await getContract();
      
      setStatus('Моля, потвърдете транзакцията в MetaMask...');
      const tx = await contract.issueCertificate(name, course, date);
      
      setStatus('Транзакцията се обработва в Sepolia... (около 15 сек.)');
      const receipt = await tx.wait();
      
      const event = receipt.logs[0]; 
      const id = event.topics[1];
      
      setCertHash(id);
      setStatus('✅ Успешно записано в блокчейна!');
    } catch (error) {
      console.error(error);
      setStatus('❌ Грешка при издаването. Проверете дали сте Админ.');
    }
  };

  const handleRevoke = async () => {
    if (!revokeId) return;
    try {
      setStatus('Искане за анулиране...');
      const contract = await getContract();
      const tx = await contract.revokeCertificate(revokeId);
      setStatus('Обработка на анулирането...');
      await tx.wait();
      setStatus('⚠️ Сертификатът е успешно анулиран!');
    } catch (error) {
      console.error(error);
      setStatus('❌ Грешка при анулиране (Може би вече е анулиран или нямате права).');
    }
  };

  const handleRole = async (action) => {
    if (!newAdminAddr) return;
    try {
      setStatus('Промяна на права...');
      const contract = await getContract();
      let tx;
      if (action === 'add') tx = await contract.addAdmin(newAdminAddr);
      if (action === 'remove') tx = await contract.removeAdmin(newAdminAddr);
      await tx.wait();
      setStatus('✅ Правата са обновени успешно!');
    } catch (error) {
      console.error(error);
      setStatus('❌ Грешка: Само SuperAdmin може да променя права.');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '30px' }}>
      
      <section>
        <h2>Издаване на нов сертификат</h2>
        <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column' }}>
          <input type="text" placeholder="Име на ученик" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Постижение (напр. Hack TUES Winner)" value={course} onChange={(e) => setCourse(e.target.value)} required />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <button type="submit">Издай в Блокчейна</button>
        </form>

        {certHash && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#eef', border: '1px dashed #333' }}>
            <p style={{ margin: '0 0 5px 0' }}><strong>Certificate ID (Копирайте това):</strong></p>
            <code style={{ wordBreak: 'break-all', fontSize: '14px' }}>{certHash}</code>
          </div>
        )}
      </section>

      <hr style={{ width: '100%', border: '1px solid #eee' }} />

      <section>
        <h2>Анулиране на сертификат</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <input type="text" placeholder="Въведете Hash ID (0x...)" value={revokeId} onChange={(e) => setRevokeId(e.target.value)} />
          <button onClick={handleRevoke} style={{ backgroundColor: '#dc3545', color: 'white' }}>Анулирай Сертификат</button>
        </div>
      </section>

      <hr style={{ width: '100%', border: '1px solid #eee' }} />

      <section>
        <h2>Управление на Админи (Само за SuperAdmin)</h2>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <input type="text" placeholder="Въведете 0x Адрес на новия учител" value={newAdminAddr} onChange={(e) => setNewAdminAddr(e.target.value)} />
          <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
            <button onClick={() => handleRole('add')} style={{ flex: 1, backgroundColor: '#28a745' }}>Добави Админ</button>
            <button onClick={() => handleRole('remove')} style={{ flex: 1, backgroundColor: '#6c757d' }}>Премахни Админ</button>
          </div>
        </div>
      </section>

      {status && (
        <div style={{ padding: '15px', background: '#f8f9fa', borderRadius: '5px', borderLeft: '4px solid #007bff' }}>
          <strong>Системен Статус:</strong> {status}
        </div>
      )}
    </div>
  );
}

export default IssueForm;
