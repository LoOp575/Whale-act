// ============================================================
// MOCK DATA — Paper Trading
// WhaleCopy AI — Virtual trades, no real money
// ============================================================

export interface PaperTradeData {
  id: string;
  token: string;
  side: "LONG" | "SHORT";
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  pnl: number;
  pnlPercent: number;
  openedAt: string;
  status: "OPEN" | "CLOSED";
  copiedFrom?: string; // wallet label if copy-traded
}

export interface PaperTradingSummary {
  totalBalance: string;
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
    side: "LONG",
    entryPrice: 168.5,
    currentPrice: 175.2,
    quantity: 50,
    pnl: 335,
    pnlPercent: 3.97,
    openedAt: "2 hours ago",
    status: "OPEN",
    copiedFrom: "Whale Alpha",
  },
  {
    id: "pt2",
    token: "JUP",
    side: "LONG",
    entryPrice: 1.15,
    currentPrice: 1.3,
    quantity: 5000,
    pnl: 750,
    pnlPercent: 13.04,
    openedAt: "5 hours ago",
    status: "OPEN",
    copiedFrom: "Smart Money #1",
  },
  {
    id: "pt3",
    token: "WIF",
    side: "SHORT",
    entryPrice: 2.1,
    currentPrice: 2.0,
    quantity: 3000,
    pnl: 300,
    pnlPercent: 4.76,
    openedAt: "1 day ago",
    status: "OPEN",
  },
  {
    id: "pt4",
    token: "BONK",
    side: "LONG",
    entryPrice: 0.000021,
    currentPrice: 0.000019,
    quantity: 50000000,
    pnl: -100,
    pnlPercent: -9.52,
    openedAt: "3 days ago",
    status: "OPEN",
    copiedFrom: "Degen King",
  },
  {
    id: "pt5",
    token: "RAY",
    side: "LONG",
    entryPrice: 3.2,
    currentPrice: 3.5,
    quantity: 1000,
    pnl: 300,
    pnlPercent: 9.38,
    openedAt: "4 days ago",
    status: "CLOSED",
    copiedFrom: "Institutional Acc",
  },
  {
    id: "pt6",
    token: "ORCA",
    side: "LONG",
    entryPrice: 3.8,
    currentPrice: 4.0,
    quantity: 800,
    pnl: 160,
    pnlPercent: 5.26,
    openedAt: "5 days ago",
    status: "CLOSED",
  },
  {
    id: "pt7",
    token: "RENDER",
    side: "LONG",
    entryPrice: 8.4,
    currentPrice: 9.95,
    quantity: 200,
    pnl: 310,
    pnlPercent: 18.45,
    openedAt: "6 hours ago",
    status: "OPEN",
    copiedFrom: "Institutional Acc",
  },
];

export const paperTradingSummary: PaperTradingSummary = {
  totalBalance: "$10,000",
  totalPnl: "$2,055",
  totalPnlPercent: "+20.55%",
  openPositions: 5,
  closedPositions: 2,
  winRate: "85.7%",
};
