const EventEmitter = require('events');
const db = require('../db/db');
const ProvablyFair = require('./ProvablyFair');
const BotSimulator = require('./BotSimulator');
const {
  GAME_STATES,
  BETTING_DURATION_MS,
  CRASH_COOLDOWN_MS,
  MULTIPLIER_TICK_RATE_MS
} = require('../config/constants');

class GameEngine extends EventEmitter {
  constructor(io) {
    super();
    this.io = io;
    this.state = GAME_STATES.WAITING;
    this.currentRound = null;
    this.currentMultiplier = 1.00;
    this.targetCrashMultiplier = 1.00;
    this.flightStartTime = 0;
    this.loopInterval = null;
    this.waitingTimer = null;
    this.activeBets = new Map(); // key: betId, value: betObject
    this.manualCrashOverride = null;
    this.nextMultiplierOverride = null;

    // Start background chat bot simulator
    this.startChatSimulation();
  }

  start() {
    console.log('[GAME ENGINE] Starting Aviator game loop...');
    this.startWaitingPhase();
  }

  /**
   * Phase 1: Waiting for Bets (Countdown phase)
   */
  startWaitingPhase() {
    this.state = GAME_STATES.WAITING;
    this.currentMultiplier = 1.00;
    this.activeBets.clear();

    const settings = db.getSettings();
    const serverSeed = ProvablyFair.generateServerSeed();
    const serverSeedHash = ProvablyFair.hashServerSeed(serverSeed);
    const clientSeed = ProvablyFair.generateClientSeed();

    // Create a new round record in DB
    const round = db.createGameRound({
      server_seed: serverSeed,
      server_seed_hash: serverSeedHash,
      client_seed: clientSeed,
      nonce: 0, // Will be set to round_number
      crash_multiplier: 1.00,
      status: 'WAITING'
    });

    // Nonce equals round number
    round.nonce = round.round_number;
    this.currentRound = round;

    // Calculate deterministic crash multiplier
    if (this.nextMultiplierOverride) {
      this.targetCrashMultiplier = this.nextMultiplierOverride;
      this.nextMultiplierOverride = null;
      console.log(`[GAME ENGINE] Round #${round.round_number} (OVERRIDDEN) Target Crash: ${this.targetCrashMultiplier}x`);
    } else {
      const { multiplier } = ProvablyFair.calculateCrashMultiplier(
        serverSeed,
        clientSeed,
        round.nonce,
        settings.houseEdge,
        settings.maxMultiplier
      );
      this.targetCrashMultiplier = multiplier;
      console.log(`[GAME ENGINE] Round #${round.round_number} ServerSeedHash: ${serverSeedHash.substring(0, 16)}... Target Crash: ${this.targetCrashMultiplier}x`);
    }

    // Generate bots for this round
    const botCount = Math.floor(Math.random() * (settings.botCountMax - settings.botCountMin + 1)) + settings.botCountMin;
    const bots = BotSimulator.generateRoundBots(botCount);
    for (const bot of bots) {
      this.activeBets.set(bot.id, bot);
    }

    const countdownStart = Date.now();
    const countdownEnd = countdownStart + BETTING_DURATION_MS;

    // Broadcast Waiting state to all clients
    this.io.emit('game_waiting', {
      roundId: round.id,
      roundNumber: round.round_number,
      serverSeedHash: serverSeedHash,
      clientSeed: clientSeed,
      nonce: round.nonce,
      durationMs: BETTING_DURATION_MS,
      countdownEnd: countdownEnd,
      initialBets: Array.from(this.activeBets.values())
    });

    // Schedule takeoff
    clearTimeout(this.waitingTimer);
    this.waitingTimer = setTimeout(() => {
      this.startFlightPhase();
    }, BETTING_DURATION_MS);
  }

  /**
   * Phase 2: Flying (Plane taking off & dynamic multiplier curve)
   */
  startFlightPhase() {
    this.state = GAME_STATES.FLYING;
    this.flightStartTime = Date.now();
    this.currentMultiplier = 1.00;

    db.updateGameRound(this.currentRound.id, {
      status: 'FLYING',
      crash_multiplier: this.targetCrashMultiplier
    });

    this.io.emit('game_started', {
      roundId: this.currentRound.id,
      roundNumber: this.currentRound.round_number,
      startTime: this.flightStartTime
    });

    // Multiplier calculation loop (20 ticks / second)
    clearInterval(this.loopInterval);
    this.loopInterval = setInterval(() => {
      this.tickFlight();
    }, MULTIPLIER_TICK_RATE_MS);
  }

