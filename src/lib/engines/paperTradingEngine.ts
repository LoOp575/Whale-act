// ============================================================
// Paper Trading Engine — Virtual portfolio management
// WhaleCopy AI — No real money. No private keys. No live trades.
// ============================================================

import type { SignalType } from "@/lib/mock-data";

// ---- Types ----

export type PaperTradeStatus = "OPEN" | "CLOSED" | "STOPPED";

export interface PaperTrade {
  id: string;
  token: string;
  tokenAddress?: string;
  copiedWallet: string;
  signalType: SignalType;
  entryPrice: number;
  exitPrice: number | null;
  sizeUsd: number;
  pnlUsd: number;
  pnlPercent: number;
  status: PaperTradeStatus;
  entryReason: string;
  exitReason: string | null;
  openedAt: string;
  closedAt: string | null;
}

export interface PaperTradeSummary {
  totalTrades: number;
  openTrades: number;
  closedTrades: number;
  stoppedTrades: number;
  totalPnlUsd: number;
  totalPnlPercent: number;
  winCount: number;
  lossCount: number;
  winRate: number;
  bestTrade: { token: string; pnlPercent: number } | null;
  worstTrade: { token: string; pnlPercent: number } | null;
}

export interface OpenTradeInput {
  token: string;
  tokenAddress?: string;
  copiedWallet: string;
  signalType: SignalType;
  entryPrice: number;
  entryReason: string;
  sizeUsd?: number;
}

// ---- In-Memory Store (replace with Supabase later) ----

const trades: PaperTrade[] = [];
const DEFAULT_SIZE_USD = 10;

// ---- Engine Functions ----

/**
 * Open a new paper trade position.
 * ONLY opens if signalType is BUY.
 * No real money. No execution on any exchange.
 */
export function openPaperTrade(input: OpenTradeInput): PaperTrade | { error: string } {
  if (input.signalType !== "BUY") {
    return { error: `Cannot open trade — signal type is ${input.signalType}, not BUY.` };
  }

  if (!input.token || input.entryPrice <= 0) {
    return { error: "Invalid input — token and positive entryPrice required." };
  }

  const trade: PaperTrade = {
    id: `pt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    token: input.token,
    tokenAddress: input.tokenAddress,
    copiedWallet: input.copiedWallet,
    signalType: input.signalType,
    entryPrice: input.entryPrice,
    exitPrice: null,
    sizeUsd: input.sizeUsd || DEFAULT_SIZE_USD,
    pnlUsd: 0,
    pnlPercent: 0,
    status: "OPEN",
    entryReason: input.entryReason,
    exitReason: null,
    openedAt: new Date().toISOString(),
    closedAt: null,
  };

  trades.push(trade);
  return trade;
}

/**
 * Close an existing paper trade.
 * Calculates PnL based on entry vs exit price.
 */
export function closePaperTrade(
  tradeId: string,
  exitPrice: number,
  exitReason: string
): PaperTrade | { error: string } {
  const trade = trades.find((t) => t.id === tradeId);

  if (!trade) {
    return { error: `Trade not found: ${tradeId}` };
  }
  if (trade.status !== "OPEN") {
    return { error: `Trade already ${trade.status}: ${tradeId}` };
  }
  if (exitPrice <= 0) {
    return { error: "Exit price must be positive." };
  }

  const { pnlUsd, pnlPercent } = calculatePnL(trade.entryPrice, exitPrice, trade.sizeUsd);

  trade.exitPrice = exitPrice;
  trade.pnlUsd = pnlUsd;
  trade.pnlPercent = pnlPercent;
  trade.status = pnlPercent <= -6 ? "STOPPED" : "CLOSED";
  trade.exitReason = exitReason;
  trade.closedAt = new Date().toISOString();

  return trade;
}

/**
 * Calculate PnL for a paper trade.
 * Pure math — no side effects.
 */
export function calculatePnL(
  entryPrice: number,
  exitPrice: number,
  sizeUsd: number
): { pnlUsd: number; pnlPercent: number } {
  if (entryPrice <= 0) return { pnlUsd: 0, pnlPercent: 0 };

  const pnlPercent = ((exitPrice - entryPrice) / entryPrice) * 100;
  const pnlUsd = (pnlPercent / 100) * sizeUsd;

  return {
    pnlUsd: Math.round(pnlUsd * 100) / 100,
    pnlPercent: Math.round(pnlPercent * 100) / 100,
  };
}

/**
 * Get summary of all paper trades.
 */
export function getPaperTradingSummary(): PaperTradeSummary {
  const closedTrades = trades.filter((t) => t.status === "CLOSED" || t.status === "STOPPED");
  const openTrades = trades.filter((t) => t.status === "OPEN");
  const stoppedTrades = trades.filter((t) => t.status === "STOPPED");

  const wins = closedTrades.filter((t) => t.pnlUsd > 0);
  const losses = closedTrades.filter((t) => t.pnlUsd <= 0);

  const totalPnlUsd = closedTrades.reduce((sum, t) => sum + t.pnlUsd, 0);
  const totalInvested = closedTrades.reduce((sum, t) => sum + t.sizeUsd, 0);
  const totalPnlPercent = totalInvested > 0 ? (totalPnlUsd / totalInvested) * 100 : 0;

  let bestTrade: { token: string; pnlPercent: number } | null = null;
  let worstTrade: { token: string; pnlPercent: number } | null = null;

  if (closedTrades.length > 0) {
    const sorted = [...closedTrades].sort((a, b) => b.pnlPercent - a.pnlPercent);
    bestTrade = { token: sorted[0].token, pnlPercent: sorted[0].pnlPercent };
    worstTrade = { token: sorted[sorted.length - 1].token, pnlPercent: sorted[sorted.length - 1].pnlPercent };
  }

  return {
    totalTrades: trades.length,
    openTrades: openTrades.length,
    closedTrades: closedTrades.length,
    stoppedTrades: stoppedTrades.length,
    totalPnlUsd: Math.round(totalPnlUsd * 100) / 100,
    totalPnlPercent: Math.round(totalPnlPercent * 100) / 100,
    winCount: wins.length,
    lossCount: losses.length,
    winRate: closedTrades.length > 0 ? Math.round((wins.length / closedTrades.length) * 100 * 10) / 10 : 0,
    bestTrade,
    worstTrade,
  };
}

/**
 * Get all trades (for API response)
 */
export function getAllTrades(): PaperTrade[] {
  return [...trades].sort((a, b) => new Date(b.openedAt).getTime() - new Date(a.openedAt).getTime());
}

/**
 * Get open trades only
 */
export function getOpenTrades(): PaperTrade[] {
  return trades.filter((t) => t.status === "OPEN");
}
