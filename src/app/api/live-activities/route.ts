import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/lib/db/server";

type ActivityRow = {
  id: string;
  wallet_address: string | null;
  token_address: string | null;
  token_symbol: string | null;
  action: string | null;
  amount: number | string | null;
  amount_usd: number | string | null;
  tx_hash: string | null;
  description: string | null;
  raw_summary: string | null;
  source: string | null;
  created_at: string | null;
};

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function short(value: string) {
  return value.length <= 12 ? value : `${value.slice(0, 4)}...${value.slice(-4)}`;
}

function mapActivity(row: ActivityRow) {
  const walletAddress = row.wallet_address || "";
  const tokenAddress = row.token_address || "";
  return {
    id: row.id,
    walletLabel: walletAddress ? short(walletAddress) : "Unknown wallet",
    walletAddress,
    action: (row.action || "TRANSFER").toUpperCase(),
    token: row.token_symbol || (tokenAddress ? short(tokenAddress) : "UNKNOWN"),
    tokenAddress,
    amount: num(row.amount),
    valueUsd: num(row.amount_usd),
    timestamp: row.created_at || "",
    txHash: row.tx_hash || "",
    description: row.description || row.raw_summary || "Whale activity captured",
    source: row.source || "supabase",
  };
}

export async function GET(request: NextRequest) {
  try {
    const db = getServerDb();
    if (!db) {
      return NextResponse.json({ success: false, data: [], count: 0, source: "env-error", error: "Database environment is not configured" }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get("action");
    const limit = Math.min(Number(searchParams.get("limit") || 80), 150);

    let query = db.from("live_activities").select("*").order("created_at", { ascending: false }).limit(limit);
    if (action && action !== "ALL") query = query.eq("action", action.toUpperCase());

    const { data, error } = await query;
    if (error) throw error;

    const activities = ((data || []) as ActivityRow[]).map(mapActivity);
    return NextResponse.json({ success: true, data: activities, count: activities.length, source: "supabase" });
  } catch (error) {
    return NextResponse.json({ success: false, data: [], count: 0, source: "supabase-error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
