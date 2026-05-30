import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/lib/db/server";

type Trade = {
  id: string;
  token: string;
  tokenAddress?: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  status: "OPEN" | "CLOSED";
  openedAt: string;
  closedAt?: string;
};

const SETTINGS_KEY = "paper_trades";
const STARTING_BALANCE = 10000;

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeTrade(value: unknown): Trade | null {
  if (!value || typeof value !== "object") return null;
  const item = value as Partial<Trade>;
  if (!item.id || !item.token) return null;
  const side = item.side === "SHORT" ? "SHORT" : "LONG";
  const status = item.status === "CLOSED" ? "CLOSED" : "OPEN";
  return {
    id: String(item.id),
    token: String(item.token).toUpperCase(),
    tokenAddress: item.tokenAddress ? String(item.tokenAddress) : "",
    side,
    entryPrice: num(item.entryPrice),
    currentPrice: num(item.currentPrice || item.entryPrice),
    quantity: num(item.quantity),
    status,
    openedAt: item.openedAt || new Date().toISOString(),
    closedAt: item.closedAt || undefined,
  };
}

function withPnl(trade: Trade) {
  const direction = trade.side === "LONG" ? 1 : -1;
  const pnl = (trade.currentPrice - trade.entryPrice) * trade.quantity * direction;
  const cost = trade.entryPrice * trade.quantity;
  const pnlPercent = cost ? (pnl / cost) * 100 : 0;
  return { ...trade, pnl, pnlPercent };
}

function summary(trades: Trade[]) {
  const enriched = trades.map(withPnl);
  const totalPnl = enriched.reduce((sum, trade) => sum + trade.pnl, 0);
  const closed = enriched.filter((trade) => trade.status === "CLOSED");
  const wins = closed.filter((trade) => trade.pnl > 0).length;
  return {
    startingBalance: STARTING_BALANCE,
    totalBalance: STARTING_BALANCE + totalPnl,
    totalPnl,
    totalPnlPercent: STARTING_BALANCE ? (totalPnl / STARTING_BALANCE) * 100 : 0,
    openPositions: enriched.filter((trade) => trade.status === "OPEN").length,
    closedPositions: closed.length,
    winRate: closed.length ? (wins / closed.length) * 100 : 0,
  };
}

async function loadTrades() {
  const db = getServerDb();
  if (!db) throw new Error("Database environment is not configured");
  const { data, error } = await db.from("settings").select("value").eq("key", SETTINGS_KEY).maybeSingle();
  if (error) throw error;
  const raw = Array.isArray(data?.value) ? data.value : [];
  return raw.map(normalizeTrade).filter((trade): trade is Trade => Boolean(trade));
}

async function saveTrades(trades: Trade[]) {
  const db = getServerDb();
  if (!db) throw new Error("Database environment is not configured");
  const { error } = await db.from("settings").upsert({ key: SETTINGS_KEY, value: trades, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

export async function GET() {
  try {
    const trades = await loadTrades();
    const enriched = trades.map(withPnl);
    return NextResponse.json({ success: true, data: enriched, summary: summary(trades), source: "supabase_settings" });
  } catch (error) {
    return NextResponse.json({ success: false, data: [], summary: summary([]), error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const trades = await loadTrades();

    if (body.action === "close") {
      const id = String(body.id || "");
      const next = trades.map((trade) => {
        if (trade.id !== id) return trade;
        return {
          ...trade,
          status: "CLOSED" as const,
          currentPrice: num(body.exitPrice || body.currentPrice || trade.currentPrice || trade.entryPrice),
          closedAt: new Date().toISOString(),
        };
      });
      await saveTrades(next);
      return NextResponse.json({ success: true, data: next.map(withPnl), summary: summary(next), source: "supabase_settings" });
    }

    const token = String(body.token || "").trim().toUpperCase();
    const entryPrice = num(body.entryPrice);
    const quantity = num(body.quantity);
    if (!token || !entryPrice || !quantity) {
      return NextResponse.json({ success: false, error: "Token, entry price, and quantity are required" }, { status: 400 });
    }

    const trade: Trade = {
      id: crypto.randomUUID(),
      token,
      tokenAddress: body.tokenAddress ? String(body.tokenAddress) : "",
      side: body.side === "SHORT" ? "SHORT" : "LONG",
      entryPrice,
      currentPrice: num(body.currentPrice || entryPrice),
      quantity,
      status: "OPEN",
      openedAt: new Date().toISOString(),
    };

    const next = [trade, ...trades].slice(0, 200);
    await saveTrades(next);
    return NextResponse.json({ success: true, data: next.map(withPnl), summary: summary(next), source: "supabase_settings" });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
