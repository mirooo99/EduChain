import React from 'react';

function Header() {
  return (
    <header style={{ textAlign: 'center', padding: '20px 0', borderBottom: '2px solid #ddd' }}>
      <h1>EduChain</h1>
      <p>Децентрализирана система за академични сертификати</p>
      <p>Проект на Мирослав Радуканов, ученик в ТУЕС, 8а клас</p>
      <p>Адрес за справка: 
    <a href="https://sepolia.etherscan.io/address/0x60E9965A231504191E1Fc3F0a80ae1C36a12f84e" 
       target="_blank" 
       rel="noopener noreferrer" 
       style="font-family: monospace; color: #007bff; text-decoration: none; background-color: #f8f9fa; padding: 2px 5px; border-radius: 4px; border: 1px solid #dee2e6;">
        0x60E9965A231504191E1Fc3F0a80ae1C36a12f84e
    </a>
</p>
    </header>
  );
}

export default Header;
