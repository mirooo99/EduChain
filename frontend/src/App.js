import React, { useState } from 'react';
import Header from './components/Header';
import IssueForm from './components/IssueForm';
import VerifyForm from './components/VerifyForm';

function App() {
  const [view, setView] = useState('verify');

  return (
    <div className="container">
      <Header />
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <button onClick={() => setView('verify')} style={{ marginRight: '10px' }}>Провери Сертификат</button>
        <button onClick={() => setView('issue')}>Действия за админи</button>
      </div>

      {view === 'verify' ? <VerifyForm /> : <IssueForm />}
    </div>
  );
}

export default App;