  /**
   * Flight tick execution
   */
  tickFlight() {
    if (this.state !== GAME_STATES.FLYING) return;

    const elapsedSeconds = (Date.now() - this.flightStartTime) / 1000;

    // Realistic exponential multiplier curve:
    // M(t) = 1.00 + (0.06 * t) + (0.04 * t^1.75)
    let calculated = 1.00 + (0.06 * elapsedSeconds) + (0.04 * Math.pow(elapsedSeconds, 1.78));
    calculated = Number(calculated.toFixed(2));

    this.currentMultiplier = calculated;

    // Check manual override
    if (this.manualCrashOverride) {
      this.manualCrashOverride = false;
      this.crashGame();
      return;
    }

    // Process Auto-Cashouts for real users
    for (const [betId, bet] of this.activeBets.entries()) {
      if (bet.status === 'ACTIVE' && bet.auto_cashout_multiplier && !bet.is_bot) {
        if (this.currentMultiplier >= bet.auto_cashout_multiplier) {
          this.cashOutBet(betId, bet.user_id, bet.auto_cashout_multiplier, true);
        }
      }
    }

    // Process Bot cashouts
    const cashedBots = BotSimulator.processBotCashouts(this.currentMultiplier);
    for (const bot of cashedBots) {
      this.io.emit('bet_cashed_out', {
        betId: bot.id,
        username: bot.username,
        multiplier: bot.cashout_multiplier,
        payout: bot.payout,
        currency: bot.currency,
        is_bot: true
      });
    }

    // Check if target crash point is reached
    if (this.currentMultiplier >= this.targetCrashMultiplier) {
      this.crashGame();
      return;
    }

    // Emit live multiplier tick
    this.io.emit('multiplier_tick', {
      multiplier: this.currentMultiplier,
      elapsedMs: Date.now() - this.flightStartTime
    });
  }

  /**
   * Phase 3: Crash Event (Plane flies away / explodes)
   */
  crashGame() {
    clearInterval(this.loopInterval);
    this.state = GAME_STATES.CRASHED;
    const finalCrashMultiplier = Math.max(1.00, Math.min(this.currentMultiplier, this.targetCrashMultiplier));
    const crashedAt = new Date().toISOString();

    // Settle all remaining ACTIVE bets as LOST
    let totalWagered = 0;
    let totalPayout = 0;

    for (const [betId, bet] of this.activeBets.entries()) {
      if (bet.currency === 'PKR') {
        totalWagered += bet.amount;
      }

      if (bet.status === 'ACTIVE') {
        bet.status = 'LOST';
        bet.cashed_at = crashedAt;
        if (!bet.is_bot) {
          db.updateBet(bet.id, {
            status: 'LOST',
            cashed_at: crashedAt
          });
        }
      } else if (bet.status === 'WON') {
        if (bet.currency === 'PKR') {
          totalPayout += bet.payout;
        }
      }
    }

    // Update Round in Database
    db.updateGameRound(this.currentRound.id, {
      status: 'COMPLETED',
      crash_multiplier: finalCrashMultiplier,
      total_bets_count: this.activeBets.size,
      total_wagered_pkr: totalWagered,
      total_payout_pkr: totalPayout,
      crashed_at: crashedAt
    });

    console.log(`[GAME ENGINE] CRASHED at ${finalCrashMultiplier}x | Unhashed ServerSeed: ${this.currentRound.server_seed}`);

    // Broadcast Crash event with full revealed Provably Fair server seed
    this.io.emit('game_crashed', {
      roundId: this.currentRound.id,
      roundNumber: this.currentRound.round_number,
      crashMultiplier: finalCrashMultiplier,
      serverSeed: this.currentRound.server_seed,
      serverSeedHash: this.currentRound.server_seed_hash,
      clientSeed: this.currentRound.client_seed,
      nonce: this.currentRound.nonce,
      crashedAt: crashedAt
    });

    // Schedule next round after cooldown
    setTimeout(() => {
      this.startWaitingPhase();
    }, CRASH_COOLDOWN_MS);
  }

