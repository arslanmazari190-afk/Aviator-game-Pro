const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const jwt = require('jsonwebtoken');

const { PORT, JWT_SECRET, UPLOAD_DIR } = require('./config/constants');
const db = require('./db/db');
const GameEngine = require('./engine/GameEngine');

// Routes
const authRoutes = require('./routes/authRoutes');
const walletRoutes = require('./routes/walletRoutes');
const gameRoutes = require('./routes/gameRoutes');
const adminRoutes = require('./routes/adminRoutes');
const webhookRoutes = require('./routes/webhookRoutes');

const app = express();
const server = http.createServer(app);

// Cross-Origin configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded receipts statically
app.use('/uploads', express.static(UPLOAD_DIR));

// Initialize Socket.IO with WebSocket + Polling transport
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  },
  pingTimeout: 30000,
  pingInterval: 25000
});

// Pass IO and GameEngine to Express app context
app.set('io', io);
const gameEngine = new GameEngine(io);
app.set('gameEngine', gameEngine);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/wallet', walletRoutes);
app.use('/api/game', gameRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/webhooks', webhookRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    gameState: gameEngine.state,
    currentMultiplier: gameEngine.currentMultiplier,
    activeConnections: io.engine.clientsCount
  });
});

// Socket.io Real-Time Connection Handling
io.on('connection', (socket) => {
  console.log(`[SOCKET CONNECTED] Socket ID: ${socket.id} (Total: ${io.engine.clientsCount})`);

  // Send initial snapshot on connect
  socket.emit('game_init', gameEngine.getInitialState());

  // Helper to authenticate socket requests
  const getSocketUser = (token) => {
    if (!token) return null;
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return db.findUserById(decoded.id);
    } catch (err) {
      return null;
    }
  };

  // 1. Place Bet Event
  socket.on('place_bet', (data, callback) => {
    try {
      const { token, betNumber = 1, currency = 'PKR', amount, autoCashoutMultiplier } = data;
      const user = getSocketUser(token);

      if (!user) {
        const errRes = { success: false, message: 'Authentication required to place bet.' };
        if (typeof callback === 'function') callback(errRes);
        return socket.emit('bet_error', errRes);
      }

      if (user.is_frozen) {
        const errRes = { success: false, message: 'Your account is frozen.' };
        if (typeof callback === 'function') callback(errRes);
        return socket.emit('bet_error', errRes);
      }

      const bet = gameEngine.placeBet(user, {
        betNumber,
        currency,
        amount: Number(amount),
        autoCashoutMultiplier: autoCashoutMultiplier ? Number(autoCashoutMultiplier) : null
      });

      const updatedUser = db.findUserById(user.id);
      const successRes = {
        success: true,
        bet,
        newBalance: currency === 'PKR' ? updatedUser.balance_pkr : updatedUser.balance_usdt
      };

      if (typeof callback === 'function') callback(successRes);
      socket.emit('bet_confirmed', successRes);
    } catch (err) {
      const errRes = { success: false, message: err.message || 'Failed to place bet.' };
      if (typeof callback === 'function') callback(errRes);
      socket.emit('bet_error', errRes);
    }
  });

  // 2. Cash Out Event
  socket.on('cash_out', (data, callback) => {
    try {
      const { token, betId } = data;
      const user = getSocketUser(token);

      if (!user) {
        const errRes = { success: false, message: 'Authentication required to cash out.' };
        if (typeof callback === 'function') callback(errRes);
        return socket.emit('cashout_error', errRes);
      }

      const result = gameEngine.cashOutBet(betId, user.id);
      const updatedUser = db.findUserById(user.id);

      const successRes = {
        success: true,
        ...result,
        newBalance: result.currency === 'PKR' ? updatedUser.balance_pkr : updatedUser.balance_usdt
      };

      if (typeof callback === 'function') callback(successRes);
      socket.emit('cashout_success', successRes);
    } catch (err) {
      const errRes = { success: false, message: err.message || 'Cashout failed.' };
      if (typeof callback === 'function') callback(errRes);
      socket.emit('cashout_error', errRes);
    }
  });

  // 3. Live Chat message
  socket.on('send_chat', (data) => {
    try {
      const { token, message, emoji } = data;
      const user = getSocketUser(token);
      if (!user || !message || message.trim().length === 0) return;

      const chatMsg = db.addChatMessage({
        user_id: user.id,
        username: user.username,
        is_admin: user.role === 'admin',
        message: message.trim().substring(0, 200),
        emoji: emoji || null
      });

      io.emit('chat_message', chatMsg);
    } catch (err) {
      console.error('[SOCKET CHAT ERROR]', err);
    }
  });

  socket.on('disconnect', () => {
    console.log(`[SOCKET DISCONNECTED] Socket ID: ${socket.id} (Remaining: ${io.engine.clientsCount})`);
  });
});

// Start the game engine loop
gameEngine.start();

// Start HTTP Server
server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 AVIATOR SERVER & REAL-TIME ENGINE ACTIVE ON PORT ${PORT}`);
  console.log(`🌐 HTTP API: http://localhost:${PORT}/api/health`);
  console.log(`⚡ WebSocket Engine: ws://localhost:${PORT}`);
  console.log(`=======================================================`);
});
