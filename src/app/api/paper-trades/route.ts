import { NextRequest, NextResponse } from "next/server";
import { paperTrades, paperTradingSummary } from "@/lib/mock-data";
import type { PaperTradeData, PaperTradingSummary } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type Row = {
  id?: string;
  token_symbol?: string | null;
  token_address?: string | null;
  copied_wallet?: string | null;
  entry_price?: number | string | null;
  exit_price?: number | string | null;
  pnl_usd?: number | string | null;
  pnl_percent?: number | string | null;
  entry_reason?: string | null;
  exit_reason?: string | null;
  status?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
};

function n(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function short(value?: string | null): string {
  if (!value) return "Unknown";
  return value.length > 12 ? `${value.slice(0, 4)}...${value.slice(-4)}` : value;
}

function mapRow(row: Row): PaperTradeData {
  return {
    id: row.id || `${row.token_symbol || row.token_address || "UNKNOWN"}-${row.opened_at || Date.now()}`,
    token: row.token_symbol || row.token_address || "UNKNOWN",
    copiedFrom: short(row.copied_wallet),
    entryPrice: n(row.entry_price),
    exitPrice: row.exit_price === null || row.exit_price === undefined ? null : n(row.exit_price),
    pnl: n(row.pnl_usd),
    pnlPercent: n(row.pnl_percent),
    duration: row.closed_at ? "closed" : "open",
    entryReason: row.entry_reason || "Paper position from signal pipeline.",
    exitReason: row.exit_reason || null,
    status: String(row.status || "OPEN").toUpperCase() === "CLOSED" ? "CLOSED" : "OPEN",
  };
}

function summary(rows: PaperTradeData[]): PaperTradingSummary {
  const total = rows.reduce((sum, row) => sum + row.pnl, 0);
  const open = rows.filter((row) => row.status === "OPEN").length;
  const closed = rows.filter((row) => row.status === "CLOSED").length;
  const wins = rows.filter((row) => row.status === "CLOSED" && row.pnl > 0).length;
  return {
    totalPnl: `${total >= 0 ? "+" : "-"}$${Math.abs(total).toLocaleString()}`,
    totalPnlPercent: rows.length ? "from database" : "No positions yet",
    openPositions: open,
    closedPositions: closed,
    winRate: `${closed ? ((wins / closed) * 100).toFixed(1) : "0.0"}%`,
  };
}

export async function GET(request: NextRequest) {
  try {
    const status = new URL(request.url).searchParams.get("status");
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      const rows = status ? paperTrades.filter((row) => row.status === status) : paperTrades;
      return NextResponse.json({ success: true, data: { trades: rows, summary: paperTradingSummary }, count: rows.length, source: "mock" });
    }

    let query = supabase.from("paper_trades").select("*").order("opened_at", { ascending: false });
    if (status) query = query.eq("status", status);

    const { data, error } = await query;
    if (error) throw error;

    const rows = ((data || []) as Row[]).map(mapRow);
    return NextResponse.json({ success: true, data: { trades: rows, summary: summary(rows) }, count: rows.length, source: "supabase" });
  } catch (error) {
    return NextResponse.json({ success: false, data: { trades: [], summary: summary([]) }, count: 0, source: "supabase-error", message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = String(body.token || "").trim();
    const entryPrice = n(body.entryPrice);
    if (!token || entryPrice <= 0) return NextResponse.json({ success: false, error: "Invalid token or entryPrice" }, { status: 400 });

    const supabase = getSupabaseAdmin();
    if (!supabase) return NextResponse.json({ success: false, error: "Supabase is not configured" }, { status: 503 });

    const { data, error } = await supabase.from("paper_trades").insert({
      token_symbol: token,
      token_address: body.tokenAddress || token,
      copied_wallet: body.copiedFrom || "Manual",
      entry_price: entryPrice,
      pnl_usd: 0,
      pnl_percent: 0,
      status: "OPEN",
      entry_reason: body.entryReason || "Manual paper position",
    }).select("*").single();

    if (error) throw error;
    return NextResponse.json({ success: true, data: mapRow(data as Row), source: "supabase" });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Failed to save paper position", message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
