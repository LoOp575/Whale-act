// ============================================================
// DUMMY DATA - WhaleCopy AI Dashboard
// No real API calls, no real wallets, no real trading
// ============================================================

export interface WalletData {
  id: string;
  address: string;
  label: string;
  pnl7d: number;
  pnl30d: number;
  winRate: number;
  totalTrades: number;
  avgHoldTime: string;
  riskScore: "Low" | "Medium" | "High";
  isTracked: boolean;
}

export interface ActivityData {
  id: string;
  walletLabel: string;
  walletAddress: string;
  action: "BUY" | "SELL" | "SWAP";
  token: string;
  amount: number;
  valueUsd: number;
  timestamp: string;
  txHash: string;
}

export interface SignalData {
  id: string;
  token: string;
  type: "STRONG_BUY" | "BUY" | "NEUTRAL" | "SELL" | "STRONG_SELL";
  confidence: number;
  reason: string;
  whaleCount: number;
  priceChange24h: number;
  volume24h: string;
  timestamp: string;
}

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
}

// Top Wallets
export const topWallets: WalletData[] = [
  {
    id: "1",
    address: "7xKX...mN4p",
    label: "Whale Alpha",
    pnl7d: 45230,
    pnl30d: 182400,
    winRate: 87.5,
    totalTrades: 342,
    avgHoldTime: "4.2h",
    riskScore: "Medium",
    isTracked: true,
  },
  {
    id: "2",
    address: "3dFq...uB8z",
    label: "Smart Money #1",
    pnl7d: 38100,
    pnl30d: 156800,
    winRate: 82.1,
    totalTrades: 218,
    avgHoldTime: "12.5h",
    riskScore: "Low",
    isTracked: true,
  },
  {
    id: "3",
    address: "9pLm...wK2r",
    label: "Degen King",
    pnl7d: 67800,
    pnl30d: 234500,
    winRate: 73.4,
    totalTrades: 891,
    avgHoldTime: "1.8h",
    riskScore: "High",
    isTracked: false,
  },
  {
    id: "4",
    address: "5tVn...jQ9x",
    label: "Institutional Acc",
    pnl7d: 21400,
    pnl30d: 89300,
    winRate: 91.2,
    totalTrades: 67,
    avgHoldTime: "3.2d",
    riskScore: "Low",
    isTracked: true,
  },
  {
    id: "5",
    address: "8wRj...dC4y",
    label: "MEV Bot #7",
    pnl7d: 52100,
    pnl30d: 198700,
    winRate: 95.8,
    totalTrades: 2341,
    avgHoldTime: "45s",
    riskScore: "High",
    isTracked: false,
  },
  {
    id: "6",
    address: "2kNh...fP6a",
    label: "DeFi Farmer",
    pnl7d: 18900,
    pnl30d: 72500,
    winRate: 78.9,
    totalTrades: 156,
    avgHoldTime: "8.1h",
    riskScore: "Medium",
    isTracked: true,
  },
  {
    id: "7",
    address: "6cYt...bE3w",
    label: "NFT Whale",
    pnl7d: -12300,
    pnl30d: 45600,
    winRate: 65.2,
    totalTrades: 89,
    avgHoldTime: "2.4d",
    riskScore: "Medium",
    isTracked: false,
  },
  {
    id: "8",
    address: "4gZp...hL7m",
    label: "Airdrop Hunter",
    pnl7d: 8700,
    pnl30d: 34200,
    winRate: 71.8,
    totalTrades: 423,
    avgHoldTime: "6.5h",
    riskScore: "Low",
    isTracked: false,
  },
];

// Live Activity Feed
export const liveActivities: ActivityData[] = [
  {
    id: "1",
    walletLabel: "Whale Alpha",
    walletAddress: "7xKX...mN4p",
    action: "BUY",
    token: "SOL",
    amount: 12500,
    valueUsd: 2187500,
    timestamp: "2 min ago",
    txHash: "4xK9...mB2r",
  },
  {
    id: "2",
    walletLabel: "Smart Money #1",
    walletAddress: "3dFq...uB8z",
    action: "SWAP",
    token: "JUP",
    amount: 450000,
    valueUsd: 585000,
    timestamp: "5 min ago",
    txHash: "7tLm...nC4y",
  },
  {
    id: "3",
    walletLabel: "Degen King",
    walletAddress: "9pLm...wK2r",
    action: "BUY",
    token: "WIF",
    amount: 890000,
    valueUsd: 1780000,
    timestamp: "8 min ago",
    txHash: "2pNh...fD6a",
  },
  {
    id: "4",
    walletLabel: "MEV Bot #7",
    walletAddress: "8wRj...dC4y",
    action: "SELL",
    token: "BONK",
    amount: 45000000,
    valueUsd: 945000,
    timestamp: "12 min ago",
    txHash: "9cYt...bE3w",
  },
  {
    id: "5",
    walletLabel: "Institutional Acc",
    walletAddress: "5tVn...jQ9x",
    action: "BUY",
    token: "RAY",
    amount: 125000,
    valueUsd: 437500,
    timestamp: "15 min ago",
    txHash: "3gZp...hK7m",
  },
  {
    id: "6",
    walletLabel: "DeFi Farmer",
    walletAddress: "2kNh...fP6a",
    action: "SWAP",
    token: "ORCA",
    amount: 85000,
    valueUsd: 340000,
    timestamp: "18 min ago",
    txHash: "6wRj...dC4y",
  },
  {
    id: "7",
    walletLabel: "Whale Alpha",
    walletAddress: "7xKX...mN4p",
    action: "SELL",
    token: "PYTH",
    amount: 320000,
    valueUsd: 192000,
    timestamp: "22 min ago",
    txHash: "1kNh...fP6a",
  },
  {
    id: "8",
    walletLabel: "Smart Money #1",
    walletAddress: "3dFq...uB8z",
    action: "BUY",
    token: "RENDER",
    amount: 28000,
    valueUsd: 252000,
    timestamp: "28 min ago",
    txHash: "5tVn...jQ9x",
  },
  {
    id: "9",
    walletLabel: "Degen King",
    walletAddress: "9pLm...wK2r",
    action: "BUY",
    token: "POPCAT",
    amount: 2400000,
    valueUsd: 1680000,
    timestamp: "31 min ago",
    txHash: "8xKX...mN4p",
  },
  {
    id: "10",
    walletLabel: "Airdrop Hunter",
    walletAddress: "4gZp...hL7m",
    action: "SWAP",
    token: "JITO",
    amount: 15000,
    valueUsd: 52500,
    timestamp: "35 min ago",
    txHash: "0dFq...uB8z",
  },
];

