import React from 'react';

function Header() {
  return (
    <header style={{ textAlign: 'center', padding: '20px 0', borderBottom: '2px solid #ddd' }}>
      <h1>EduChain</h1>
      <p>Децентрализирана система за академични сертификати</p>
      <p>Проект на Мирослав Радуканов, ученик в ТУЕС, 8а клас</p>
      <p>Адрес за проверка (Суперадмин): <a href="https://sepolia.etherscan.io/address/0x7F7D5821234e313F4d7dcf1d4fDf4b550AdC9554" target="_blank" rel="noopener noreferrer">
        0x7F7D5821234e313F4d7dcf1d4fDf4b550AdC9554
    </a>
</p>
    </header>
  );
}

export default Header;
