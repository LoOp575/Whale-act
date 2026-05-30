import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/db/server";

type Row = {
  id: string;
  wallet_address: string | null;
  token_address: string | null;
  token_symbol: string | null;
  action: string | null;
  amount: number | string | null;
  amount_usd: number | string | null;
  tx_hash: string | null;
  description: string | null;
  source: string | null;
  created_at: string | null;
};

function num(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function short(value: string | null) {
  if (!value) return "Unknown";
  return value.length > 12 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value;
}

function mapRow(row: Row) {
  return {
    id: row.id,
    walletLabel: short(row.wallet_address),
    walletAddress: row.wallet_address || "",
    action: (row.action || "UNKNOWN").toUpperCase(),
    token: row.token_symbol || row.token_address || "UNKNOWN",
    tokenAddress: row.token_address || "",
    amount: num(row.amount),
    valueUsd: num(row.amount_usd),
    txHash: short(row.tx_hash),
    description: row.description || "Wallet activity received",
    source: row.source || "supabase",
    timestamp: row.created_at || "",
  };
}

export async function GET() {
  try {
    const db = getServerDb();
    if (!db) {
      return NextResponse.json({ success: false, data: [], count: 0, source: "env-error", error: "Database environment is not configured" }, { status: 503 });
    }

    const { data, error } = await db
      .from("live_activities")
      .select("id,wallet_address,token_address,token_symbol,action,amount,amount_usd,tx_hash,description,source,created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const rows = ((data || []) as Row[]).map(mapRow);

    return NextResponse.json({ success: true, data: rows, count: rows.length, source: "supabase" });
  } catch (error) {
    return NextResponse.json({ success: false, data: [], count: 0, source: "supabase-error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
