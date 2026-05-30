# WhaleCopy AI / Whale Profit Agent

Real whale-wallet tracking dashboard for Solana. This repo is no longer dummy-only: it now has Supabase storage, wallet discovery, a whale profit agent, live activity ingestion, DexScreener market checks, and AI buy/watch/skip signal generation.

## What it does

- Discovers active Solana wallets from live pair/token flow.
- Stores discovered and manually added wallets in Supabase.
- Filters profitable wallets with configurable rules, default minimum 70% 7D winrate when profit metrics exist.
- Pulls recent wallet and pair transactions through Helius when `HELIUS_API_KEY` is configured.
- Reuses existing `live_activities` rows when Helius is not available.
- Checks token market data through DexScreener.
- Generates `BUY`, `STRONG_BUY`, `WATCH`, `SKIP`, or `SELL` signals.
- Saves signals, token snapshots, activities, and agent logs in Supabase.
- Dashboard and AI Signals page read real API/Supabase data. No dummy fallback.

## Tech Stack

- Next.js 14 App Router
- TypeScript
- Tailwind CSS
- Supabase
- Helius API for Solana wallet transactions
- DexScreener public API for token market data
- Optional OpenAI-compatible AI reasoning summary

## Required Environment Variables

Set these in Vercel Project Settings → Environment Variables.

```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

HELIUS_API_KEY=your_helius_key

# OpenAI-compatible AI provider. Use this for OpenAI, Aichixia, or another compatible API.
AI_API_KEY=your_ai_api_key
AI_API_BASE_URL=https://www.aichixia.xyz/api/v1
AI_MODEL=your_model_name

AGENT_SECRET=choose_a_secret_for_manual_agent_calls
CRON_SECRET=same_or_other_secret_for_vercel_cron

AGENT_MIN_WINRATE=70
AGENT_MIN_TRADES_7D=3
AGENT_MIN_COPY_SCORE=65
```

Optional discovery watchlist if you want to force the agent to scan specific Solana tokens:

```bash
DISCOVERY_TOKEN_ADDRESSES=token_address_1,token_address_2,token_address_3
```

Optional fallback wallet input if Supabase has no wallets yet:

```bash
WHALE_WALLETS=walletAddress|Label|winrate7d|roi7d|realizedPnl7d|copyScore|riskScore
```

Example:

```bash
WHALE_WALLETS=7abc...xyz|Whale Alpha|82|14|5200|88|35
```

## Supabase Setup

Run the SQL in `supabase/schema.sql` inside the Supabase SQL editor.

Tables used:

- `wallets`
- `live_activities`
- `token_snapshots`
- `signals`
- `agent_logs`
- `settings`

## Add a Real Wallet

Use the app API or insert directly into Supabase.

```bash
curl -X POST https://your-domain.vercel.app/api/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "address":"REAL_SOLANA_WALLET",
    "label":"Whale Alpha",
    "status":"APPROVED",
    "winrate7d":82,
    "realizedPnl7d":5200,
    "tradeCount7d":18,
    "copyScore":88,
    "riskScore":35
  }'
```

The agent will prioritize wallets with at least 70% winrate and positive realized PnL.

## Run Full Agent Manually

Full run means discovery first, then signal generation.

```bash
curl -X POST https://your-domain.vercel.app/api/agent/full-run \
  -H "Content-Type: application/json" \
  -H "x-agent-secret: YOUR_AGENT_SECRET" \
  -d '{"limitPairs":8,"limitWallets":30,"txLimit":20}'
```

Dry run without saving wallets/signals:

```bash
curl "https://your-domain.vercel.app/api/agent/full-run?dryRun=true&limitPairs=8&limitWallets=30&txLimit=20" \
  -H "x-agent-secret: YOUR_AGENT_SECRET"
```

## Auto Run

`vercel.json` runs `/api/agent/full-run?limitPairs=8&limitWallets=30&txLimit=20` every 10 minutes using Vercel Cron. If `CRON_SECRET` is set, Vercel sends authorization automatically.

## Run Locally

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## Deployment Trigger

Last redeploy trigger: 2026-05-30.

## Important Notes

This is an analysis and signal dashboard, not guaranteed profit and not financial advice. It does not execute live trades. It produces decision support from whale flow, wallet quality, liquidity, volume, and risk checks.
