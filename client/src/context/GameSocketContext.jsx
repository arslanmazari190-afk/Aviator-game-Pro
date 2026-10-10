import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import confetti from 'canvas-confetti';
import { API_BASE_URL } from '../api';
import { useAuth } from './AuthContext';
import { useSound } from './SoundContext';

const GameSocketContext = createContext(null);

export const GameSocketProvider = ({ children }) => {
  const { user, token, currency, updateBalanceLocally } = useAuth();
  const { sound } = useSound();

  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);
  const [gameState, setGameState] = useState('WAITING');
  const [multiplier, setMultiplier] = useState(1.00);
  const [countdown, setCountdown] = useState(5.0);
  const [currentRound, setCurrentRound] = useState(null);
  const [recentRounds, setRecentRounds] = useState([]);
  const [activeBets, setActiveBets] = useState([]);
  const [myBets, setMyBets] = useState({ 1: null, 2: null }); // Bet 1 & Bet 2 state
  const [topWins, setTopWins] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [settings, setSettings] = useState({});
  const [lastCrashData, setLastCrashData] = useState(null);

  const countdownIntervalRef = useRef(null);

  useEffect(() => {
    // Connect to WebSocket server
    const socketInstance = io(API_BASE_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socketInstance.on('connect', () => {
      console.log('[WS] Connected to Aviator Game Server.');
      setConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('[WS] Disconnected.');
      setConnected(false);
    });

    // Initial snapshot from server
    socketInstance.on('game_init', (data) => {
      if (!data) return;
      setGameState(data.state || 'WAITING');
      setMultiplier(data.currentMultiplier || 1.00);
      if (data.currentRound) setCurrentRound(data.currentRound);
      if (data.recentRounds) setRecentRounds(data.recentRounds);
      if (data.activeBets) setActiveBets(data.activeBets);
      if (data.topWins) setTopWins(data.topWins);
      if (data.chatMessages) setChatMessages(data.chatMessages);
      if (data.settings) setSettings(data.settings);
    });

    // Waiting phase (Betting countdown)
    socketInstance.on('game_waiting', (data) => {
      setGameState('WAITING');
      setMultiplier(1.00);
      setCurrentRound({
        id: data.roundId,
        roundNumber: data.roundNumber,
        serverSeedHash: data.serverSeedHash,
        clientSeed: data.clientSeed,
        nonce: data.nonce
      });
      setActiveBets(data.initialBets || []);
      setMyBets({ 1: null, 2: null }); // Reset user active bets for new round

      // Start client countdown timer
      const durationSec = (data.durationMs || 5000) / 1000;
      setCountdown(durationSec);

      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      const start = Date.now();
      const end = data.countdownEnd || (start + (data.durationMs || 5000));

      countdownIntervalRef.current = setInterval(() => {
        const remaining = Math.max(0, (end - Date.now()) / 1000);
        setCountdown(Number(remaining.toFixed(1)));
        if (remaining <= 0) {
          clearInterval(countdownIntervalRef.current);
        }
      }, 100);
    });

    // Flight started
    socketInstance.on('game_started', (data) => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      setGameState('FLYING');
      setMultiplier(1.00);
      sound.startEngine();
    });

    // Multiplier ticker (50ms rate)
    socketInstance.on('multiplier_tick', (data) => {
      setMultiplier(data.multiplier);
      sound.updateEnginePitch(data.multiplier);
    });

    // Game Crashed
    socketInstance.on('game_crashed', (data) => {
      setGameState('CRASHED');
      setMultiplier(data.crashMultiplier);
      setLastCrashData(data);
      sound.playCrash();

      // Add to recent rounds ribbon
      setRecentRounds(prev => [{
        id: data.roundId,
        round_number: data.roundNumber,
        crash_multiplier: data.crashMultiplier,
        server_seed: data.serverSeed,
        server_seed_hash: data.serverSeedHash,
        client_seed: data.clientSeed,
        nonce: data.nonce
      }, ...prev.slice(0, 39)]);

      // Mark uncashed bets as lost
      setActiveBets(prev => prev.map(b => b.status === 'ACTIVE' ? { ...b, status: 'LOST' } : b));
      setMyBets(prev => {
        const updated = { ...prev };
        if (updated[1] && updated[1].status === 'ACTIVE') updated[1].status = 'LOST';
        if (updated[2] && updated[2].status === 'ACTIVE') updated[2].status = 'LOST';
        return updated;
      });
    });

    // Another player placed a bet
    socketInstance.on('bet_placed', (bet) => {
      setActiveBets(prev => [bet, ...prev.filter(b => b.id !== bet.id)]);
    });

    // Player or bot cashed out
    socketInstance.on('bet_cashed_out', (data) => {
      setActiveBets(prev => prev.map(b => {
        if (b.id === data.betId) {
          return {
            ...b,
            status: 'WON',
            cashout_multiplier: data.multiplier,
            payout: data.payout
          };
        }
        return b;
      }));
    });

    // Chat message received
    socketInstance.on('chat_message', (msg) => {
      setChatMessages(prev => [...prev.slice(-99), msg]);
    });

    // User bet confirmed
    socketInstance.on('bet_confirmed', (res) => {
      if (res.success && res.bet) {
        setMyBets(prev => ({
          ...prev,
          [res.bet.bet_number]: res.bet
        }));
        if (res.newBalance !== undefined) {
          updateBalanceLocally(res.newBalance, res.bet.currency);
        }
      }
    });

    // User cashout success
    socketInstance.on('cashout_success', (res) => {
      if (res.success) {
        sound.playCashout();
        // Trigger celebratory confetti
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });

        if (res.newBalance !== undefined) {
          updateBalanceLocally(res.newBalance, res.currency);
        }

        setMyBets(prev => {
          const updated = { ...prev };
          if (updated[1] && updated[1].id === res.betId) {
            updated[1] = { ...updated[1], status: 'WON', cashout_multiplier: res.multiplier, payout: res.payout };
          }
          if (updated[2] && updated[2].id === res.betId) {
            updated[2] = { ...updated[2], status: 'WON', cashout_multiplier: res.multiplier, payout: res.payout };
          }
          return updated;
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
      socketInstance.disconnect();
    };
  }, []);

  // Action: Place Bet
  const placeBet = (betNumber, amount, autoCashoutMultiplier = null) => {
    if (!socket || !token) return;
    socket.emit('place_bet', {
      token,
      betNumber,
      currency,
      amount: Number(amount),
      autoCashoutMultiplier: autoCashoutMultiplier ? Number(autoCashoutMultiplier) : null
    });
  };

  // Action: Cash Out
  const cashOut = (betId) => {
    if (!socket || !token || !betId) return;
    socket.emit('cash_out', {
      token,
      betId
    });
  };

  // Action: Send Chat Message
  const sendChat = (message, emoji = null) => {
    if (!socket || !token) return;
    socket.emit('send_chat', {
      token,
      message,
      emoji
    });
  };

  return (
    <GameSocketContext.Provider value={{
      socket,
      connected,
      gameState,
      multiplier,
      countdown,
      currentRound,
      recentRounds,
      activeBets,
      myBets,
      topWins,
      chatMessages,
      settings,
      lastCrashData,
      placeBet,
      cashOut,
      sendChat
    }}>
      {children}
    </GameSocketContext.Provider>
  );
};

export const useGame = () => useContext(GameSocketContext);
