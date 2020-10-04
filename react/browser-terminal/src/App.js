import React from 'react';
import logo from './logo.svg';
import './App.css';
import Terminal from './components/terminal/Terminal';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Terminal/>
      </header>
    </div>
  );
}

export default App;
