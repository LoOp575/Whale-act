import { NextResponse } from "next/server";
import { getDbEnvStatus } from "@/lib/db/server";

export async function GET() {
  const db = getDbEnvStatus();

  return NextResponse.json({
    success: true,
    source: "env",
    app: {
      env: process.env.APP_ENV || "unknown",
      publicUrlConfigured: Boolean(process.env.NEXT_PUBLIC_APP_URL),
    },
    database: db,
    integrations: {
      heliusConfigured: Boolean(process.env.HELIUS_API_KEY && process.env.HELIUS_WEBHOOK_SECRET),
      dexscreenerConfigured: Boolean(process.env.DEXSCREENER_BASE_URL),
      aiConfigured: Boolean(process.env.OPENAI_API_KEY && process.env.OPENAI_BASE_URL && process.env.OPENAI_MODEL),
    },
    safety: {
      paperTrading: process.env.PAPER_TRADING === "true",
      liveTradingEnabled: process.env.LIVE_TRADING_ENABLED === "true",
      tradingMode: process.env.TRADING_MODE || "PAPER_ONLY",
    },
  });
}
