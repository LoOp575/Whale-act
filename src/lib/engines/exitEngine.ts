// ============================================================
// Exit Engine — Determines when to close paper trades
// WhaleCopy AI — No live selling. Only closes paper positions.
// ============================================================

// ---- Types ----

export type ExitUrgency = "LOW" | "MEDIUM" | "HIGH";

export interface ExitCheckInput {
  entryPrice: number;
  currentPrice: number;
  highestPrice: number; // highest price since entry (for trailing)
  sizeUsd: number;
  copiedWalletSelling: boolean; // true if copied wallet started selling
  volume1hCurrent: number;
  volume1hPrevious: number; // for volume weakening check
  settings?: ExitSettings;
}

export interface ExitSettings {
  takeProfitPercent1: number; // default +8%
  takeProfitPercent2: number; // default +15%
  stopLossPercent: number; // default -6%
  trailingActivation: number; // default 12% (trailing starts after this profit)
  trailingDropPercent: number; // default 5% (exit if drops this much from peak)
}

export interface ExitResult {
  shouldExit: boolean;
  exitReason: string;
  urgency: ExitUrgency;
}

// ---- Defaults ----

const DEFAULT_SETTINGS: ExitSettings = {
  takeProfitPercent1: 8,
  takeProfitPercent2: 15,
  stopLossPercent: -6,
  trailingActivation: 12,
  trailingDropPercent: 5,
};

// ---- Engine ----

/**
 * Check if a paper trade should be exited.
 * 
 * Evaluates stop loss, take profit, trailing stop,
 * copied wallet behavior, and volume conditions.
 * 
 * Does NOT execute any trade. Only returns a recommendation.
 * Paper trading only — no real selling.
 */
export function checkExit(input: ExitCheckInput): ExitResult {
  const settings = input.settings || DEFAULT_SETTINGS;
  const { entryPrice, currentPrice, highestPrice, copiedWalletSelling, volume1hCurrent, volume1hPrevious } = input;

  if (entryPrice <= 0) {
    return { shouldExit: false, exitReason: "Invalid entry price", urgency: "LOW" };
  }

  const currentPnlPercent = ((currentPrice - entryPrice) / entryPrice) * 100;
  const peakPnlPercent = ((highestPrice - entryPrice) / entryPrice) * 100;
  const dropFromPeak = peakPnlPercent - currentPnlPercent;

  // ---- 1. STOP LOSS (highest urgency) ----
  if (currentPnlPercent <= settings.stopLossPercent) {
    return {
      shouldExit: true,
      exitReason: `Stop Loss triggered: ${currentPnlPercent.toFixed(2)}% (limit: ${settings.stopLossPercent}%)`,
      urgency: "HIGH",
    };
  }

  // ---- 2. TAKE PROFIT 2 (full exit) ----
  if (currentPnlPercent >= settings.takeProfitPercent2) {
    return {
      shouldExit: true,
      exitReason: `Take Profit 2 reached: +${currentPnlPercent.toFixed(2)}% (target: +${settings.takeProfitPercent2}%)`,
      urgency: "MEDIUM",
    };
  }

  // ---- 3. TRAILING STOP ----
  if (peakPnlPercent >= settings.trailingActivation && dropFromPeak >= settings.trailingDropPercent) {
    return {
      shouldExit: true,
      exitReason: `Trailing stop triggered: peak was +${peakPnlPercent.toFixed(1)}%, now +${currentPnlPercent.toFixed(1)}% (dropped ${dropFromPeak.toFixed(1)}% from peak)`,
      urgency: "HIGH",
    };
  }

  // ---- 4. COPIED WALLET SELLING ----
  if (copiedWalletSelling) {
    return {
      shouldExit: true,
      exitReason: "Copied wallet started selling this token — follow the exit.",
      urgency: "HIGH",
    };
  }

  // ---- 5. TAKE PROFIT 1 (partial — but for simplicity, full exit) ----
  if (currentPnlPercent >= settings.takeProfitPercent1) {
    return {
      shouldExit: true,
      exitReason: `Take Profit 1 reached: +${currentPnlPercent.toFixed(2)}% (target: +${settings.takeProfitPercent1}%)`,
      urgency: "LOW",
    };
  }

  // ---- 6. VOLUME WEAKENING WARNING ----
  if (volume1hPrevious > 0 && volume1hCurrent > 0) {
    const volumeDropPercent = ((volume1hPrevious - volume1hCurrent) / volume1hPrevious) * 100;
    if (volumeDropPercent >= 50 && currentPnlPercent > 0) {
      return {
        shouldExit: true,
        exitReason: `Volume melemah ${volumeDropPercent.toFixed(0)}% (dari $${(volume1hPrevious / 1000).toFixed(0)}K ke $${(volume1hCurrent / 1000).toFixed(0)}K). Ambil profit sebelum terlambat.`,
        urgency: "MEDIUM",
      };
    }
  }

  // ---- No exit condition met ----
  return {
    shouldExit: false,
    exitReason: `Position OK: PnL ${currentPnlPercent >= 0 ? "+" : ""}${currentPnlPercent.toFixed(2)}%`,
    urgency: "LOW",
  };
}
