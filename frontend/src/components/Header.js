import React from 'react';

function Header() {
  return (
    <header style={{ textAlign: 'center', padding: '20px 0', borderBottom: '2px solid #ddd' }}>
      <h1>EduChain</h1>
      <p>Децентрализирана система за академични сертификати</p>
      <p>Проект на Мирослав Радуканов, ученик в ТУЕС, 8а клас</p>
      <p>Контракт за проверка: <a href="https://sepolia.etherscan.io/address/0x41383d37529f411d529547107d498f87721c2b139bcd67450093d293afedb9d2" target="_blank" rel="noopener noreferrer">
        0x41383d37529f411d529547107d498f87721c2b139bcd67450093d293afedb9d2
    </a>
</p>
    </header>
  );
}

export default Header;
