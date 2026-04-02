import React, { useState } from 'react';
import { getContract } from '../utils/ethersHelper';

function VerifyForm() {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const contract = await getContract();
      const data = await contract.verifyCertificate(certId);
      
      setResult({
        name: data[0],
        course: data[1],
        date: data[2],
        isValid: data[3]
      });
    } catch (err) {
      console.error(err);
      setError('❌ Сертификатът не е намерен. Проверете дали Hash ID е правилен.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px' }}>
      <h2>Проверка на автентичност</h2>
      <p style={{ fontSize: '0.9em', color: '#666' }}>Въведете уникалния хеш код, за да потвърдите данните в блокчейна на Sepolia.</p>
      
      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column' }}>
        <input 
          type="text" 
          placeholder="0x..." 
          value={certId} 
          onChange={(e) => setCertId(e.target.value)} 
          required 
        />
        <button type="submit" disabled={loading}>
          {loading ? 'Проверка...' : 'Провери'}
        </button>
      </form>
      
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      
      {/* ТУК Е ПРОМЯНАТА: Заместваме стария блок с този нов, който поддържа и анулирани статуси */}
      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          border: `2px solid ${result.isValid ? '#28a745' : '#dc3545'}`, 
          borderRadius: '5px', 
          backgroundColor: result.isValid ? '#f8fff9' : '#fff8f8' 
        }}>
          {result.isValid ? (
            <h3 style={{ color: '#28a745', marginTop: 0 }}>✅ Валиден Сертификат!</h3>
          ) : (
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>🚫 АНУЛИРАН СЕРТИФИКАТ!</h3>
          )}
          
          <p><strong>Ученик:</strong> {result.name}</p>
          <p><strong>Постижение:</strong> {result.course}</p>
          <p><strong>Дата на издаване:</strong> {result.date}</p>
          <p><strong>Статус:</strong> {result.isValid ? "Активен" : "Невалиден / Оттеглен"}</p>
        </div>
      )}
    </div>
  );
}

export default VerifyForm;