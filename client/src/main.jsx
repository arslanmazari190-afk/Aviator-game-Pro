import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { AuthProvider } from './context/AuthContext.jsx';
import { SoundProvider } from './context/SoundContext.jsx';
import { GameSocketProvider } from './context/GameSocketContext.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <SoundProvider>
        <GameSocketProvider>
          <App />
        </GameSocketProvider>
      </SoundProvider>
    </AuthProvider>
  </React.StrictMode>
);
