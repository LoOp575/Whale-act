// ============================================================
// MOCK DATA — AI Signals
// WhaleCopy AI — No real predictions, for UI display only
// ============================================================

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

export const signals: SignalData[] = [
  {
    id: "s1",
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
    id: "s2",
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
    id: "s3",
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
    id: "s4",
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
    id: "s5",
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
    id: "s6",
    token: "PYTH",
    type: "SELL",
    confidence: 65,
    reason: "Whale Alpha exiting position. Oracle narrative cooling off.",
    whaleCount: 1,
    priceChange24h: -4.3,
    volume24h: "$180M",
    timestamp: "45 min ago",
  },
  {
    id: "s7",
    token: "JITO",
    type: "BUY",
    confidence: 74,
    reason: "MEV activity increasing on Solana. 4 wallets adding JITO exposure this week.",
    whaleCount: 4,
    priceChange24h: 6.9,
    volume24h: "$420M",
    timestamp: "1 hour ago",
  },
  {
    id: "s8",
    token: "POPCAT",
    type: "STRONG_SELL",
    confidence: 82,
    reason: "Degen King dumping 60% of position. Community sentiment turning bearish.",
    whaleCount: 2,
    priceChange24h: -15.3,
    volume24h: "$290M",
    timestamp: "1.5 hours ago",
  },
];
