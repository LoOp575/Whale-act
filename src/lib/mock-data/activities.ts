// ============================================================
// MOCK DATA — Live Activities
// WhaleCopy AI — No real transactions
// ============================================================

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

export const activities: ActivityData[] = [
  {
    id: "a1",
    walletLabel: "Whale Alpha",
    walletAddress: "7xKQ...92A",
    action: "BUY",
    token: "SOL",
    amount: 12500,
    valueUsd: 2187500,
    timestamp: "2 min ago",
    txHash: "4xK9...mB2r",
  },
  {
    id: "a2",
    walletLabel: "Smart Money #1",
    walletAddress: "3dFR...B8z",
    action: "SWAP",
    token: "JUP",
    amount: 450000,
    valueUsd: 585000,
    timestamp: "5 min ago",
    txHash: "7tLm...nC4y",
  },
  {
    id: "a3",
    walletLabel: "Degen King",
    walletAddress: "9pLM...K2r",
    action: "BUY",
    token: "WIF",
    amount: 890000,
    valueUsd: 1780000,
    timestamp: "8 min ago",
    txHash: "2pNh...fD6a",
  },
  {
    id: "a4",
    walletLabel: "MEV Bot #7",
    walletAddress: "8wRJ...C4y",
    action: "SELL",
    token: "BONK",
    amount: 45000000,
    valueUsd: 945000,
    timestamp: "12 min ago",
    txHash: "9cYt...bE3w",
  },
  {
    id: "a5",
    walletLabel: "Institutional Acc",
    walletAddress: "5tVN...Q9x",
    action: "BUY",
    token: "RAY",
    amount: 125000,
    valueUsd: 437500,
    timestamp: "15 min ago",
    txHash: "3gZp...hK7m",
  },
  {
    id: "a6",
    walletLabel: "DeFi Farmer",
    walletAddress: "2kNH...P6a",
    action: "SWAP",
    token: "ORCA",
    amount: 85000,
    valueUsd: 340000,
    timestamp: "18 min ago",
    txHash: "6wRj...dC4y",
  },
  {
    id: "a7",
    walletLabel: "Whale Alpha",
    walletAddress: "7xKQ...92A",
    action: "SELL",
    token: "PYTH",
    amount: 320000,
    valueUsd: 192000,
    timestamp: "22 min ago",
    txHash: "1kNh...fP6a",
  },
  {
    id: "a8",
    walletLabel: "Smart Money #1",
    walletAddress: "3dFR...B8z",
    action: "BUY",
    token: "RENDER",
    amount: 28000,
    valueUsd: 252000,
    timestamp: "28 min ago",
    txHash: "5tVn...jQ9x",
  },
  {
    id: "a9",
    walletLabel: "Degen King",
    walletAddress: "9pLM...K2r",
    action: "BUY",
    token: "POPCAT",
    amount: 2400000,
    valueUsd: 1680000,
    timestamp: "31 min ago",
    txHash: "8xKX...mN4p",
  },
  {
    id: "a10",
    walletLabel: "Airdrop Hunter",
    walletAddress: "4gZP...L7m",
    action: "SWAP",
    token: "JITO",
    amount: 15000,
    valueUsd: 52500,
    timestamp: "35 min ago",
    txHash: "0dFq...uB8z",
  },
  {
    id: "a11",
    walletLabel: "Sniper Bot",
    walletAddress: "Bx4F...7Kd",
    action: "BUY",
    token: "SLERF",
    amount: 5200000,
    valueUsd: 312000,
    timestamp: "38 min ago",
    txHash: "Ax7R...pQ3m",
  },
  {
    id: "a12",
    walletLabel: "Quiet Giant",
    walletAddress: "Qm8Y...3Nf",
    action: "BUY",
    token: "SOL",
    amount: 8000,
    valueUsd: 1400000,
    timestamp: "42 min ago",
    txHash: "Zy2K...bN8v",
  },
];
