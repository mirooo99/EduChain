import React, { useState, useEffect } from 'react';

function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  const setDarkMode = (dark) => {
    setIsDark(dark);
    if (dark) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('theme', 'light');
    }
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.ctrlKey && (event.key === 'y' || event.key === 'Y')) {
        event.preventDefault();
        setIsDark((prevIsDark) => {
          const newStatus = !prevIsDark;
          setDarkMode(newStatus);
          return newStatus;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header style={{ 
      textAlign: 'center', 
      padding: '20px 0', 
      borderBottom: '2px solid var(--header-border)', 
      position: 'relative' 
    }}>
      
      <button 
        onClick={() => setDarkMode(!isDark)}
        style={{
          position: 'absolute',
          right: '0px',
          top: '10px',
          background: 'var(--nav-btn-bg)',
          border: '1px solid var(--input-border)',
          color: 'var(--text-main)',
          padding: '6px 12px',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '0.85rem',
          boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
          transition: 'all 0.3s ease'
        }}
      >
        {isDark ? '☀️' : '🌙'}
      </button>

      <h1>EduChain</h1>
      <p style={{ color: 'var(--text-main)' }}>Децентрализирана система за академични сертификати</p>
      <p style={{ color: 'var(--text-main)', opacity: 0.8 }}>Проект на Мирослав Радуканов, ученик в ТУЕС, 8а клас</p>
      <p style={{ color: 'var(--text-main)' }}>
        Контракт за проверка: <a href="https://sepolia.etherscan.io/address/0x4E8364aB888a4E7F299DcB3a383C4380DeA7aaA6" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--link-color)' }}>
          0x4E8364aB888a4E7F299DcB3a383C4380DeA7aaA6
        </a>
      </p>
    </header>
  );
}

export default Header;
