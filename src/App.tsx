import React from 'react';
import './App.css';
import TokenInfo from './components/TokenInfo.tsx';
import WelcomeMessage from './components/WelcomeMessage.tsx';
import MatrixBackground from './components/MatrixBackground.tsx';

function App() {
  return (
    <div className="matrix-theme">
      <MatrixBackground />
      <WelcomeMessage />
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
