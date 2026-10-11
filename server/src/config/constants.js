const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const jwtSecret = process.env.JWT_SECRET;
if (!jwtSecret || Buffer.byteLength(jwtSecret, 'utf8') < 32) {
  throw new Error('JWT_SECRET must be configured with at least 32 characters.');
}

module.exports = {
  PORT: process.env.PORT || 5000,
  JWT_SECRET: jwtSecret,
  JWT_EXPIRY: '7d',
  
  // Game Loop Timings (milliseconds)
  BETTING_DURATION_MS: 5000,    // 5 seconds betting countdown
  CRASH_COOLDOWN_MS: 3000,      // 3 seconds delay after crash
  MULTIPLIER_TICK_RATE_MS: 50,  // 20 updates per second (50ms interval)
  
  // Game States
  GAME_STATES: {
    WAITING: 'WAITING',
    FLYING: 'FLYING',
    CRASHED: 'CRASHED'
  },
  
  // Currencies
  CURRENCIES: {
    PKR: 'PKR',
    USDT: 'USDT'
  },
  
  // Payment Gateways
  PAYMENT_GATEWAYS: {
    EASYPAISA: 'EASYPAISA',
    JAZZCASH: 'JAZZCASH',
    BANK_TRANSFER: 'BANK_TRANSFER',
    CRYPTO_USDT: 'CRYPTO_USDT'
  },
  
  // Default Settings
  DEFAULT_SETTINGS: {
    rtp: 97.0,             // 97% Return to player
    houseEdge: 3.0,        // 3% house edge
    minBetPKR: 50,
    maxBetPKR: 100000,
    minBetUSDT: 1.0,
    maxBetUSDT: 1000.0,
    maxMultiplier: 10000.0,
    maxProfitPKR: 1000000, // 1 Million PKR cap per bet
    maxProfitUSDT: 10000,
    botCountMin: 8,
    botCountMax: 22
  },

  UPLOAD_DIR: path.join(__dirname, '../../uploads')
};
