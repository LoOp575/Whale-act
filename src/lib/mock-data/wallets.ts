export type WalletTag = "watchlist" | "testing" | "good" | "rejected" | "neutral";

export interface WalletData {
  id: string;
  address: string;
  label: string;
  roi24h: number;
  realizedPnl: number;
  winRate: number;
  totalTrades: number;
  avgHoldTime: string;
  copyScore: number;
  status: "active" | "inactive" | "new";
  tag: WalletTag;
  isTracked: boolean;
  riskScore: "Low" | "Medium" | "High";
  lastActive: string;
}

export const wallets: WalletData[] = [];
