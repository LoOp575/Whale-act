// ============================================================
// MOCK DATA — Settings / User Preferences
// WhaleCopy AI — No real user data
// ============================================================

export interface UserSettings {
  profile: {
    displayName: string;
    email: string;
    plan: "Free" | "Pro" | "Enterprise";
    avatarInitial: string;
  };
  notifications: {
    whaleAlerts: boolean;
    aiSignalAlerts: boolean;
    paperTradeUpdates: boolean;
    exitWarnings: boolean;
    weeklyReport: boolean;
  };
  tracking: {
    minTransactionValue: number;
    autoTrackThreshold: number;
    maxTrackedWallets: number;
    showInactiveWallets: boolean;
  };
  display: {
    theme: "dark" | "midnight" | "deep-space";
    currency: "USD" | "SOL" | "ETH";
    compactNumbers: boolean;
    animationsEnabled: boolean;
  };
  paperTrading: {
    startingBalance: number;
    maxPositionSize: number;
    autoCopyEnabled: boolean;
    autoCopyMinScore: number;
    stopLossPercent: number;
    takeProfitPercent: number;
  };
}

export const userSettings: UserSettings = {
  profile: {
    displayName: "Whale User",
    email: "user@whalecopy.ai",
    plan: "Pro",
    avatarInitial: "W",
  },
  notifications: {
    whaleAlerts: true,
    aiSignalAlerts: true,
    paperTradeUpdates: false,
    exitWarnings: true,
    weeklyReport: true,
  },
  tracking: {
    minTransactionValue: 10000,
    autoTrackThreshold: 80,
    maxTrackedWallets: 200,
    showInactiveWallets: false,
  },
  display: {
    theme: "dark",
    currency: "USD",
    compactNumbers: true,
    animationsEnabled: true,
  },
  paperTrading: {
    startingBalance: 10000,
    maxPositionSize: 2000,
    autoCopyEnabled: false,
    autoCopyMinScore: 85,
    stopLossPercent: 15,
    takeProfitPercent: 50,
  },
};
