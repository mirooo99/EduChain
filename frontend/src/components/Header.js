import React from 'react';

function Header() {
  return (
    <header style={{ textAlign: 'center', padding: '20px 0', borderBottom: '2px solid #ddd' }}>
      <h1>EduChain</h1>
      <p>Децентрализирана система за академични сертификати</p>
      <p>Проект на Мирослав Радуканов, ученик в ТУЕС, 8а клас</p>
      <p>Адрес за справка: 
      <p>Адрес за справка в <a href="https://sepolia.etherscan.io/address/0x60E9965A231504191E1Fc3F0a80ae1C36a12f84e" target="_blank" rel="noopener noreferrer">
        0x60E9965A231504191E1Fc3F0a80ae1C36a12f84e
    </a>
</p>
    </header>
  );
}

export default Header;
