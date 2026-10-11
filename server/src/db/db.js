const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const ProvablyFair = require('../engine/ProvablyFair');
const { DEFAULT_SETTINGS } = require('../config/constants');

const DB_DIR = path.join(__dirname, '../../data');
const DB_FILE = path.join(DB_DIR, 'db.json');

class Database {
  constructor() {
    this.data = {
      users: [],
      game_rounds: [],
      bets: [],
      transactions: [],
      settings: { ...DEFAULT_SETTINGS },
      chat_messages: []
    };
    this.init();
  }

  init() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.migrateUserRoles();
        console.log('[DB] Successfully loaded persistent database.');
      } catch (err) {
        console.error('[DB] Error parsing existing db.json, creating new DB:', err);
        this.seedInitialData();
      }
    } else {
      this.seedInitialData();
    }
  }

  migrateUserRoles() {
    let changed = false;
    for (const user of this.data.users || []) {
      const normalizedRole = String(user.role || 'USER').toUpperCase();
      const role = ['USER', 'ADMIN', 'MODERATOR'].includes(normalizedRole)
        ? normalizedRole
        : 'USER';

      if (user.role !== role) {
        user.role = role;
        changed = true;
      }

      const email = String(user.email || '').toLowerCase();
      if (email === 'demo@aviator.local' && user.role === 'ADMIN') {
        user.role = 'USER';
        changed = true;
      }

      if (email === 'admin@aviator.local' && user.username === 'admin' && user.role === 'ADMIN') {
        user.role = 'USER';
        changed = true;
      }
    }

    if (changed) {
      this.save();
      console.log('[DB] Migrated user roles and disabled the legacy demo admin account.');
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Error saving db.json:', err);
    }
  }

  seedInitialData() {
    console.log('[DB] Seeding initial game database...');
    const salt = bcrypt.genSaltSync(10);

    // Demo User
    const demoUser = {
      id: uuidv4(),
      username: 'LuckyAviator',
      email: 'demo@aviator.local',
      password_hash: bcrypt.hashSync('demo123', salt),
      role: 'USER',
      balance_pkr: 50000.00,
      balance_usdt: 500.00,
      is_frozen: false,
      kyc_status: 'verified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.data.users = [demoUser];

    // 3. Generate 25 Realistic Previous Game Rounds with Provably Fair hashes
    this.data.game_rounds = [];
    let roundNum = 1001;
    const now = Date.now();

    for (let i = 25; i >= 1; i--) {
      const serverSeed = ProvablyFair.generateServerSeed();
      const serverSeedHash = ProvablyFair.hashServerSeed(serverSeed);
      const clientSeed = ProvablyFair.generateClientSeed();
      const nonce = roundNum;
      const { multiplier } = ProvablyFair.calculateCrashMultiplier(
        serverSeed,
        clientSeed,
        nonce,
        DEFAULT_SETTINGS.houseEdge
      );

      const roundTime = new Date(now - i * 18000).toISOString();
      this.data.game_rounds.push({
        id: uuidv4(),
        round_number: roundNum++,
        server_seed: serverSeed,
        server_seed_hash: serverSeedHash,
        client_seed: clientSeed,
        nonce: nonce,
        crash_multiplier: multiplier,
        status: 'COMPLETED',
        total_bets_count: Math.floor(Math.random() * 18) + 5,
        total_wagered_pkr: Math.floor(Math.random() * 85000) + 12000,
        total_payout_pkr: Math.floor(Math.random() * 65000) + 8000,
        created_at: roundTime,
        crashed_at: roundTime
      });
    }

    // 4. Initial Sample Transactions for Demo
    this.data.transactions = [
      {
        id: uuidv4(),
        user_id: demoUser.id,
        type: 'DEPOSIT',
        gateway: 'EASYPAISA',
        currency: 'PKR',
        amount: 25000.00,
        status: 'APPROVED',
        account_number: '03001234567',
        account_title: 'Lucky Aviator',
        tx_hash: 'EP-98762145',
        proof_image_url: null,
        admin_notes: 'Instant EasyPaisa Auto Deposit',
        created_at: new Date(now - 3600000).toISOString(),
        updated_at: new Date(now - 3590000).toISOString()
      },
      {
        id: uuidv4(),
        user_id: demoUser.id,
        type: 'DEPOSIT',
        gateway: 'CRYPTO_USDT',
        currency: 'USDT',
        amount: 250.00,
        status: 'APPROVED',
        account_number: 'TYasdf897asdfh213jh123123TRON',
        account_title: 'USDT TRC20',
        tx_hash: '0x8f72a91b8923485cba124890',
        proof_image_url: null,
        admin_notes: 'Blockchain confirmed 19 confirmations',
        created_at: new Date(now - 7200000).toISOString(),
        updated_at: new Date(now - 7190000).toISOString()
      },
      {
        id: uuidv4(),
        user_id: demoUser.id,
        type: 'DEPOSIT',
        gateway: 'BANK_TRANSFER',
        currency: 'PKR',
        amount: 50000.00,
        status: 'PENDING',
        account_number: 'PK36MEZN00123456789012',
        account_title: 'Lucky Aviator - Meezan Bank',
        tx_hash: 'IBFT-55421098',
        proof_image_url: '/uploads/sample_receipt.jpg',
        admin_notes: 'Pending Admin Verification of IBFT Slip',
        created_at: new Date(now - 900000).toISOString(),
        updated_at: new Date(now - 900000).toISOString()
      },
      {
        id: uuidv4(),
        user_id: demoUser.id,
        type: 'WITHDRAW',
        gateway: 'JAZZCASH',
        currency: 'PKR',
        amount: 15000.00,
        status: 'PENDING',
        account_number: '03009876543',
        account_title: 'Lucky Aviator',
        tx_hash: null,
        proof_image_url: null,
        admin_notes: 'Awaiting operator release',
        created_at: new Date(now - 600000).toISOString(),
        updated_at: new Date(now - 600000).toISOString()
      }
    ];

    // 5. Initial Sample Chat Messages
    this.data.chat_messages = [
      {
        id: uuidv4(),
        user_id: 'system',
        username: 'Aviator System',
        is_admin: true,
        message: 'Welcome to Aviator! 🚀 Place your bets before the plane takes off.',
        emoji: '🚀',
        created_at: new Date(now - 120000).toISOString()
      },
      {
        id: uuidv4(),
        user_id: demoUser.id,
        username: 'LuckyAviator',
        is_admin: false,
        message: 'Let\'s go for 10x today! 🔥',
        emoji: '🔥',
        created_at: new Date(now - 60000).toISOString()
      }
    ];

    this.save();
    console.log('[DB] Seeding completed.');
  }

  // --- Users Methods ---
  findUserById(id) {
    return this.data.users.find(u => u.id === id);
  }

  findUserByEmail(email) {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  findUserByUsername(username) {
    return this.data.users.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  createUser(userData) {
    const newUser = {
      id: uuidv4(),
      balance_pkr: 0.00,
      balance_usdt: 0.00,
      role: 'USER',
      is_frozen: false,
      kyc_status: 'unverified',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...userData
    };
    this.data.users.push(newUser);
    this.save();
    return newUser;
  }

  updateUser(id, updates) {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return null;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.users[index];
  }

  adjustBalance(userId, amount, currency = 'PKR') {
    const user = this.findUserById(userId);
    if (!user) return null;
    
    if (currency === 'PKR') {
      user.balance_pkr = Number((Number(user.balance_pkr || 0) + Number(amount)).toFixed(2));
      if (user.balance_pkr < 0) user.balance_pkr = 0;
    } else {
      user.balance_usdt = Number((Number(user.balance_usdt || 0) + Number(amount)).toFixed(4));
      if (user.balance_usdt < 0) user.balance_usdt = 0;
    }
    user.updated_at = new Date().toISOString();
    this.save();
    return user;
  }

  getAllUsers() {
    return this.data.users.map(({ password_hash, ...rest }) => rest);
  }

  // --- Game Rounds Methods ---
  createGameRound(roundData) {
    const nextRoundNumber = this.data.game_rounds.length > 0
      ? Math.max(...this.data.game_rounds.map(r => r.round_number || 0)) + 1
      : 1001;

    const round = {
      id: uuidv4(),
      round_number: nextRoundNumber,
      total_bets_count: 0,
      total_wagered_pkr: 0,
      total_payout_pkr: 0,
      status: 'WAITING',
      created_at: new Date().toISOString(),
      ...roundData
    };
    this.data.game_rounds.push(round);
    this.save();
    return round;
  }

  updateGameRound(id, updates) {
    const index = this.data.game_rounds.findIndex(r => r.id === id);
    if (index === -1) return null;
    this.data.game_rounds[index] = {
      ...this.data.game_rounds[index],
      ...updates
    };
    this.save();
    return this.data.game_rounds[index];
  }

  getRecentRounds(limit = 40) {
    return [...this.data.game_rounds]
      .filter(r => r.status === 'COMPLETED')
      .sort((a, b) => b.round_number - a.round_number)
      .slice(0, limit);
  }

  findRoundById(id) {
    return this.data.game_rounds.find(r => r.id === id);
  }

  // --- Bets Methods ---
  createBet(betData) {
    const bet = {
      id: uuidv4(),
      status: 'ACTIVE',
      payout: 0.00,
      created_at: new Date().toISOString(),
      ...betData
    };
    this.data.bets.push(bet);
    this.save();
    return bet;
  }

  updateBet(id, updates) {
    const index = this.data.bets.findIndex(b => b.id === id);
    if (index === -1) return null;
    this.data.bets[index] = {
      ...this.data.bets[index],
      ...updates
    };
    this.save();
    return this.data.bets[index];
  }

  getBetsForRound(roundId) {
    return this.data.bets.filter(b => b.round_id === roundId);
  }

  getUserBets(userId, limit = 50) {
    return this.data.bets
      .filter(b => b.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

  getTopWins(limit = 30) {
    return this.data.bets
      .filter(b => b.status === 'WON')
      .sort((a, b) => b.payout - a.payout)
      .slice(0, limit);
  }

  // --- Transactions Methods ---
  createTransaction(txData) {
    const tx = {
      id: uuidv4(),
      status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...txData
    };
    this.data.transactions.push(tx);
    this.save();
    return tx;
  }

  updateTransaction(id, updates) {
    const index = this.data.transactions.findIndex(t => t.id === id);
    if (index === -1) return null;
    this.data.transactions[index] = {
      ...this.data.transactions[index],
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.save();
    return this.data.transactions[index];
  }

  getUserTransactions(userId) {
    return this.data.transactions
      .filter(t => t.user_id === userId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  }

  getAllTransactions(limit = 100) {
    return [...this.data.transactions]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);
  }

  findTransactionById(id) {
    return this.data.transactions.find(t => t.id === id);
  }

  // --- Settings Methods ---
  getSettings() {
    return this.data.settings || { ...DEFAULT_SETTINGS };
  }

  updateSettings(newSettings) {
    this.data.settings = {
      ...this.data.settings,
      ...newSettings
    };
    this.save();
    return this.data.settings;
  }

  // --- Chat Methods ---
  addChatMessage(msgData) {
    const msg = {
      id: uuidv4(),
      created_at: new Date().toISOString(),
      ...msgData
    };
    this.data.chat_messages.push(msg);
    // Keep last 150 messages in memory/db
    if (this.data.chat_messages.length > 150) {
      this.data.chat_messages = this.data.chat_messages.slice(-150);
    }
    this.save();
    return msg;
  }

  getRecentChatMessages(limit = 50) {
    return this.data.chat_messages.slice(-limit);
  }

  // --- Analytics & Financials ---
  getAnalytics() {
    const totalUsers = this.data.users.length;
    const completedRounds = this.data.game_rounds.filter(r => r.status === 'COMPLETED').length;
    
    // Financials
    const approvedDeposits = this.data.transactions
      .filter(t => t.type === 'DEPOSIT' && t.status === 'APPROVED')
      .reduce((acc, t) => acc + (t.currency === 'PKR' ? t.amount : t.amount * 278), 0);

    const approvedWithdrawals = this.data.transactions
      .filter(t => t.type === 'WITHDRAW' && t.status === 'APPROVED')
      .reduce((acc, t) => acc + (t.currency === 'PKR' ? t.amount : t.amount * 278), 0);

    const totalWagered = this.data.bets
      .reduce((acc, b) => acc + (b.currency === 'PKR' ? b.amount : b.amount * 278), 0);

    const totalPayouts = this.data.bets
      .filter(b => b.status === 'WON')
      .reduce((acc, b) => acc + (b.currency === 'PKR' ? b.payout : b.payout * 278), 0);

    const ggr = totalWagered - totalPayouts; // Gross Gaming Revenue
    const ngr = ggr * 0.85; // Net Gaming Revenue (after operational margin)

    return {
      totalUsers,
      completedRounds,
      totalWageredPKR: Math.round(totalWagered),
      totalPayoutsPKR: Math.round(totalPayouts),
      ggrPKR: Math.round(ggr),
      ngrPKR: Math.round(ngr),
      approvedDepositsPKR: Math.round(approvedDeposits),
      approvedWithdrawalsPKR: Math.round(approvedWithdrawals),
      pendingDepositsCount: this.data.transactions.filter(t => t.type === 'DEPOSIT' && t.status === 'PENDING').length,
      pendingWithdrawalsCount: this.data.transactions.filter(t => t.type === 'WITHDRAW' && t.status === 'PENDING').length,
    };
  }
}

const db = new Database();
module.exports = db;
