import React from 'react';
import './App.css';
import TokenInfo from './components/TokenInfo.tsx';
import WelcomeMessage from './components/WelcomeMessage.tsx';
import SystemMessages from './components/SystemMessages.tsx';

function App() {
  return (
    <div className="matrix-theme">
      <div className="matrix-background"></div>
      <WelcomeMessage />
      <SystemMessages />
      <div className="main-content">
        <header className="matrix-header">
          <h1 className="matrix-title">SRG20 Token Analytics</h1>
          <TokenInfo />
        </header>
      </div>
    </div>
  );
}

export default App;
