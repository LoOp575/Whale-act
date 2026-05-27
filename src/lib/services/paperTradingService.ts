// ============================================================
// Paper Trading Service (Virtual Portfolio Management)
// WhaleCopy AI — Placeholder only, no real trading
// ============================================================

import { paperTrades, paperTradingSummary } from "@/lib/mock-data";
import type { PaperTradeData, PaperTradingSummary } from "@/lib/mock-data";

/**
 * Open a new paper trade position
 * TODO: implement with local storage or database
 */
export async function openPaperTrade(params: {
  token: string;
  entryPrice: number;
  copiedFrom: string;
  entryReason: string;
}): Promise<PaperTradeData> {
  // TODO: implement real paper trade creation
  // - Validate against user settings (max trade size, min liquidity)
  // - Store in local storage / database
  // - Calculate position size based on settings
  // - Set stop loss and take profit from user config
  return {
    id: `pt_${Date.now()}`,
    token: params.token,
    copiedFrom: params.copiedFrom,
    entryPrice: params.entryPrice,
    exitPrice: null,
    pnl: 0,
    pnlPercent: 0,
    duration: "0m",
    entryReason: params.entryReason,
    exitReason: null,
    status: "OPEN",
  };
}

/**
 * Close an existing paper trade
 * TODO: implement with price fetching + PnL calculation
 */
export async function closePaperTrade(
  tradeId: string,
  exitReason: string
): Promise<PaperTradeData | null> {
  // TODO: implement real close logic
  // - Fetch current token price from DexScreener
  // - Calculate realized PnL
  // - Update trade status to CLOSED
  // - Record exit reason and duration
  const trade = paperTrades.find((t) => t.id === tradeId);
  if (!trade) return null;

  return {
    ...trade,
    status: "CLOSED",
    exitReason,
  };
}

/**
 * Get all paper trades (open + closed)
 * TODO: replace with database/storage query
 */
export async function getAllPaperTrades(): Promise<PaperTradeData[]> {
  // TODO: fetch from persistent storage
  // - Local storage for MVP
  // - Database (Supabase/Prisma) for production
  return paperTrades;
}

/**
 * Get paper trading summary stats
 * TODO: calculate from real trade history
 */
export async function getPaperTradingSummary(): Promise<PaperTradingSummary> {
  // TODO: calculate real stats from trade history
  // - Total PnL across all closed trades
  // - Win rate = profitable trades / total closed trades
  // - Open/closed counts
  return paperTradingSummary;
}

/**
 * Check if stop loss or take profit is triggered
 * TODO: implement with real price monitoring
 */
export async function checkStopLossTP(tradeId: string): Promise<{
  triggered: "stop_loss" | "take_profit_1" | "take_profit_2" | null;
  currentPrice: number;
}> {
  // TODO: implement real price monitoring
  // - Fetch current price from DexScreener
  // - Compare against user's SL/TP settings
  // - Auto-close if triggered
  return {
    triggered: null,
    currentPrice: 0,
  };
}

/**
 * Auto-copy a trade from a whale wallet
 * TODO: implement auto-copy logic
 */
export async function autoCopyTrade(params: {
  walletAddress: string;
  token: string;
  walletLabel: string;
}): Promise<PaperTradeData | null> {
  // TODO: implement auto-copy
  // - Check if wallet meets min copy score
  // - Check if token meets min liquidity
  // - Check if daily loss limit not exceeded
  // - Open paper trade automatically
  return null;
}
