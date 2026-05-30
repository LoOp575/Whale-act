import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/lib/db/server";

type SignalRow = {
  id: string;
  signal_type: string;
  wallet_address: string | null;
  token_address: string | null;
  token_symbol: string | null;
  confidence: number | string | null;
  reason: string | null;
  risk_note: string | null;
  suggested_action: string | null;
  entry_plan: string | null;
  exit_plan: string | null;
  invalid_if: string | null;
  time_horizon: string | null;
  position_size_usd: number | string | null;
  price_change_24h: number | string | null;
  volume_24h: number | string | null;
  liquidity_usd: number | string | null;
  status: string | null;
  source: string | null;
  created_at: string | null;
};

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapSignal(row: SignalRow) {
  return {
    id: row.id,
    type: row.signal_type,
    token: row.token_symbol || row.token_address || "UNKNOWN",
    tokenAddress: row.token_address || "",
    walletAddress: row.wallet_address || "",
    confidence: num(row.confidence),
    reason: row.reason || "",
    riskNote: row.risk_note || "",
    suggestedAction: row.suggested_action || "",
    entryPlan: row.entry_plan || "",
    exitPlan: row.exit_plan || "",
    invalidIf: row.invalid_if || "",
    timeHorizon: row.time_horizon || "",
    positionSizeUsd: num(row.position_size_usd),
    priceChange24h: num(row.price_change_24h),
    volume24h: num(row.volume_24h),
    liquidityUsd: num(row.liquidity_usd),
    status: row.status || "NEW",
    source: row.source || "supabase",
    timestamp: row.created_at || "",
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getServerDb();
    if (!db) {
      return NextResponse.json({ success: false, data: [], count: 0, source: "env-error", error: "Database environment is not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

    let query = db.from("signals").select("*").order("created_at", { ascending: false }).limit(limit);
    if (type && type !== "all") query = query.eq("signal_type", type);

    const { data, error } = await query;
    if (error) throw error;

    const signals = ((data || []) as SignalRow[]).map(mapSignal);
    return NextResponse.json({ success: true, data: signals, count: signals.length, source: "supabase" });
  } catch (error) {
    return NextResponse.json({ success: false, data: [], count: 0, source: "supabase-error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
