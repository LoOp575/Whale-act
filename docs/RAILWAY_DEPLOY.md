# Railway Deploy Guide — WhaleCopy AI

This project is configured for Railway with `railway.json` and the `start:railway` script.

## 1. Create Railway Project

1. Open Railway.
2. New Project.
3. Deploy from GitHub repo.
4. Select `LoOp575/Whale-act`.
5. Branch: `main`.

## 2. Required Variables

Add these variables in Railway → Project → Service → Variables.

```env
NEXT_PUBLIC_APP_URL=https://YOUR-RAILWAY-DOMAIN.up.railway.app
APP_ENV=production
PAPER_TRADING=true
LIVE_TRADING_ENABLED=false
TRADING_MODE=PAPER_ONLY

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SERVICE_ROLE_KEY=

HELIUS_API_KEY=
HELIUS_WEBHOOK_SECRET=wcai_9f7xK2mQp8sL2026

DEXSCREENER_BASE_URL=https://api.dexscreener.com

AI_PROVIDER=openai-compatible
OPENAI_API_KEY=
OPENAI_BASE_URL=https://www.aichixia.xyz/api/v1
OPENAI_MODEL=gpt-5-mini
OPENAI_TEMPERATURE=0.2
OPENAI_MAX_TOKENS=800

CHAIN_ID=solana
SCAN_INTERVAL_SECONDS=20
MIN_LIQUIDITY_USD=20000
MIN_WALLET_SCORE=75
MAX_PRICE_PUMP_5M=40
MAX_SLIPPAGE_BPS=150

MIN_ROI_24H=50
MIN_WINRATE_7D=55
MIN_TRADE_COUNT_24H=3
MAX_RISK_SCORE=60

MAX_PAPER_TRADE_USD=10
MAX_DAILY_LOSS_USD=20
MAX_OPEN_POSITIONS=2
STOP_LOSS_PERCENT=-6
TAKE_PROFIT_1_PERCENT=8
TAKE_PROFIT_2_PERCENT=15
TRAILING_STOP_ENABLED=true
TRAILING_STOP_TRIGGER_PERCENT=12
TRAILING_STOP_DROP_PERCENT=5

AUTO_TRADE_REQUIRES_CONFIRMATION=true
EMERGENCY_STOP=false
ALLOW_PRIVATE_KEY_INPUT=false
ALLOW_LIVE_SWAP=false
ALLOW_REAL_BUY=false
ALLOW_REAL_SELL=false

ENABLE_DEV_SIMULATOR=false
ENABLE_MOCK_FALLBACK=false
LOG_AGENT_DEBUG=true
```

## 3. Generate Domain

Railway → Service → Settings → Networking → Generate Domain.

After getting the domain, update:

```env
NEXT_PUBLIC_APP_URL=https://YOUR-RAILWAY-DOMAIN.up.railway.app
```

Then redeploy.

## 4. Update Helius Webhook URL

Use the Railway domain:

```txt
https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/webhooks/helius?secret=wcai_9f7xK2mQp8sL2026
```

## 5. Test Endpoints

```txt
https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/system/status
https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/system/supabase-test
https://YOUR-RAILWAY-DOMAIN.up.railway.app/api/webhooks/helius?secret=wcai_9f7xK2mQp8sL2026
```

## Notes

- Do not commit `.env.local`.
- Do not add private wallet keys.
- Live trading is disabled.
- Use Railway variables for all real secrets.
