import React, { useState } from 'react';
import './App.css';
import Header from './components/Header';
import IssueForm from './components/IssueForm';
import VerifyForm from './components/VerifyForm';

function App() {
  const [view, setView] = useState('verify');

  return (
    <div className="container">
      <Header />
      
      <div className="nav-container">
        <button 
          className={`nav-button ${view === 'verify' ? 'active' : ''}`} 
          onClick={() => setView('verify')}
        >
          Провери Сертификат
        </button>
        <button 
          className={`nav-button ${view === 'issue' ? 'active' : ''}`} 
          onClick={() => setView('issue')}
        >
          Действия за админи
        </button>
      </div>

      <div className="main-card">
        {view === 'verify' ? <VerifyForm /> : <IssueForm />}
      </div>
    </div>
  );
}

export default App;