  /**
   * Real user places a bet
   */
  placeBet(user, betData) {
    if (this.state !== GAME_STATES.WAITING) {
      throw new Error('Bets can only be placed during the WAITING phase.');
    }

    const { betNumber = 1, currency = 'PKR', amount, autoCashoutMultiplier } = betData;
    const settings = db.getSettings();

    const min = currency === 'PKR' ? settings.minBetPKR : settings.minBetUSDT;
    const max = currency === 'PKR' ? settings.maxBetPKR : settings.maxBetUSDT;

    if (amount < min || amount > max) {
      throw new Error(`Bet amount must be between ${min} and ${max} ${currency}.`);
    }

    // Check user balance
    const currentBalance = currency === 'PKR' ? user.balance_pkr : user.balance_usdt;
    if (currentBalance < amount) {
      throw new Error(`Insufficient ${currency} balance. Please deposit funds.`);
    }

    // Deduct balance
    db.adjustBalance(user.id, -amount, currency);

    // Create bet record
    const bet = db.createBet({
      round_id: this.currentRound.id,
      user_id: user.id,
      username: user.name || user.username,
      bet_number: betNumber,
      currency: currency,
      amount: Number(amount),
      auto_cashout_multiplier: autoCashoutMultiplier ? Number(Number(autoCashoutMultiplier).toFixed(2)) : null,
      status: 'ACTIVE',
      is_bot: false
    });

    this.activeBets.set(bet.id, bet);

    // Notify all clients of new live bet
    this.io.emit('bet_placed', {
      id: bet.id,
      userId: user.id,
      username: user.name || user.username,
      betNumber: bet.bet_number,
      currency: bet.currency,
      amount: bet.amount,
      autoCashout: bet.auto_cashout_multiplier,
      status: 'ACTIVE',
      is_bot: false
    });

    return bet;
  }

  /**
   * Cash Out active bet
   */
  cashOutBet(betId, userId, customMultiplier = null, isAuto = false) {
    if (this.state !== GAME_STATES.FLYING) {
      throw new Error('Cannot cash out: round is not active.');
    }

    const bet = this.activeBets.get(betId);
    if (!bet) {
      throw new Error('Bet not found or already settled.');
    }

    if (bet.user_id !== userId && !bet.is_bot) {
      throw new Error('Unauthorized bet cash out.');
    }

    if (bet.status !== 'ACTIVE') {
      throw new Error('Bet has already been cashed out or settled.');
    }

    const multiplier = customMultiplier ? Number(Number(customMultiplier).toFixed(2)) : this.currentMultiplier;
    const rawPayout = bet.amount * multiplier;
    const payout = Number(rawPayout.toFixed(2));

    bet.status = 'WON';
    bet.cashout_multiplier = multiplier;
    bet.payout = payout;
    bet.cashed_at = new Date().toISOString();

    if (!bet.is_bot) {
      // Update database bet
      db.updateBet(bet.id, {
        status: 'WON',
        cashout_multiplier: multiplier,
        payout: payout,
        cashed_at: bet.cashed_at
      });

      // Credit winnings to user balance
      db.adjustBalance(userId, payout, bet.currency);
    }

    // Broadcast win
    this.io.emit('bet_cashed_out', {
      betId: bet.id,
      userId: bet.user_id,
      username: bet.username,
      multiplier: multiplier,
      payout: payout,
      currency: bet.currency,
      isAuto: isAuto,
      is_bot: bet.is_bot
    });

    return {
      betId: bet.id,
      multiplier,
      payout,
      currency: bet.currency
    };
  }

  /**
   * Background simulated chat loop for active player room feel
   */
  startChatSimulation() {
    setInterval(() => {
      // 30% chance every 12 seconds to post a message
      if (Math.random() < 0.35) {
        const chatMsg = BotSimulator.getRandomChatMessage();
        const saved = db.addChatMessage(chatMsg);
        this.io.emit('chat_message', saved);
      }
    }, 12000);
  }

  /**
   * Snapshot for newly connected clients
   */
  getInitialState() {
    return {
      state: this.state,
      currentMultiplier: this.currentMultiplier,
      currentRound: this.currentRound ? {
        id: this.currentRound.id,
        roundNumber: this.currentRound.round_number,
        serverSeedHash: this.currentRound.server_seed_hash,
        clientSeed: this.currentRound.client_seed,
        nonce: this.currentRound.nonce
      } : null,
      activeBets: Array.from(this.activeBets.values()),
      recentRounds: db.getRecentRounds(30),
      topWins: db.getTopWins(15),
      chatMessages: db.getRecentChatMessages(40),
      settings: db.getSettings()
    };
  }
}

module.exports = GameEngine;
