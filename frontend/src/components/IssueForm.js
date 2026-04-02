import React, { useState } from 'react';
import { getContract } from '../utils/ethersHelper';

function IssueForm() {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [certHash, setCertHash] = useState('');

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

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>Издаване на нов сертификат</h2>
      <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column' }}>
        <input type="text" placeholder="Име на ученик" value={name} onChange={(e) => setName(e.target.value)} required />
        <input type="text" placeholder="Постижение (напр. Hack TUES Winner)" value={course} onChange={(e) => setCourse(e.target.value)} required />
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <button type="submit">Издай в Блокчейна</button>
      </form>

      {status && <p><strong>Статус:</strong> {status}</p>}
      
      {certHash && (
        <div style={{ marginTop: '10px', padding: '10px', background: '#eef', border: '1px dashed #333' }}>
          <p><strong>Certificate ID (Копирайте това):</strong></p>
          <code style={{ wordBreak: 'break-all' }}>{certHash}</code>
        </div>
      )}
    </div>
  );
}

export default IssueForm;
