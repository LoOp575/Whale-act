export type SignalType = "BUY" | "WAIT" | "REJECT" | "EXIT" | "WARNING";

export interface SignalData {
  id: string;
  token: string;
  type: SignalType;
  walletCopied: string;
  confidence: number;
  reason: string;
  riskNote: string;
  suggestedAction: string;
  priceChange24h: number;
  volume24h: string;
  timestamp: string;
}

export const signals: SignalData[] = [];
