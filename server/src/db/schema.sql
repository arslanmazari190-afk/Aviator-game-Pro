-- ==============================================================================
-- Aviator Crash Game - PostgreSQL Production Database Schema
-- Multi-currency, Transactional Ledger, Provably Fair Audit Trail
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    balance_pkr NUMERIC(14, 2) DEFAULT 0.00 CHECK (balance_pkr >= 0),
    balance_usdt NUMERIC(14, 4) DEFAULT 0.0000 CHECK (balance_usdt >= 0),
    is_frozen BOOLEAN DEFAULT FALSE,
    kyc_status VARCHAR(20) DEFAULT 'unverified' CHECK (kyc_status IN ('unverified', 'pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 2. Game Rounds (Provably Fair Ledger)
CREATE TABLE IF NOT EXISTS game_rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_number BIGSERIAL UNIQUE,
    server_seed VARCHAR(64) NOT NULL,
    server_seed_hash VARCHAR(64) NOT NULL,
    client_seed VARCHAR(64) NOT NULL,
    nonce BIGINT NOT NULL,
    crash_multiplier NUMERIC(8, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED' CHECK (status IN ('WAITING', 'FLYING', 'COMPLETED', 'CANCELLED')),
    total_bets_count INT DEFAULT 0,
    total_wagered_pkr NUMERIC(14, 2) DEFAULT 0.00,
    total_payout_pkr NUMERIC(14, 2) DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    crashed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_game_rounds_round_number ON game_rounds(round_number DESC);

-- 3. Bets Table
CREATE TABLE IF NOT EXISTS bets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    round_id UUID REFERENCES game_rounds(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(50) NOT NULL,
    bet_number SMALLINT DEFAULT 1 CHECK (bet_number IN (1, 2)),
    currency VARCHAR(10) DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USDT')),
    amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
    auto_cashout_multiplier NUMERIC(8, 2) DEFAULT NULL,
    cashout_multiplier NUMERIC(8, 2) DEFAULT NULL,
    payout NUMERIC(14, 2) DEFAULT 0.00,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'WON', 'LOST', 'CANCELLED')),
    is_bot BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    cashed_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX IF NOT EXISTS idx_bets_round_id ON bets(round_id);
CREATE INDEX IF NOT EXISTS idx_bets_user_id ON bets(user_id);
CREATE INDEX IF NOT EXISTS idx_bets_status ON bets(status);

-- 4. Transactions Ledger (Deposits, Withdrawals, Winnings)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('DEPOSIT', 'WITHDRAW', 'BET_WIN', 'BET_LOSS', 'ADMIN_ADJUSTMENT')),
    gateway VARCHAR(30) CHECK (gateway IN ('EASYPAISA', 'JAZZCASH', 'BANK_TRANSFER', 'CRYPTO_USDT', 'INTERNAL')),
    currency VARCHAR(10) DEFAULT 'PKR' CHECK (currency IN ('PKR', 'USDT')),
    amount NUMERIC(14, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PROCESSING')),
    account_number VARCHAR(100),
    account_title VARCHAR(100),
    tx_hash VARCHAR(120),
    proof_image_url TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);

-- 5. System Settings & House Margin
CREATE TABLE IF NOT EXISTS system_settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Live Chat Messages
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    username VARCHAR(50) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    message TEXT NOT NULL,
    emoji VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
