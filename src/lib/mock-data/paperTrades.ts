export interface PaperTradeData {
  id: string;
  token: string;
  copiedFrom: string;
  entryPrice: number;
  exitPrice: number | null;
  pnl: number;
  pnlPercent: number;
  duration: string;
  entryReason: string;
  exitReason: string | null;
  status: "OPEN" | "CLOSED";
}

export interface PaperTradingSummary {
  totalPnl: string;
  totalPnlPercent: string;
  openPositions: number;
  closedPositions: number;
  winRate: string;
}

export const paperTrades: PaperTradeData[] = [];

export const paperTradingSummary: PaperTradingSummary = {
  totalPnl: "$0",
  totalPnlPercent: "No trades yet",
  openPositions: 0,
  closedPositions: 0,
  winRate: "0.0%",
};
