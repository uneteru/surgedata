import React from 'react';
import './App.css';
import TokenInfo from './components/TokenInfo.tsx';

function App() {
  return (
    <div className="matrix-theme">
      <div className="matrix-background"></div>
      <header className="matrix-header">
        <h1 className="matrix-title">SRG20 Token Analytics</h1>
        <TokenInfo />
      </header>
    </div>
  );
}

export default App;
