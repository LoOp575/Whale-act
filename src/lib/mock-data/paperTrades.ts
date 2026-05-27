// ============================================================
// MOCK DATA — Paper Trading
// WhaleCopy AI — Virtual trades, no real money
// ============================================================

export interface PaperTradeData {
  id: string;
  token: string;
  copiedFrom: string;
  entryPrice: number;
  exitPrice: number | null; // null if still open
  pnl: number;
  pnlPercent: number;
  duration: string;
  entryReason: string;
  exitReason: string | null; // null if still open
  status: "OPEN" | "CLOSED";
}

export interface PaperTradingSummary {
  totalPnl: string;
  totalPnlPercent: string;
  openPositions: number;
  closedPositions: number;
  winRate: string;
}

export const paperTrades: PaperTradeData[] = [
  {
    id: "pt1",
    token: "SOL",
    copiedFrom: "Whale Alpha",
    entryPrice: 168.5,
    exitPrice: null,
    pnl: 335,
    pnlPercent: 3.97,
    duration: "2h 14m",
    entryReason: "AI Signal BUY — whale accumulation detected, confidence 94%",
    exitReason: null,
    status: "OPEN",
  },
  {
    id: "pt2",
    token: "JUP",
    copiedFrom: "Smart Money #1",
    entryPrice: 1.15,
    exitPrice: null,
    pnl: 750,
    pnlPercent: 13.04,
    duration: "5h 30m",
    entryReason: "Copy trade — smart money rotasi ke JUP sebelum governance vote",
    exitReason: null,
    status: "OPEN",
  },
  {
    id: "pt3",
    token: "RENDER",
    copiedFrom: "Institutional Acc",
    entryPrice: 8.4,
    exitPrice: null,
    pnl: 310,
    pnlPercent: 18.45,
    duration: "6h 10m",
    entryReason: "AI Signal BUY — institutional wallet buka posisi besar, narasi AI trending",
    exitReason: null,
    status: "OPEN",
  },
  {
    id: "pt4",
    token: "WIF",
    copiedFrom: "Degen King",
    entryPrice: 2.1,
    exitPrice: null,
    pnl: -63,
    pnlPercent: -3.0,
    duration: "1d 4h",
    entryReason: "Copy trade — Degen King entry besar di WIF, momentum play",
    exitReason: null,
    status: "OPEN",
  },
  {
    id: "pt5",
    token: "BONK",
    copiedFrom: "Degen King",
    entryPrice: 0.000021,
    exitPrice: null,
    pnl: -100,
    pnlPercent: -9.52,
    duration: "3d 2h",
    entryReason: "Copy trade — meme coin entry, high risk high reward",
    exitReason: null,
    status: "OPEN",
  },
  {
    id: "pt6",
    token: "RAY",
    copiedFrom: "Institutional Acc",
    entryPrice: 3.2,
    exitPrice: 3.5,
    pnl: 300,
    pnlPercent: 9.38,
    duration: "2d 8h",
    entryReason: "AI Signal BUY — DCA mingguan institusi, TVL Raydium naik",
    exitReason: "Take profit — target +9% tercapai",
    status: "CLOSED",
  },
  {
    id: "pt7",
    token: "ORCA",
    copiedFrom: "DeFi Farmer",
    entryPrice: 3.8,
    exitPrice: 4.0,
    pnl: 160,
    pnlPercent: 5.26,
    duration: "1d 12h",
    entryReason: "Copy trade — DeFi Farmer add liquidity, bullish signal",
    exitReason: "Manual exit — profit lock sebelum weekend",
    status: "CLOSED",
  },
  {
    id: "pt8",
    token: "PYTH",
    copiedFrom: "Whale Alpha",
    entryPrice: 0.48,
    exitPrice: 0.42,
    pnl: -180,
    pnlPercent: -12.5,
    duration: "4d 6h",
    entryReason: "Copy trade — Whale Alpha entry PYTH untuk oracle narrative",
    exitReason: "Stop loss triggered — whale exit 80% posisi, AI signal EXIT",
    status: "CLOSED",
  },
];

export const paperTradingSummary: PaperTradingSummary = {
  totalPnl: "+$1,512",
  totalPnlPercent: "+15.12%",
  openPositions: 5,
  closedPositions: 3,
  winRate: "75.0%",
};