// AI Signals
export const aiSignals: SignalData[] = [
  {
    id: "1",
    token: "SOL",
    type: "STRONG_BUY",
    confidence: 94,
    reason: "3 top wallets accumulated 45K SOL in last 2 hours. Volume spike detected.",
    whaleCount: 3,
    priceChange24h: 5.2,
    volume24h: "$2.4B",
    timestamp: "5 min ago",
  },
  {
    id: "2",
    token: "JUP",
    type: "BUY",
    confidence: 78,
    reason: "Smart money rotating from RAY to JUP. Governance vote incoming.",
    whaleCount: 5,
    priceChange24h: 12.8,
    volume24h: "$890M",
    timestamp: "12 min ago",
  },
  {
    id: "3",
    token: "WIF",
    type: "NEUTRAL",
    confidence: 52,
    reason: "Mixed signals. 2 wallets buying, 1 large wallet selling. Wait for confirmation.",
    whaleCount: 3,
    priceChange24h: -2.1,
    volume24h: "$1.2B",
    timestamp: "18 min ago",
  },
  {
    id: "4",
    token: "BONK",
    type: "SELL",
    confidence: 71,
    reason: "Top holder dumping. MEV bots front-running exits. Momentum fading.",
    whaleCount: 4,
    priceChange24h: -8.4,
    volume24h: "$560M",
    timestamp: "25 min ago",
  },
  {
    id: "5",
    token: "RENDER",
    type: "STRONG_BUY",
    confidence: 88,
    reason: "Institutional wallet opened large position. AI narrative gaining traction.",
    whaleCount: 2,
    priceChange24h: 18.7,
    volume24h: "$340M",
    timestamp: "32 min ago",
  },
  {
    id: "6",
    token: "PYTH",
    type: "SELL",
    confidence: 65,
    reason: "Whale Alpha exiting position. Oracle narrative cooling off.",
    whaleCount: 1,
    priceChange24h: -4.3,
    volume24h: "$180M",
    timestamp: "45 min ago",
  },
];

// Paper Trading Portfolio
export const paperTrades: PaperTradeData[] = [
  {
    id: "1",
    token: "SOL",
    side: "LONG",
    entryPrice: 168.5,
    currentPrice: 175.2,
    quantity: 50,
    pnl: 335,
    pnlPercent: 3.97,
    openedAt: "2 hours ago",
    status: "OPEN",
  },
  {
    id: "2",
    token: "JUP",
    side: "LONG",
    entryPrice: 1.15,
    currentPrice: 1.3,
    quantity: 5000,
    pnl: 750,
    pnlPercent: 13.04,
    openedAt: "5 hours ago",
    status: "OPEN",
  },
  {
    id: "3",
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
    id: "4",
    token: "BONK",
    side: "LONG",
    entryPrice: 0.000021,
    currentPrice: 0.000019,
    quantity: 50000000,
    pnl: -100,
    pnlPercent: -9.52,
    openedAt: "3 days ago",
    status: "OPEN",
  },
  {
    id: "5",
    token: "RAY",
    side: "LONG",
    entryPrice: 3.2,
    currentPrice: 3.5,
    quantity: 1000,
    pnl: 300,
    pnlPercent: 9.38,
    openedAt: "4 days ago",
    status: "CLOSED",
  },
  {
    id: "6",
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
];

// Dashboard overview stats
export const dashboardStats = {
  totalPnl: "$12,485",
  totalPnlChange: "+18.2%",
  trackedWallets: "142",
  trackedWalletsChange: "+5",
  activeSignals: "6",
  activeSignalsChange: "+2",
  winRate: "78.4%",
  winRateChange: "+3.1%",
};

// Paper trading summary
export const paperTradingSummary = {
  totalBalance: "$10,000",
  totalPnl: "$1,745",
  totalPnlPercent: "+17.45%",
  openPositions: 4,
  closedPositions: 2,
  winRate: "83.3%",
};
