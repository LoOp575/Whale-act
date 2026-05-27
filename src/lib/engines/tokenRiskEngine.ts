// ============================================================
// Token Risk Engine — Rule-Based Risk Assessment
// WhaleCopy AI — No AI, no trading, pure logic scoring
// ============================================================

import type { TokenMarketData } from "@/lib/services/dexScreenerService";

// ---- Output Types ----

export type RiskStatus = "LOW" | "MEDIUM" | "HIGH" | "REJECT";

export interface TokenRiskResult {
  riskScore: number; // 0–100 (0 = safest, 100 = most risky)
  status: RiskStatus;
  reasons: string[];
}

// ---- Config Thresholds ----

const THRESHOLDS = {
  // Liquidity
  LIQUIDITY_REJECT: 5000,       // < $5K = auto reject
  LIQUIDITY_HIGH: 20000,        // < $20K = high risk
  LIQUIDITY_MEDIUM: 50000,      // < $50K = medium risk

  // Volume
  VOLUME_5M_MIN: 500,           // < $500 in 5min = very low activity
  VOLUME_1H_MIN: 5000,          // < $5K in 1h = low activity

  // Price Change
  PRICE_PUMP_5M: 40,            // > +40% in 5min = pump warning
  PRICE_PUMP_1H: 80,            // > +80% in 1h = extreme pump
  PRICE_DUMP_5M: -30,           // < -30% in 5min = dump warning

  // Buy/Sell Ratio
  SELL_PRESSURE_RATIO: 2.0,     // sells > 2x buys = high sell pressure
  EXTREMELY_LOW_BUYS: 3,        // < 3 buys in 5min = dead token

  // Pair Age (ms)
  PAIR_AGE_NEW_MS: 3600000,     // < 1 hour = brand new (risky)
  PAIR_AGE_YOUNG_MS: 86400000,  // < 24 hours = young
};

// ---- Engine ----

/**
 * Assess token risk based on market data.
 * Returns a score (0-100), status, and human-readable reasons.
 *
 * Input: TokenMarketData from DexScreener service.
 * Optional: pairAgeMs (pair creation age in milliseconds).
 *
 * This is purely rule-based. No AI. No trading execution.
 */
export function assessTokenRisk(
  token: TokenMarketData | null,
  pairAgeMs?: number
): TokenRiskResult {
  const reasons: string[] = [];
  let score = 0;

  // ---- Missing/null data ----
  if (!token) {
    return {
      riskScore: 90,
      status: "REJECT",
      reasons: ["Data token tidak tersedia — tidak bisa dianalisis"],
    };
  }

  // ---- 1. Liquidity Check ----
  if (token.liquidityUsd < THRESHOLDS.LIQUIDITY_REJECT) {
    score += 40;
    reasons.push(`Liquidity sangat rendah: $${token.liquidityUsd.toLocaleString()} (min $5K)`);
  } else if (token.liquidityUsd < THRESHOLDS.LIQUIDITY_HIGH) {
    score += 25;
    reasons.push(`Liquidity rendah: $${token.liquidityUsd.toLocaleString()} (min recommended $20K)`);
  } else if (token.liquidityUsd < THRESHOLDS.LIQUIDITY_MEDIUM) {
    score += 10;
    reasons.push(`Liquidity cukup: $${token.liquidityUsd.toLocaleString()}`);
  }

  // ---- 2. Volume Check ----
  if (token.volume5m < THRESHOLDS.VOLUME_5M_MIN) {
    score += 15;
    reasons.push(`Volume 5m sangat rendah: $${token.volume5m.toLocaleString()} — token mungkin mati`);
  }
  if (token.volume1h < THRESHOLDS.VOLUME_1H_MIN) {
    score += 10;
    reasons.push(`Volume 1h rendah: $${token.volume1h.toLocaleString()}`);
  }

  // ---- 3. Price Change (Pump/Dump Detection) ----
  if (token.priceChange5m > THRESHOLDS.PRICE_PUMP_5M) {
    score += 20;
    reasons.push(`Pump terdeteksi: +${token.priceChange5m.toFixed(1)}% dalam 5 menit — kemungkinan akan koreksi`);
  }
  if (token.priceChange1h > THRESHOLDS.PRICE_PUMP_1H) {
    score += 15;
    reasons.push(`Pump ekstrem 1h: +${token.priceChange1h.toFixed(1)}% — sangat berisiko entry sekarang`);
  }
  if (token.priceChange5m < THRESHOLDS.PRICE_DUMP_5M) {
    score += 20;
    reasons.push(`Dump terdeteksi: ${token.priceChange5m.toFixed(1)}% dalam 5 menit — kemungkinan rug atau panic sell`);
  }

  // ---- 4. Buy/Sell Pressure ----
  if (token.buyCount5m < THRESHOLDS.EXTREMELY_LOW_BUYS && token.txns5m > 0) {
    score += 15;
    reasons.push(`Hampir tidak ada buyer: hanya ${token.buyCount5m} buy dalam 5 menit`);
  } else if (token.sellCount5m > 0 && token.buyCount5m > 0) {
    const sellRatio = token.sellCount5m / token.buyCount5m;
    if (sellRatio >= THRESHOLDS.SELL_PRESSURE_RATIO) {
      score += 15;
      reasons.push(`Sell pressure tinggi: ${token.sellCount5m} sells vs ${token.buyCount5m} buys (ratio ${sellRatio.toFixed(1)}x)`);
    }
  }

  // ---- 5. No Transaction Activity ----
  if (token.txns5m === 0) {
    score += 20;
    reasons.push("Tidak ada transaksi dalam 5 menit terakhir — token kemungkinan mati");
  }

  // ---- 6. Pair Age (if available) ----
  if (pairAgeMs !== undefined) {
    if (pairAgeMs < THRESHOLDS.PAIR_AGE_NEW_MS) {
      score += 20;
      reasons.push("Token baru dibuat < 1 jam — sangat berisiko (potensi rug)");
    } else if (pairAgeMs < THRESHOLDS.PAIR_AGE_YOUNG_MS) {
      score += 10;
      reasons.push("Token masih muda < 24 jam — perlu monitoring ketat");
    }
  }

  // ---- 7. Incomplete Data ----
  if (token.priceUsd === 0) {
    score += 15;
    reasons.push("Harga token $0 — data tidak valid atau token delisted");
  }
  if (token.liquidityUsd === 0 && token.volume24h === 0) {
    score += 20;
    reasons.push("Tidak ada liquidity dan volume — data tidak lengkap");
  }

  // ---- Clamp score to 0-100 ----
  score = Math.min(100, Math.max(0, score));

  // ---- Determine status ----
  let status: RiskStatus;
  if (score >= 70) {
    status = "REJECT";
  } else if (score >= 45) {
    status = "HIGH";
  } else if (score >= 20) {
    status = "MEDIUM";
  } else {
    status = "LOW";
  }

  // ---- Add positive note if score is low ----
  if (score < 20 && reasons.length === 0) {
    reasons.push("Token terlihat aman — liquidity baik, volume aktif, tidak ada anomali");
  }

  return {
    riskScore: score,
    status,
    reasons,
  };
}
