// ============================================================
// Wallet Scoring Engine — Rule-Based Copy Score Assessment
// WhaleCopy AI — No AI, no trading, deterministic scoring
// ============================================================

// ---- Input Types ----

export interface WalletScoringInput {
  roi24h: number;                    // ROI dalam 24 jam (%)
  realizedPnl24h: number;            // Realized PnL dalam USD
  winrate24h: number;                // Winrate 24h (0-100)
  winrate7d: number;                 // Winrate 7 hari (0-100)
  tradeCount: number;                // Jumlah trade dalam periode
  profitableTradeCount: number;      // Jumlah trade yang profit
  avgHoldMinutes: number;            // Rata-rata hold time (menit)
  avgTokenLiquidityUsd: number;      // Rata-rata liquidity token yang di-trade
  lowLiquidityTradeCount: number;    // Jumlah trade di token liquidity < $20K
  totalTradeCount: number;           // Total trade sepanjang waktu
  riskHistory: number;               // Jumlah trade yang rugi > 20% (high risk events)
}

// ---- Output Types ----

export type WalletStatus = "WATCHLIST" | "TESTING" | "GOOD" | "REJECTED" | "NEUTRAL";

export interface WalletScoringResult {
  copyScore: number;     // 0–100 (higher = better to copy)
  status: WalletStatus;
  reasons: string[];
}

// ---- Config ----

const WEIGHTS = {
  ROI_24H: 20,
  REALIZED_PNL: 15,
  WINRATE_7D: 20,
  WINRATE_24H: 10,
  TRADE_VOLUME: 10,
  HOLD_TIME: 10,
  LIQUIDITY_QUALITY: 10,
  RISK_HISTORY: 5,
};

// ---- Engine ----

/**
 * Score a wallet for copy-trading viability.
 * Returns a deterministic score based on rules.
 * No AI. No randomness. Same input = same output.
 */
