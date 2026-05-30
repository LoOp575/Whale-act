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

const TRADES_KEY = "paper_trades";
const APP_SETTINGS_KEY = "dashboard_settings";
const STARTING_BALANCE = 10000;

const defaultAppSettings = {
  displayName: "Whale User",
  theme: "Dark",
  whaleAlerts: true,
  aiSignalAlerts: true,
  paperTradeUpdates: false,
  minTransactionValue: 10000,
  autoTrackThreshold: 80,
  discoveryLimitPairs: 8,
  discoveryTxLimit: 20,
};

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function numWithFallback(value: unknown, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function boolWithFallback(value: unknown, fallback: boolean) {
  if (typeof value === "boolean") return value;
  if (value === "true") return true;
  if (value === "false") return false;
  return fallback;
}

function normalizeAppSettings(value: unknown) {
  const raw = value && typeof value === "object" ? value as Record<string, unknown> : {};
  return {
    displayName: typeof raw.displayName === "string" ? raw.displayName : defaultAppSettings.displayName,
    theme: typeof raw.theme === "string" ? raw.theme : defaultAppSettings.theme,
    whaleAlerts: boolWithFallback(raw.whaleAlerts, defaultAppSettings.whaleAlerts),
    aiSignalAlerts: boolWithFallback(raw.aiSignalAlerts, defaultAppSettings.aiSignalAlerts),
    paperTradeUpdates: boolWithFallback(raw.paperTradeUpdates, defaultAppSettings.paperTradeUpdates),
    minTransactionValue: numWithFallback(raw.minTransactionValue, defaultAppSettings.minTransactionValue),
    autoTrackThreshold: numWithFallback(raw.autoTrackThreshold, defaultAppSettings.autoTrackThreshold),
    discoveryLimitPairs: numWithFallback(raw.discoveryLimitPairs, defaultAppSettings.discoveryLimitPairs),
    discoveryTxLimit: numWithFallback(raw.discoveryTxLimit, defaultAppSettings.discoveryTxLimit),
  };
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

function getDb() {
  const db = getServerDb();
  if (!db) throw new Error("Database environment is not configured");
  return db;
}

async function loadTrades() {
  const db = getDb();
  const { data, error } = await db.from("settings").select("value").eq("key", TRADES_KEY).maybeSingle();
  if (error) throw error;
  const raw = Array.isArray(data?.value) ? data.value : [];
  return raw.map(normalizeTrade).filter((trade): trade is Trade => Boolean(trade));
}

async function saveTrades(trades: Trade[]) {
  const db = getDb();
  const { error } = await db.from("settings").upsert({ key: TRADES_KEY, value: trades, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
}

async function loadAppSettings() {
  const db = getDb();
  const { data, error } = await db.from("settings").select("value").eq("key", APP_SETTINGS_KEY).maybeSingle();
  if (error) throw error;
  return normalizeAppSettings(data?.value);
}

async function saveAppSettings(value: unknown) {
  const db = getDb();
  const next = normalizeAppSettings(value);
  const { error } = await db.from("settings").upsert({ key: APP_SETTINGS_KEY, value: next, updated_at: new Date().toISOString() }, { onConflict: "key" });
  if (error) throw error;
  return next;
}

export async function GET(request: NextRequest) {
  try {
    const kind = request.nextUrl.searchParams.get("kind");
    if (kind === "settings") {
      const settings = await loadAppSettings();
      return NextResponse.json({ success: true, data: settings, source: "supabase_settings" });
    }

    const trades = await loadTrades();
    const enriched = trades.map(withPnl);
    return NextResponse.json({ success: true, data: enriched, summary: summary(trades), source: "supabase_settings" });
  } catch (error) {
    const kind = request.nextUrl.searchParams.get("kind");
    if (kind === "settings") {
      return NextResponse.json({ success: false, data: defaultAppSettings, error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
    }
    return NextResponse.json({ success: false, data: [], summary: summary([]), error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (body.action === "saveSettings") {
      const next = await saveAppSettings(body.settings || body);
      return NextResponse.json({ success: true, data: next, source: "supabase_settings" });
    }

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
