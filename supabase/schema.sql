create extension if not exists pgcrypto;

create table if not exists wallets (
  id uuid primary key default gen_random_uuid(),
  address text unique not null,
  chain text default 'solana',
  label text,
  notes text,
  status text default 'CANDIDATE',
  source text,
  roi_24h numeric default 0,
  roi_7d numeric default 0,
  realized_pnl_24h numeric default 0,
  realized_pnl_7d numeric default 0,
  winrate_24h numeric default 0,
  winrate_7d numeric default 0,
  trade_count_24h int default 0,
  trade_count_7d int default 0,
  avg_hold_minutes numeric default 0,
  copy_score numeric default 0,
  risk_score numeric default 50,
  consistency_score numeric default 0,
  exit_speed_score numeric default 0,
  last_seen_at timestamptz,
  raw_payload jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists wallets_status_idx on wallets(status);
create index if not exists wallets_copy_score_idx on wallets(copy_score desc);
create index if not exists wallets_risk_score_idx on wallets(risk_score asc);

create table if not exists live_activities (
  id uuid primary key default gen_random_uuid(),
  wallet_address text,
  token_address text,
  token_symbol text,
  action text,
  amount numeric default 0,
  amount_usd numeric default 0,
  tx_hash text,
  description text,
  source text default 'helius',
  raw_summary text,
  raw_payload jsonb,
  created_at timestamptz default now()
);

create index if not exists live_activities_created_at_idx on live_activities(created_at desc);
create index if not exists live_activities_wallet_idx on live_activities(wallet_address);
create index if not exists live_activities_token_idx on live_activities(token_address);
create index if not exists live_activities_action_idx on live_activities(action);

create table if not exists agent_logs (
  id uuid primary key default gen_random_uuid(),
  agent_name text,
  action text,
  input_summary text,
  output_summary text,
  level text default 'info',
  raw_payload jsonb,
  created_at timestamptz default now()
);

create table if not exists settings (
  key text primary key,
  value jsonb,
  updated_at timestamptz default now()
);
