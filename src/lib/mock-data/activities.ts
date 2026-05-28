export type ActivityAction = "bought" | "sold" | "added" | "warning";

export interface ActivityData {
  id: string;
  walletLabel: string;
  walletAddress: string;
  action: ActivityAction;
  token: string;
  amount: string;
  valueUsd: number;
  timestamp: string;
  description: string;
  txHash: string;
}

export const activities: ActivityData[] = [];
