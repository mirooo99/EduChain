import React, { useState, useRef } from 'react';
import { getContract } from '../utils/ethersHelper';
import { QRCodeSVG } from 'qrcode.react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

function IssueForm() {
  const [name, setName] = useState('');
  const [course, setCourse] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [certHash, setCertHash] = useState('');
  const [revokeId, setRevokeId] = useState('');
  const [newAdminAddr, setNewAdminAddr] = useState('');

  const [loading, setLoading] = useState(false);
  const certificateRef = useRef(null);

const getLinkedInLink = () => {
    if (!certHash) return "#";
    const baseUrl = "https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME";
    const credentialUrl = `https://educhain-five.vercel.app/?hash=${certHash}`;
    const dateObj = date ? new Date(date) : new Date();
    const year = dateObj.getFullYear();
    const month = dateObj.getMonth() + 1;

    const params = [
      `&name=${encodeURIComponent(course)}`,
      `&organizationName=${encodeURIComponent("Технологично Училище 'Електронни Системи'")}`,
      `&certId=${encodeURIComponent(certHash)}`,
      `&certUrl=${encodeURIComponent(credentialUrl)}`,
      `&issueYear=${year}`,
      `&issueMonth=${month}`
    ].join('');
    
    return baseUrl + params;
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    setCertHash('');
    setLoading(true);
    try {
      setStatus('Свързване с MetaMask...');
      const contract = await getContract();

      setStatus('Моля, потвърдете транзакцията в MetaMask...');
      const tx = await contract.issueCertificate(name, course, date);

      setStatus('Транзакцията се обработва в блокчейна (около 15-20 сек.)...');
      const receipt = await tx.wait();

      const log = receipt.logs.find(l => {
        try {
          return contract.interface.parseLog(l).name === "CertificateIssued";
        } catch (e) { return false; }
      });

      if (log) {
        const parsedLog = contract.interface.parseLog(log);
        const generatedId = parsedLog.args[0];
        setCertHash(generatedId);
        setStatus('Успешно издаден сертификат!');
      }
    } catch (error) {
      console.error(error);
      setStatus('Грешка. Уверете се, че сте Админ и имате Sepolia ETH.');
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = async () => {
    if (!certificateRef.current) return;
    setStatus('Генериране на PDF...');

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
      pdf.save(`EduChain_New_Certificate_${name}.pdf`);
      setStatus('PDF документът е изтеглен!');
    } catch (err) {
      console.error("Грешка при PDF:", err);
      setStatus('Грешка при генериране на PDF.');
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
      setStatus('Списъкът с админи е обновен!');
    } catch (error) {
      console.error(error);
      setStatus('Грешка: Само съществуващ Админ може да добавя други.');
    }
  };

  const handleRevokeWithConfirmation = async () => {
    if (!revokeId) return;
    if (window.confirm("ВНИМАНИЕ: Това действие е необратимо и ще бъде записано вечно в блокчейна! Сигурни ли сте, че искате да анулирате сертификата?")) {
      try {
        setStatus('Анулиране...');
        const contract = await getContract();
        const tx = await contract.revokeCertificate(revokeId);
        await tx.wait();
        setStatus('Сертификатът е анулиран успешно!');
      } catch (error) {
        setStatus('Грешка при анулиране.');
      }
    }
  };

  const copyHashToClipboard = () => {
    if (certHash) {
      navigator.clipboard.writeText(certHash);
      setStatus('Хешът е копиран успешно!');
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div dir="ltr" style={{ padding: '20px', backgroundColor: 'white', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '25px' }}>

      <section>
        <h2>Издаване на сертификат</h2>
        <form onSubmit={handleIssue} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <input type="text" placeholder="Име на ученик" value={name} onChange={(e) => setName(e.target.value)} required style={{padding: '8px'}} />
          <input type="text" placeholder="Курс / Постижение" value={course} onChange={(e) => setCourse(e.target.value)} required style={{padding: '8px'}} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{padding: '8px'}} />
          <button type="submit" disabled={loading} style={{ backgroundColor: '#007bff', color: 'white', padding: '12px', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
            {loading ? 'Обработка...' : 'Издай в Блокчейн'}
          </button>
        </form>

        {certHash && (
          <div style={{ marginTop: '20px', padding: '15px', background: '#f8fff9', border: '2px solid #28a745', borderRadius: '5px' }}>
            <p style={{ color: '#28a745', fontWeight: 'bold', margin: '0 0 10px 0' }}>Успех!</p>
            
            <p style={{ fontSize: '0.9rem' }}>
  <strong>Hash ID:</strong>{' '}
  <code 
    onClick={copyHashToClipboard}
    title="Кликни за копиране"
    style={{ 
      wordBreak: 'break-all', 
      cursor: 'pointer', 
      backgroundColor: 'rgba(40, 167, 69, 0.1)', 
      padding: '4px 8px', 
      borderRadius: '4px',
      border: '1px dashed #28a745',
      display: 'inline-block',
      marginTop: '5px'
    }}
  >
    {certHash}
  </code>
</p>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={downloadPDF} style={{ flex: 1, padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' }}>
                Изтегли PDF
              </button>
              
              <a href={getLinkedInLink()} target="_blank" rel="noreferrer" style={{ flex: 1, padding: '10px', backgroundColor: '#0077b5', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', textAlign: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
                Добави в LinkedIn
              </a>
            </div>
          </div>
        )}
      </section>

      <hr />

      <section>
        <h3>Управление на екипа (Админи)</h3>
        <input type="text" placeholder="0x Адрес" value={newAdminAddr} onChange={(e) => setNewAdminAddr(e.target.value)} style={{width: '100%', padding: '8px', boxSizing: 'border-box'}} />
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <button onClick={() => handleRole('add')} style={{ flex: 1, backgroundColor: '#28a745', color: 'white', padding: '8px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Добави</button>
          <button onClick={() => handleRole('remove')} style={{ flex: 1, backgroundColor: '#6c757d', color: 'white', padding: '8px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Премахни</button>
        </div>
      </section>

      <hr />
          
      <section>
        <h3>Анулиране на документ</h3>
        <input type="text" placeholder="Hash ID за анулиране" value={revokeId} onChange={(e) => setRevokeId(e.target.value)} style={{width: '100%', padding: '8px', boxSizing: 'border-box'}} />
        <button onClick={handleRevokeWithConfirmation} style={{ width: '100%', marginTop: '10px', backgroundColor: '#dc3545', color: 'white', padding: '8px', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Анулирай Сертификат</button>
      </section>

      {status && (
        <div style={{ padding: '12px', borderLeft: '4px solid #007bff', background: '#f0f7ff', fontWeight: '500', fontSize: '0.9rem' }}>
          {status}
        </div>
      )}

      <div style={{ position: 'absolute', top: '-10000px', left: '-10000px' }}>
        {certHash && (
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
                  <h2 style={{ fontSize: '50px', margin: '15px 0', color: '#d4af37', fontWeight: 'bold' }}>{name}</h2>
                  <p style={{ fontSize: '22px', fontStyle: 'italic', color: '#486581' }}>за постигнато отличие</p>
                  <h3 style={{ fontSize: '35px', margin: '15px 0', color: '#102a43' }}>{course}</h3>
                </div>

                <div style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '10px' }}>
                  <div style={{ textAlign: 'center', width: '250px' }}>
                    <p style={{ fontSize: '20px', margin: '0 0 10px 0' }}>{date ? date.split('-').reverse().join('.') : ''}</p>
                    <div style={{ width: '100%', borderBottom: '2px solid #102a43', marginBottom: '5px' }}></div>
                    <p style={{ fontSize: '16px', color: '#486581', margin: 0 }}>Дата на издаване</p>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div style={{ border: '4px solid #102a43', padding: '5px', backgroundColor: '#fff' }}>
                      <QRCodeSVG value={`https://educhain-five.vercel.app/?hash=${certHash}`} size={100} level="H" />
                    </div>
                    <div style={{ textAlign: 'center', marginTop: '10px' }}>
                      <p style={{ fontSize: '12px', fontWeight: 'bold', color: '#102a43', margin: '0 0 3px 0' }}>VERIFIED ON EDUCHAIN</p>
                      <p style={{ fontSize: '9px', color: '#627d98', margin: 0, maxWidth: '180px', wordWrap: 'break-word', lineHeight: '1.1' }}>TX: {certHash}</p>
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

export default IssueForm;
