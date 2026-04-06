import React, { useState, useRef, useEffect, useCallback } from 'react';
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

  const getLinkedInLink = () => {
    if (!result) return "#";
    const baseUrl = "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME";
    const params = `&name=${encodeURIComponent(result.course)}&organizationName=${encodeURIComponent("Технологично Училище 'Електронни Системи'")}&certId=${certId}`;
    return baseUrl + params;
  };

  const handleVerify = useCallback(async (manualHash) => {
    // Взимаме хеша или от подадения параметър (за автоматична проверка), или от стейта (за бутона)
    const hashToVerify = typeof manualHash === 'string' ? manualHash : certId;
    
    if (typeof manualHash !== 'string' && manualHash && manualHash.preventDefault) {
      manualHash.preventDefault();
    }

    if (!hashToVerify) return;

    setError('');
    setResult(null);
    setLoading(true);

    try {
      const contract = await getContract();
      const data = await contract.verifyCertificate(hashToVerify);
      
      setResult({
        name: data[0],
        course: data[1],
        date: data[2],
        isValid: data[3]
      });
    } catch (err) {
      console.error(err);
      setError('Сертификатът не е намерен. Проверете дали Hash ID е правилен.');
    } finally {
      setLoading(false);
    }
  }, [certId]);

  // Ефектът се изпълнява само веднъж при монтиране на компонента
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hashFromUrl = urlParams.get('hash');
    if (hashFromUrl) {
      setCertId(hashFromUrl);
      handleVerify(hashFromUrl);
    }
    // Празен масив, за да не се презаписва при всяка промяна на полето
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          style={{ padding: '10px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ padding: '12px', backgroundColor: '#0052cc', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Зареждане...' : 'Провери'}
        </button>
      </form>
      
      {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      
      {result && (
        <div style={{ 
          marginTop: '20px', padding: '15px', borderRadius: '5px',
          border: `2px solid ${result.isValid ? '#28a745' : '#dc3545'}`, 
          backgroundColor: result.isValid ? '#f8fff9' : '#fff8f8' 
        }}>
          {result.isValid ? (
            <h3 style={{ color: '#28a745', marginTop: 0 }}>Валиден Сертификат!</h3>
          ) : (
            <h3 style={{ color: '#dc3545', marginTop: 0 }}>АНУЛИРАН СЕРТИФИКАТ!</h3>
          )}
          <p><strong>Ученик:</strong> {result.name}</p>
          <p><strong>Постижение:</strong> {result.course}</p>
          
          <p><strong>Дата на издаване:</strong> {result.date.includes('-') ? result.date.split('-').reverse().join('.') : result.date}</p>
          
          <p><strong>Статус:</strong> {result.isValid ? "Активен" : "Невалиден / Оттеглен"}</p>

          <hr style={{ margin: '15px 0' }} />
          
          {result.isValid && (
            <div style={{ display: 'flex', gap: '10px', flexDirection: 'column' }}>
              <button 
                onClick={downloadPDF}
                disabled={loading}
                style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' }}
              >
                {loading ? 'Генериране...' : 'Изтегли PDF Грамота'}
              </button>

              <a 
                href={getLinkedInLink()} 
                target="_blank" 
                rel="noreferrer" 
                style={{ width: '100%', padding: '12px', backgroundColor: '#0077b5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}
              >
                Добави в LinkedIn Профил
              </a>
            </div>
          )}
        </div>
      )}

      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        {result && result.isValid && (
          <div 
            ref={certificateRef} 
            style={{ width: '297mm', height: '210mm', backgroundColor: '#faf9f6', boxSizing: 'border-box', padding: '10mm', position: 'relative', fontFamily: '"Georgia", "Times New Roman", serif', color: '#102a43' }}
          >
            <div style={{ width: '100%', height: '100%', border: '12px solid #102a43', boxSizing: 'border-box', padding: '5mm', position: 'relative' }}>
              <div style={{ width: '100%', height: '100%', border: '3px solid #d4af37', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center', padding: '30px 60px 40px 60px' }}>
                
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ margin: 0, fontSize: '24px', color: '#627d98', letterSpacing: '2px', textTransform: 'uppercase' }}>
                    Технологично Училище "Електронни Системи"
                  </h2>
                  <div style={{ width: '100px', height: '2px', backgroundColor: '#d4af37', margin: '15px auto' }}></div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <h1 style={{ margin: '0 0 10px 0', fontSize: '65px', color: '#102a43', letterSpacing: '5px' }}>СЕРТИФИКАТ</h1>
                  <p style={{ fontSize: '22px', fontStyle: 'italic', color: '#486581' }}>Настоящият документ се издава на</p>
                  <h2 style={{ fontSize: '50px', margin: '15px 0', color: '#d4af37', fontWeight: 'bold' }}>{result.name}</h2>
                  <p style={{ fontSize: '22px', fontStyle: 'italic', color: '#486581' }}>за постигнато отличие</p>
                  <h3 style={{ fontSize: '35px', margin: '15px 0', color: '#102a43' }}>{result.course}</h3>
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                  <div style={{ textAlign: 'center', width: '250px' }}>
                    <p style={{ fontSize: '20px', margin: '0 0 10px 0' }}>{result.date.includes('-') ? result.date.split('-').reverse().join('.') : result.date}</p>
                    <div style={{ width: '100%', borderBottom: '2px solid #102a43', marginBottom: '5px' }}></div>
                    <p style={{ fontSize: '16px', color: '#486581', margin: 0 }}>Дата на издаване</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ border: '4px solid #102a43', padding: '5px', backgroundColor: '#fff' }}>
                      <QRCodeSVG value={`https://educhain-five.vercel.app/?hash=${certId}`} size={100} level="H" />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#102a43', margin: '0 0 3px 0' }}>VERIFIED ON EDUCHAIN</p>
                      <p style={{ fontSize: '9px', color: '#627d98', margin: 0, maxWidth: '180px', wordWrap: 'break-word', lineHeight: '1.1' }}>TX: {certId}</p>
                    </div>
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
