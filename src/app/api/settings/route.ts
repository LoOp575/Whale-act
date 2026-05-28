import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function boolEnv(name: string, fallback = false): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  return value === "true";
}

function numberEnv(name: string, fallback = 0): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

function runtimeSettings() {
  return {
    appEnv: process.env.APP_ENV || "production",
    paperTrading: boolEnv("PAPER_TRADING", true),
    liveTradingEnabled: boolEnv("LIVE_TRADING_ENABLED", false),
    tradingMode: process.env.TRADING_MODE || "PAPER_ONLY",
    maxPaperTradeUsd: numberEnv("MAX_PAPER_TRADE_USD", 10),
    maxDailyLossUsd: numberEnv("MAX_DAILY_LOSS_USD", 20),
    maxOpenPositions: numberEnv("MAX_OPEN_POSITIONS", 2),
    minWalletScore: numberEnv("MIN_WALLET_SCORE", 75),
    minLiquidityUsd: numberEnv("MIN_LIQUIDITY_USD", 20000),
    stopLossPercent: numberEnv("STOP_LOSS_PERCENT", -6),
    takeProfit1Percent: numberEnv("TAKE_PROFIT_1_PERCENT", 8),
    takeProfit2Percent: numberEnv("TAKE_PROFIT_2_PERCENT", 15),
    trailingStopEnabled: boolEnv("TRAILING_STOP_ENABLED", true),
    emergencyStop: boolEnv("EMERGENCY_STOP", false),
    allowLiveSwap: boolEnv("ALLOW_LIVE_SWAP", false),
    allowRealBuy: boolEnv("ALLOW_REAL_BUY", false),
    allowRealSell: boolEnv("ALLOW_REAL_SELL", false),
  };
}

export async function GET() {
  try {
    const supabase = getSupabaseAdmin();
    const settings = runtimeSettings();

    if (!supabase) {
      return NextResponse.json({ success: true, data: settings, source: "env" });
    }

    const { data, error } = await supabase.from("settings").select("key,value");

    if (error) {
      return NextResponse.json({ success: true, data: settings, source: "env", warning: error.message });
    }

    const dbSettings = Object.fromEntries((data || []).map((row: any) => [row.key, row.value]));

    return NextResponse.json({
      success: true,
      data: { ...settings, ...dbSettings },
      source: "supabase",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: runtimeSettings(), source: "settings-error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json({ success: false, error: "Missing or invalid key" }, { status: 400 });
    }

    const blockedKeys = ["private_key", "secret_key", "wallet_key", "seed_phrase", "mnemonic"];
    if (blockedKeys.some((blocked) => key.toLowerCase().includes(blocked))) {
      return NextResponse.json({ success: false, error: "This setting is not allowed" }, { status: 403 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ success: false, error: "Supabase is not configured" }, { status: 503 });
    }

    const { data, error } = await supabase
      .from("settings")
      .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" })
      .select("key,value")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data, source: "supabase" });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to update setting", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
