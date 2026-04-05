import React, { useState, useRef } from 'react';
import { getContract } from '../utils/ethersHelper';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function VerifyForm() {
  const [certId, setCertId] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const certificateRef = useRef(null);

  // Функция за помощно форматиране на дата
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return dateStr.includes('-') ? dateStr.split('-').reverse().join('.') : dateStr;
  };

  const getLinkedInLink = () => {
    if (!result) return "#";
    const baseUrl = "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME";
    const params = `&name=${encodeURIComponent(result.course)}&organizationName=${encodeURIComponent("Технологично Училище 'Електронни Системи'")}&certId=${certId}`;
    return baseUrl + params;
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);

    try {
      const contract = await getContract();
      const data = await contract.verifyCertificate(certId);
      
      // Приемаме, че структурата от контракта е:
      // [име, курс, дата_издаване, валидност, дата_създаване, дата_анулиране]
      setResult({
        name: data[0],
        course: data[1],
        date: data[2],
        isValid: data[3],
        createdAt: data[4] || data[2], // Вземаме дата от контракта или текущата
        revokedAt: data[5] || "Неизвестно" // Ако има дата на анулиране в контракта
      });
    } catch (err) {
      console.error(err);
      setError('❌ Сертификатът не е намерен. Проверете дали Hash ID е правилен.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    setLoading(true);
    
    try {
      const element = certificateRef.current;
      const canvas = await html2canvas(element, { 
        scale: 3, 
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`EduChain_Certificate_${result.name}.pdf`);
    } catch (err) {
      console.error("Грешка при генериране на PDF:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', maxWidth: '600px', margin: 'auto', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
      <h2>Проверка на автентичност</h2>
      <p style={{ fontSize: '0.9em', color: '#666' }}>Въведете уникалния хеш код (Sepolia Blockchain).</p>
      
      <form onSubmit={handleVerify} style={{ display: 'flex', flexDirection: 'column' }}>
        <input 
          type="text" 
          placeholder="0x..." 
          value={certId} 
          onChange={(e) => setCertId(e.target.value)} 
          required 
          style={{ padding: '12px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px', backgroundColor: '#0052cc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Зареждане...' : 'Провери'}
        </button>
      </form>
      
      {error && <p style={{ color: 'red', marginTop: '15px', fontWeight: 'bold' }}>{error}</p>}
      
      {result && (
        <div style={{ 
          marginTop: '25px', padding: '20px', borderRadius: '8px',
          border: `2px solid ${result.isValid ? '#28a745' : '#dc3545'}`, 
          backgroundColor: result.isValid ? '#f8fff9' : '#fff8f8' 
        }}>
          {result.isValid ? (
            <h3 style={{ color: '#28a745', marginTop: 0 }}>✅ Валиден Сертификат!</h3>
          ) : (
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>🚫 АНУЛИРАН СЕРТИФИКАТ!</h3>
          )}
          
          <div style={{ lineHeight: '1.6' }}>
            <p><strong>Ученик:</strong> {result.name}</p>
            <p><strong>Постижение:</strong> {result.course}</p>
            <p><strong>Дата на издаване:</strong> {formatDate(result.date)}</p>
            <p><strong>Статус:</strong> <span style={{ color: result.isValid ? '#28a745' : '#dc3545', fontWeight: 'bold' }}>
              {result.isValid ? "Активен" : "Невалиден / Оттеглен"}
            </span></p>
            
            {/* ПОЛЕ: Кога е създаден */}
            <p style={{ fontSize: '0.9em', color: '#555', borderTop: '1px solid #eee', pt: '10px', marginTop: '10px' }}>
              <strong>Създаден на:</strong> {formatDate(result.createdAt)}
            </p>

            {/* ПОЛЕ: Кога е анулиран (показва се само ако не е валиден) */}
            {!result.isValid && (
              <p style={{ color: '#dc3545', fontWeight: 'bold', backgroundColor: '#ffd6d6', padding: '5px', borderRadius: '4px' }}>
                ⚠️ Анулиран на: {formatDate(result.revokedAt)}
              </p>
            )}
          </div>
          
          <hr style={{ margin: '20px 0', border: '0', borderTop: '1px solid #ccc' }} />
          
          {result.isValid && (
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button 
                onClick={downloadPDF}
                disabled={loading}
                style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
              >
                {loading ? 'Генериране...' : '📥 Изтегли PDF Грамота'}
              </button>

              <a 
                href={getLinkedInLink()} 
                target="_blank" 
                rel="noreferrer" 
                style={{ width: '100%', padding: '12px', backgroundColor: '#0077b5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center', textDecoration: 'none' }}
              >
                💙 Добави в LinkedIn
              </a>
            </div>
          )}
        </div>
      )}

      {/* Скрита секция за генериране на сертификата */}
      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        {result && result.isValid && (
          <div ref={certificateRef} style={{ width: '297mm', height: '210mm', backgroundColor: '#faf9f6', padding: '10mm', fontFamily: 'serif' }}>
            <div style={{ width: '100%', height: '100%', border: '12px solid #102a43', padding: '5mm' }}>
              <div style={{ width: '100%', height: '100%', border: '3px solid #d4af37', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '40px' }}>
                
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '24px', color: '#627d98', textTransform: 'uppercase' }}>Технологично Училище "Електронни Системи"</h2>
                  <div style={{ width: '100px', height: '2px', backgroundColor: '#d4af37', margin: '15px auto' }}></div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ fontSize: '60px', color: '#102a43', margin: '0' }}>СЕРТИФИКАТ</h1>
                  <p style={{ fontSize: '20px', fontStyle: 'italic' }}>Настоящият документ се издава на</p>
                  <h2 style={{ fontSize: '45px', color: '#d4af37', margin: '10px 0' }}>{result.name}</h2>
                  <p style={{ fontSize: '20px', fontStyle: 'italic' }}>за постигнато отличие</p>
                  <h3 style={{ fontSize: '30px', color: '#102a43' }}>{result.course}</h3>
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div style={{ textAlign: 'center', width: '200px' }}>
                    <p style={{ fontSize: '18px' }}>{formatDate(result.date)}</p>
                    <div style={{ borderBottom: '2px solid #102a43' }}></div>
                    <p style={{ fontSize: '14px' }}>Дата на издаване</p>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <QRCodeSVG value={certId} size={80} />
                    <p style={{ fontSize: '8px', marginTop: '5px' }}>TX: {certId.substring(0, 20)}...</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VerifyForm;
