import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/lib/db/server";

type WalletRow = {
  id: string;
  address: string;
  chain: string | null;
  label: string | null;
  notes: string | null;
  status: string | null;
  source: string | null;
  roi_24h: number | string | null;
  roi_7d: number | string | null;
  realized_pnl_24h: number | string | null;
  realized_pnl_7d: number | string | null;
  winrate_24h: number | string | null;
  winrate_7d: number | string | null;
  trade_count_24h: number | null;
  trade_count_7d: number | null;
  avg_hold_minutes: number | string | null;
  copy_score: number | string | null;
  risk_score: number | string | null;
  consistency_score: number | string | null;
  exit_speed_score: number | string | null;
  last_seen_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function optionalNum(value: unknown) {
  if (value === undefined || value === null || value === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function mapWallet(row: WalletRow) {
  return {
    id: row.id,
    address: row.address,
    chain: row.chain || "solana",
    label: row.label || row.address,
    notes: row.notes || "",
    status: row.status || "CANDIDATE",
    source: row.source || "unknown",
    roi24h: num(row.roi_24h),
    roi7d: num(row.roi_7d),
    realizedPnl24h: num(row.realized_pnl_24h),
    realizedPnl7d: num(row.realized_pnl_7d),
    winrate24h: num(row.winrate_24h),
    winrate7d: num(row.winrate_7d),
    tradeCount24h: row.trade_count_24h || 0,
    tradeCount7d: row.trade_count_7d || 0,
    avgHoldMinutes: num(row.avg_hold_minutes),
    copyScore: num(row.copy_score),
    riskScore: num(row.risk_score),
    consistencyScore: num(row.consistency_score),
    exitSpeedScore: num(row.exit_speed_score),
    lastSeenAt: row.last_seen_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getServerDb();
    if (!db) {
      return NextResponse.json({ success: false, data: [], count: 0, source: "env-error", error: "Database environment is not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const profitableOnly = searchParams.get("profitableOnly") === "true";
    const minWinrate = Number(searchParams.get("minWinrate") || 0);
    const limit = Math.min(Number(searchParams.get("limit") || 50), 100);

    let query = db.from("wallets").select("*").order("copy_score", { ascending: false }).limit(limit);
    if (status && status !== "all") query = query.eq("status", status);
    if (profitableOnly) query = query.gt("realized_pnl_7d", 0);
    if (minWinrate > 0) query = query.gte("winrate_7d", minWinrate);

    const { data, error } = await query;
    if (error) throw error;

    const wallets = ((data || []) as WalletRow[]).map(mapWallet);

    return NextResponse.json({ success: true, data: wallets, count: wallets.length, source: "supabase" });
  } catch (error) {
    return NextResponse.json({ success: false, data: [], count: 0, source: "supabase-error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const db = getServerDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database environment is not configured" }, { status: 503 });
    }

    const body = await request.json();
    const address = typeof body.address === "string" ? body.address.trim() : "";
    if (!address) {
      return NextResponse.json({ success: false, error: "Wallet address is required" }, { status: 400 });
    }

    const patch: Record<string, unknown> = {
      address,
      chain: body.chain || "solana",
      label: body.label || null,
      notes: body.notes || null,
      status: body.status || "CANDIDATE",
      source: body.source || "manual",
      updated_at: new Date().toISOString(),
    };

    const numericMap: Record<string, string> = {
      roi24h: "roi_24h",
      roi7d: "roi_7d",
      realizedPnl24h: "realized_pnl_24h",
      realizedPnl7d: "realized_pnl_7d",
      winrate24h: "winrate_24h",
      winrate7d: "winrate_7d",
      avgHoldMinutes: "avg_hold_minutes",
      copyScore: "copy_score",
      riskScore: "risk_score",
      consistencyScore: "consistency_score",
      exitSpeedScore: "exit_speed_score",
      tradeCount24h: "trade_count_24h",
      tradeCount7d: "trade_count_7d",
    };

    for (const [inputKey, dbKey] of Object.entries(numericMap)) {
      const value = optionalNum(body[inputKey] ?? body[dbKey]);
      if (value !== undefined) patch[dbKey] = value;
    }

    if (body.rawPayload) patch.raw_payload = body.rawPayload;
    if (body.lastSeenAt || body.last_seen_at) patch.last_seen_at = body.lastSeenAt || body.last_seen_at;

    const { data, error } = await db
      .from("wallets")
      .upsert(patch, { onConflict: "address" })
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data: mapWallet(data as WalletRow), source: "supabase" });
  } catch (error) {
    return NextResponse.json({ success: false, source: "supabase-error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
