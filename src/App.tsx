import React from 'react';
import './App.css';
import TokenInfo from './components/TokenInfo.tsx';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1 className="blockchain-heading">Blockchain Token Info</h1>
        <TokenInfo />
      </header>
    </div>
  );
}

export default App;
