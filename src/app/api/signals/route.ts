import { NextRequest, NextResponse } from "next/server";
import { signals as emptySignals } from "@/lib/mock-data";
import type { SignalData, SignalType } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type SignalRow = {
  id?: string;
  signal_type?: string | null;
  wallet_address?: string | null;
  token_address?: string | null;
  token_symbol?: string | null;
  confidence?: number | string | null;
  reason?: string | null;
  risk_note?: string | null;
  suggested_action?: string | null;
  price_change_24h?: number | string | null;
  volume_24h?: number | string | null;
  created_at?: string | null;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 4)}...${address.slice(-4)}` : address;
}

function signalType(value: unknown): SignalType {
  const type = String(value || "WAIT").toUpperCase();
  if (type === "BUY" || type === "WAIT" || type === "REJECT" || type === "EXIT" || type === "WARNING") return type as SignalType;
  return "WAIT";
}

function mapSignal(row: SignalRow): SignalData {
  return {
    id: row.id || `${row.token_symbol || row.token_address || "UNKNOWN"}-${row.created_at || Date.now()}`,
    token: row.token_symbol || row.token_address || "UNKNOWN",
    type: signalType(row.signal_type),
    walletCopied: row.wallet_address ? shortAddress(row.wallet_address) : "Unknown Wallet",
    confidence: toNumber(row.confidence),
    reason: row.reason || "Signal generated from live data.",
    riskNote: row.risk_note || "Paper mode only. Review manually.",
    suggestedAction: row.suggested_action || "WAIT",
    priceChange24h: toNumber(row.price_change_24h),
    volume24h: row.volume_24h ? `$${toNumber(row.volume_24h).toLocaleString()}` : "N/A",
    timestamp: row.created_at || "synced",
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const limit = Number(searchParams.get("limit") || 20);
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({ success: true, data: emptySignals, count: 0, source: "mock" });
    }

    let query = supabase.from("signals").select("*").order("created_at", { ascending: false }).limit(limit);
    if (type) query = query.eq("signal_type", type);

    const { data, error } = await query;
    if (error) throw error;

    const mapped = ((data || []) as SignalRow[]).map(mapSignal);
    return NextResponse.json({ success: true, data: mapped, count: mapped.length, source: "supabase" });
  } catch (error) {
    return NextResponse.json(
      { success: false, data: [], count: 0, source: "supabase-error", message: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: "Use /api/agent/run-signal to generate signals from live data." },
    { status: 405 }
  );
}
