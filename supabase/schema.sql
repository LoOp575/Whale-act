-- ============================================================
-- WhaleCopy AI — Supabase Database Schema
-- Paper trading only. No live trading. No auth (yet).
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. WALLETS
-- Tracked whale wallets on Solana
-- ============================================================
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address TEXT UNIQUE NOT NULL,
  label TEXT,
  chain TEXT NOT NULL DEFAULT 'solana',
  roi_24h NUMERIC DEFAULT 0,
  realized_pnl_24h NUMERIC DEFAULT 0,
  winrate_24h NUMERIC DEFAULT 0,
  winrate_7d NUMERIC DEFAULT 0,
  avg_hold_minutes NUMERIC DEFAULT 0,
  copy_score NUMERIC DEFAULT 0,
  risk_score NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  tag TEXT DEFAULT 'neutral',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 2. WALLET_TRADES
-- Individual transactions from tracked wallets
-- ============================================================
CREATE TABLE wallet_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT,
  side TEXT NOT NULL CHECK (side IN ('buy', 'sell', 'swap')),
  amount_usd NUMERIC NOT NULL DEFAULT 0,
  price_usd NUMERIC DEFAULT 0,
  tx_hash TEXT,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. TOKENS
-- Token market data (cached from DexScreener)
-- ============================================================
CREATE TABLE tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_address TEXT UNIQUE NOT NULL,
  symbol TEXT NOT NULL,
  name TEXT,
  price_usd NUMERIC DEFAULT 0,
  liquidity_usd NUMERIC DEFAULT 0,
  volume_5m NUMERIC DEFAULT 0,
  volume_1h NUMERIC DEFAULT 0,
  txns_5m INTEGER DEFAULT 0,
  buy_count INTEGER DEFAULT 0,
  sell_count INTEGER DEFAULT 0,
  price_change_5m NUMERIC DEFAULT 0,
  price_change_1h NUMERIC DEFAULT 0,
  price_change_24h NUMERIC DEFAULT 0,
  risk_score NUMERIC DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. SIGNALS
-- AI-generated trading signals
-- ============================================================
CREATE TABLE signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  signal_type TEXT NOT NULL CHECK (signal_type IN ('BUY', 'WAIT', 'REJECT', 'EXIT', 'WARNING')),
  wallet_address TEXT NOT NULL,
  token_address TEXT NOT NULL,
  token_symbol TEXT,
  confidence NUMERIC NOT NULL DEFAULT 0,
  reason TEXT,
  risk_note TEXT,
  suggested_action TEXT,
  price_at_signal NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 5. PAPER_TRADES
-- Virtual paper trading positions (no real funds)
-- ============================================================
CREATE TABLE paper_trades (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token_address TEXT NOT NULL,
  token_symbol TEXT,
  copied_wallet TEXT,
  entry_price NUMERIC NOT NULL,
  exit_price NUMERIC,
  size_usd NUMERIC NOT NULL DEFAULT 10,
  pnl_percent NUMERIC DEFAULT 0,
  pnl_usd NUMERIC DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'OPEN' CHECK (status IN ('OPEN', 'CLOSED')),
  entry_reason TEXT,
  exit_reason TEXT,
  opened_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- ============================================================
-- 6. AGENT_LOGS
-- Logs from AI agents and automated processes
-- ============================================================
CREATE TABLE agent_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_name TEXT NOT NULL,
  action TEXT NOT NULL,
  input_summary TEXT,
  output_summary TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 7. SETTINGS
-- Key-value config for app settings
-- ============================================================
CREATE TABLE settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  description TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Wallets
CREATE INDEX idx_wallets_address ON wallets(address);
CREATE INDEX idx_wallets_status ON wallets(status);
CREATE INDEX idx_wallets_copy_score ON wallets(copy_score DESC);

-- Wallet Trades
CREATE INDEX idx_wallet_trades_wallet_address ON wallet_trades(wallet_address);
CREATE INDEX idx_wallet_trades_token_address ON wallet_trades(token_address);
CREATE INDEX idx_wallet_trades_timestamp ON wallet_trades(timestamp DESC);

-- Tokens
CREATE INDEX idx_tokens_token_address ON tokens(token_address);
CREATE INDEX idx_tokens_symbol ON tokens(symbol);

-- Signals
CREATE INDEX idx_signals_created_at ON signals(created_at DESC);
CREATE INDEX idx_signals_signal_type ON signals(signal_type);
CREATE INDEX idx_signals_wallet_address ON signals(wallet_address);
CREATE INDEX idx_signals_token_address ON signals(token_address);

-- Paper Trades
CREATE INDEX idx_paper_trades_status ON paper_trades(status);
CREATE INDEX idx_paper_trades_opened_at ON paper_trades(opened_at DESC);
CREATE INDEX idx_paper_trades_token_address ON paper_trades(token_address);

-- Agent Logs
CREATE INDEX idx_agent_logs_agent_name ON agent_logs(agent_name);
CREATE INDEX idx_agent_logs_created_at ON agent_logs(created_at DESC);

-- Settings
CREATE INDEX idx_settings_key ON settings(key);

-- ============================================================
-- DEFAULT SETTINGS (paper trading config)
-- ============================================================
INSERT INTO settings (key, value, description) VALUES
  ('paper_trading_enabled', 'true', 'Paper trading mode (always true in this version)'),
  ('max_trade_size_usd', '10', 'Maximum paper trade size in USD'),
  ('max_daily_loss_usd', '20', 'Maximum daily loss before auto-stop'),
  ('min_wallet_score', '75', 'Minimum copy score to auto-copy'),
  ('min_liquidity_usd', '20000', 'Minimum token liquidity to trade'),
  ('stop_loss_percent', '-6', 'Auto-close at this loss percentage'),
  ('take_profit_1_percent', '8', 'First take profit target'),
  ('take_profit_2_percent', '15', 'Second take profit target (full exit)');

-- ============================================================
-- NOTES:
-- - No auth tables (will add later with Supabase Auth)
-- - No live trading tables (paper only)
-- - No private key storage (never needed)
-- - Run this in Supabase SQL Editor to create all tables
-- ============================================================