export function scoreWallet(input: WalletScoringInput): WalletScoringResult {
  const reasons: string[] = [];
  let score = 0;

  // ---- 1. ROI 24h (max 20 points) ----
  if (input.roi24h >= 50) {
    score += 20;
    reasons.push(`ROI 24h sangat tinggi: +${input.roi24h.toFixed(1)}%`);
  } else if (input.roi24h >= 20) {
    score += 15;
    reasons.push(`ROI 24h bagus: +${input.roi24h.toFixed(1)}%`);
  } else if (input.roi24h >= 5) {
    score += 10;
    reasons.push(`ROI 24h positif: +${input.roi24h.toFixed(1)}%`);
  } else if (input.roi24h >= 0) {
    score += 5;
  } else if (input.roi24h < -10) {
    score -= 5;
    reasons.push(`ROI 24h negatif: ${input.roi24h.toFixed(1)}% — wallet sedang rugi`);
  }

  // ---- 2. Realized PnL 24h (max 15 points) ----
  if (input.realizedPnl24h >= 5000) {
    score += 15;
    reasons.push(`Realized PnL tinggi: +$${input.realizedPnl24h.toLocaleString()}`);
  } else if (input.realizedPnl24h >= 1000) {
    score += 12;
    reasons.push(`Realized PnL baik: +$${input.realizedPnl24h.toLocaleString()}`);
  } else if (input.realizedPnl24h >= 100) {
    score += 8;
  } else if (input.realizedPnl24h > 0) {
    score += 4;
  } else if (input.realizedPnl24h < -1000) {
    score -= 5;
    reasons.push(`PnL negatif signifikan: -$${Math.abs(input.realizedPnl24h).toLocaleString()}`);
  }

  // ---- 3. Winrate 7d (max 20 points) ----
  if (input.winrate7d >= 80) {
    score += 20;
    reasons.push(`Winrate 7d excellent: ${input.winrate7d.toFixed(1)}%`);
  } else if (input.winrate7d >= 65) {
    score += 15;
    reasons.push(`Winrate 7d bagus: ${input.winrate7d.toFixed(1)}%`);
  } else if (input.winrate7d >= 55) {
    score += 10;
    reasons.push(`Winrate 7d cukup: ${input.winrate7d.toFixed(1)}%`);
  } else if (input.winrate7d >= 40) {
    score += 5;
  } else {
    score -= 5;
    reasons.push(`Winrate 7d rendah: ${input.winrate7d.toFixed(1)}% — lebih sering rugi`);
  }

  // ---- 4. Winrate 24h (max 10 points) ----
  if (input.winrate24h >= 75) {
    score += 10;
  } else if (input.winrate24h >= 55) {
    score += 7;
  } else if (input.winrate24h >= 40) {
    score += 3;
  }

  // ---- 5. Trade Count / Volume (max 10 points) ----
  if (input.tradeCount < 3) {
    score -= 10;
    reasons.push(`Hanya ${input.tradeCount} trade — terlalu sedikit untuk dinilai`);
  } else if (input.tradeCount >= 10) {
    score += 10;
    reasons.push(`Aktivitas tinggi: ${input.tradeCount} trades — data statistik reliable`);
  } else if (input.tradeCount >= 5) {
    score += 7;
  } else {
    score += 3;
  }

  // ---- 6. Single-Trade Profit Dependency ----
  if (input.tradeCount >= 3 && input.profitableTradeCount === 1 && input.realizedPnl24h > 500) {
    score -= 8;
    reasons.push("Profit hanya dari 1 trade — belum konsisten, bisa keberuntungan");
  }

  // ---- 7. Hold Time (max 10 points) ----
  if (input.avgHoldMinutes < 2) {
    score -= 5;
    reasons.push(`Avg hold sangat pendek: ${input.avgHoldMinutes.toFixed(0)} menit — kemungkinan bot/scalper`);
  } else if (input.avgHoldMinutes < 10) {
    score += 3;
    reasons.push(`Hold time pendek: ${input.avgHoldMinutes.toFixed(0)} menit — scalper/sniper style`);
  } else if (input.avgHoldMinutes <= 480) {
    score += 10;
  } else if (input.avgHoldMinutes <= 1440) {
    score += 8;
  } else {
    score += 5;
    reasons.push(`Hold time panjang: ${(input.avgHoldMinutes / 60).toFixed(1)} jam`);
  }

  // ---- 8. Liquidity Quality (max 10 points) ----
  if (input.avgTokenLiquidityUsd >= 100000) {
    score += 10;
  } else if (input.avgTokenLiquidityUsd >= 50000) {
    score += 7;
  } else if (input.avgTokenLiquidityUsd >= 20000) {
    score += 4;
  } else {
    score -= 5;
    reasons.push(`Sering trade di token low-liquidity: avg $${input.avgTokenLiquidityUsd.toLocaleString()}`);
  }

  // Low-liquidity trade frequency penalty
  if (input.totalTradeCount > 0) {
    const lowLiqRatio = input.lowLiquidityTradeCount / input.totalTradeCount;
    if (lowLiqRatio > 0.5) {
      score -= 10;
      reasons.push(`${(lowLiqRatio * 100).toFixed(0)}% trade di token liquidity < $20K — sangat berisiko`);
    } else if (lowLiqRatio > 0.3) {
      score -= 5;
      reasons.push(`${(lowLiqRatio * 100).toFixed(0)}% trade di token low-liquidity`);
    }
  }

  // ---- 9. Risk History (max 5 points) ----
  if (input.riskHistory === 0) {
    score += 5;
  } else if (input.riskHistory <= 2) {
    score += 2;
  } else if (input.riskHistory >= 5) {
    score -= 8;
    reasons.push(`${input.riskHistory} high-risk trades (rugi > 20%) — pola gambling`);
  } else {
    score -= 3;
    reasons.push(`${input.riskHistory} trade dengan kerugian > 20%`);
  }

  // ---- Clamp score 0–100 ----
  score = Math.min(100, Math.max(0, score));

  // ---- Determine Status ----
  let status: WalletStatus;
  if (score >= 80) {
    status = "GOOD";
  } else if (score >= 60) {
    status = "TESTING";
  } else if (score >= 40) {
    status = "WATCHLIST";
  } else if (score >= 20) {
    status = "NEUTRAL";
  } else {
    status = "REJECTED";
  }

  // ---- Add summary if no specific reasons ----
  if (reasons.length === 0) {
    if (status === "GOOD") {
      reasons.push("Wallet terlihat solid — ROI, winrate, dan pola trading konsisten");
    } else if (status === "NEUTRAL") {
      reasons.push("Data belum cukup untuk penilaian — perlu monitoring lebih lanjut");
    }
  }

  return {
    copyScore: score,
    status,
    reasons,
  };
}
