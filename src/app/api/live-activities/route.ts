import { NextResponse } from "next/server";
import { activities as mockActivities } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type ActivityRow = {
  id?: string;
  wallet_address?: string | null;
  token_symbol?: string | null;
  token_address?: string | null;
  action?: string | null;
  amount_usd?: number | string | null;
  tx_hash?: string | null;
  description?: string | null;
  created_at?: string | null;
};

function shortAddress(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function mapAction(action?: string | null): "bought" | "sold" | "added" | "warning" {
  const normalized = (action || "").toLowerCase();
  if (normalized === "buy" || normalized === "bought") return "bought";
  if (normalized === "sell" || normalized === "sold") return "sold";
  if (normalized === "warning") return "warning";
  return "added";
}

function normalizeActivity(row: ActivityRow) {
  const wallet = row.wallet_address || "Unknown";
  const token = row.token_symbol || row.token_address || "UNKNOWN";
  const valueUsd = toNumber(row.amount_usd);

  return {
    id: row.id || `${wallet}-${row.created_at || Date.now()}`,
    walletLabel: shortAddress(wallet),
    walletAddress: shortAddress(wallet),
    action: mapAction(row.action),
    token,
    amount: valueUsd ? `$${valueUsd.toLocaleString()}` : "0",
    valueUsd,
    timestamp: row.created_at || "just now",
    description: row.description || `${shortAddress(wallet)} ${row.action || "activity"} ${token}`,
    txHash: row.tx_hash ? shortAddress(row.tx_hash) : "pending",
  };
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({
      success: true,
      data: mockActivities,
      count: mockActivities.length,
      source: "mock",
    });
  }

  try {
    const { data, error } = await supabase
      .from("live_activities")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    const rows = (data || []) as ActivityRow[];
    const activities = rows.map(normalizeActivity);

    return NextResponse.json({
      success: true,
      data: activities,
      count: activities.length,
      source: "supabase",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        data: [],
        count: 0,
        source: "supabase-error",
        message: error instanceof Error ? error.message : "Supabase unavailable",
      },
      { status: 500 }
    );
  }
}
