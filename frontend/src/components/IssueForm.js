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
      
      setStatus('Моля, потвърдете транзакцията...');
      const tx = await contract.issueCertificate(name, course, date);
      
      setStatus('Транзакцията се обработва (около 15 сек.)...');
      const receipt = await tx.wait();
      
      // Правилният начин за взимане на ID в ethers v6
      const log = receipt.logs.find(l => {
        try {
          return contract.interface.parseLog(l).name === "CertificateIssued";
        } catch (e) { return false; }
      });

      if (log) {
        const parsedLog = contract.interface.parseLog(log);
        setCertHash(parsedLog.args[0]); // certId
        setStatus('✅ Успешно издаден сертификат!');
      }
    } catch (error) {
      console.error(error);
      setStatus('❌ Грешка. Уверете се, че сте Админ и имате Sepolia ETH.');
    }
  };

  const handleRole = async (action) => {
    if (!newAdminAddr) return;
    try {
      setStatus('Промяна на права...');
      const contract = await getContract();
      let tx = (action === 'add') 
        ? await contract.addAdmin(newAdminAddr) 
        : await contract.removeAdmin(newAdminAddr);
      
      await tx.wait();
      setStatus('✅ Списъкът с админи е обновен!');
    } catch (error) {
      console.error(error);
      setStatus('❌ Грешка: Само съществуващ Админ може да добавя други.');
    }
  };

  const handleRevoke = async () => {
    if (!revokeId) return;
    try {
      setStatus('Анулиране...');
      const contract = await getContract();
      const tx = await contract.revokeCertificate(revokeId);
      await tx.wait();
      setStatus('⚠️ Сертификатът е анулиран успешно!');
    } catch (error) {
      setStatus('❌ Грешка при анулиране.');
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '25px' }}>
      <section>
        <h2>Издаване на сертификат</h2>
        <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Име на ученик" value={name} onChange={(e) => setName(e.target.value)} required />
          <input type="text" placeholder="Курс / Постижение" value={course} onChange={(e) => setCourse(e.target.value)} required />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
          <button type="submit" style={{ backgroundColor: '#007bff', color: 'white', padding: '10px' }}>Издай</button>
        </form>
        {certHash && (
          <div style={{ marginTop: '15px', padding: '10px', background: '#eef', border: '1px dashed #333' }}>
            <strong>ID за проверка:</strong> <code style={{ wordBreak: 'break-all' }}>{certHash}</code>
          </div>
        )}
      </section>

      <hr />

      <section>
        <h2>Управление на екипа (Админи)</h2>
        <input type="text" placeholder="0x Адрес" value={newAdminAddr} onChange={(e) => setNewAdminAddr(e.target.value)} />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={() => handleRole('add')} style={{ flex: 1, backgroundColor: '#28a745', color: 'white' }}>Добави Админ</button>
          <button onClick={() => handleRole('remove')} style={{ flex: 1, backgroundColor: '#6c757d', color: 'white' }}>Премахни Админ</button>
        </div>
      </section>

      <section>
        <h2>Анулиране</h2>
        <input type="text" placeholder="Hash ID" value={revokeId} onChange={(e) => setRevokeId(e.target.value)} />
        <button onClick={handleRevoke} style={{ width: '100%', marginTop: '5px', backgroundColor: '#dc3545', color: 'white' }}>Анулирай</button>
      </section>

      {status && <div style={{ padding: '10px', borderLeft: '4px solid #007bff', background: '#f0f0f0' }}>{status}</div>}
    </div>
  );
}

export default IssueForm;
