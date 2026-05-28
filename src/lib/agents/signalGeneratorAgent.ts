// ============================================================
// Signal Generator Agent — Generates AI signals from wallet activity
// WhaleCopy AI — Paper trading only. No live execution.
// ============================================================

import { scoreWallet } from "@/lib/engines/walletScoringEngine";
import type { WalletScoringInput } from "@/lib/engines/walletScoringEngine";
import { assessTokenRisk } from "@/lib/engines/tokenRiskEngine";
import type { TokenMarketData } from "@/lib/services/dexScreenerService";
import type { SignalType } from "@/lib/mock-data";

// ---- Types ----

export interface SignalInput {
  walletAddress: string;
  walletLabel: string;
  walletScoringInput: WalletScoringInput;
  tokenMarketData: TokenMarketData | null;
  pairAgeMs?: number;
}

export interface GeneratedSignal {
  signalType: SignalType;
  token: string;
  walletCopied: string;
  confidence: number;
  reason: string;
  riskNote: string;
  suggestedAction: string;
}

export interface SignalGeneratorResult {
  signals: GeneratedSignal[];
  skipped: number;
  agentSummary: string;
}

// ---- Thresholds ----

const THRESHOLDS = {
  MIN_COPY_SCORE_BUY: 75,
  MIN_COPY_SCORE_WAIT: 50,
  MIN_LIQUIDITY_USD: 20000,
  MIN_CONFIDENCE_BUY: 70,
  BUY_PRESSURE_RATIO: 1.2, // buys should be at least 1.2x sells
};

// ---- Agent ----

/**
 * Signal Generator Agent
 *
 * Evaluates wallet buy events and generates trading signals.
 * Combines wallet scoring + token risk + market data.
 *
 * PAPER TRADING ONLY. No execution. No private keys.
 */
export function generateSignalFromEvent(input: SignalInput): GeneratedSignal | null {
  const { walletAddress, walletLabel, walletScoringInput, tokenMarketData, pairAgeMs } = input;

  // 1. Score the wallet
  const walletScore = scoreWallet(walletScoringInput);

  // 2. Assess token risk
  const tokenRisk = assessTokenRisk(tokenMarketData, pairAgeMs);

  // 3. Extract market info
  const liquidity = tokenMarketData?.liquidityUsd ?? 0;
  const tokenSymbol = tokenMarketData?.symbol ?? "UNKNOWN";
  const buyCount = tokenMarketData?.buyCount5m ?? 0;
  const sellCount = tokenMarketData?.sellCount5m ?? 0;
  const priceChange5m = tokenMarketData?.priceChange5m ?? 0;
  const priceChange24h = tokenMarketData?.priceChange24h ?? 0;

  // 4. Determine signal
  let signalType: SignalType;
  let confidence: number;
  let reason: string;
  let riskNote: string;
  let suggestedAction: string;

  // --- REJECT conditions (checked first) ---
  if (tokenRisk.status === "REJECT") {
    signalType = "REJECT";
    confidence = tokenRisk.riskScore;
    reason = `Token risk REJECT (score ${tokenRisk.riskScore}/100). ${tokenRisk.reasons[0] || "Data tidak memenuhi syarat."}`;
    riskNote = "Token sangat berisiko — jangan entry.";
    suggestedAction = "REJECT — skip token ini.";
  }
  // --- WARNING conditions ---
  else if (tokenRisk.status === "HIGH" && walletScore.copyScore < THRESHOLDS.MIN_COPY_SCORE_BUY) {
    signalType = "WARNING";
    confidence = Math.round((tokenRisk.riskScore + (100 - walletScore.copyScore)) / 2);
    reason = `Token risk HIGH (${tokenRisk.riskScore}) + wallet score rendah (${walletScore.copyScore}). Kombinasi berbahaya.`;
    riskNote = tokenRisk.reasons[0] || "Risiko tinggi dari kedua sisi.";
    suggestedAction = "REJECT — terlalu berisiko untuk paper trade.";
  }
  // --- EXIT conditions ---
  else if (priceChange5m < -20 && sellCount > buyCount * 2) {
    signalType = "EXIT";
    confidence = 70;
    reason = `Harga turun ${priceChange5m.toFixed(1)}% dalam 5 menit. Sell pressure dominan (${sellCount} sells vs ${buyCount} buys).`;
    riskNote = "Momentum bearish kuat — exit sebelum lebih dalam.";
    suggestedAction = "PAPER_EXIT — close paper position jika ada.";
  }
  // --- BUY conditions ---
  else if (
    walletScore.copyScore >= THRESHOLDS.MIN_COPY_SCORE_BUY &&
    tokenRisk.status !== "HIGH" &&
    liquidity >= THRESHOLDS.MIN_LIQUIDITY_USD &&
    buyCount >= sellCount * THRESHOLDS.BUY_PRESSURE_RATIO
  ) {
    confidence = Math.round(
      (walletScore.copyScore * 0.4) +
      ((100 - tokenRisk.riskScore) * 0.3) +
      (Math.min(liquidity / 100000, 1) * 30)
    );
    confidence = Math.min(99, Math.max(50, confidence));

    signalType = "BUY";
    reason = `Wallet ${walletLabel} (score ${walletScore.copyScore}) beli ${tokenSymbol}. Token risk ${tokenRisk.status} (${tokenRisk.riskScore}/100). Liquidity $${(liquidity / 1000).toFixed(0)}K. Buy pressure positif.`;
    riskNote = liquidity < 50000
      ? `Liquidity cukup tapi tidak tinggi ($${(liquidity / 1000).toFixed(0)}K). Gunakan size kecil.`
      : `Liquidity baik ($${(liquidity / 1000).toFixed(0)}K). Entry aman dengan SL.`;
    suggestedAction = confidence >= 80
      ? "PAPER_BUY — confidence tinggi, entry normal."
      : "PAPER_BUY — confidence menengah, gunakan size kecil.";
  }
  // --- WAIT conditions ---
  else if (walletScore.copyScore >= THRESHOLDS.MIN_COPY_SCORE_WAIT) {
    confidence = Math.round(
      (walletScore.copyScore * 0.3) +
      ((100 - tokenRisk.riskScore) * 0.3) +
      20
    );
    confidence = Math.min(69, Math.max(30, confidence));

    signalType = "WAIT";
    const waitReasons: string[] = [];
    if (walletScore.copyScore < THRESHOLDS.MIN_COPY_SCORE_BUY) {
      waitReasons.push(`wallet score belum cukup tinggi (${walletScore.copyScore})`);
    }
    if (liquidity < THRESHOLDS.MIN_LIQUIDITY_USD) {
      waitReasons.push(`liquidity rendah ($${(liquidity / 1000).toFixed(0)}K)`);
    }
    if (tokenRisk.status === "HIGH") {
      waitReasons.push(`token risk HIGH (${tokenRisk.riskScore})`);
    }
    if (buyCount < sellCount) {
      waitReasons.push("sell pressure > buy pressure");
    }

    reason = `Wallet ${walletLabel} beli ${tokenSymbol}, tapi ${waitReasons.join(", ") || "belum memenuhi semua kriteria BUY"}.`;
    riskNote = "Tunggu konfirmasi lebih lanjut sebelum entry.";
    suggestedAction = "WAIT — monitor, jangan entry dulu.";
  }
  // --- Default: REJECT (not enough data) ---
  else {
    signalType = "REJECT";
    confidence = 30;
    reason = `Wallet score terlalu rendah (${walletScore.copyScore}) atau data tidak mencukupi untuk evaluasi.`;
    riskNote = "Tidak cukup data — skip.";
    suggestedAction = "REJECT — tidak memenuhi kriteria minimum.";
  }

  return {
    signalType,
    token: tokenSymbol,
    walletCopied: walletLabel,
    confidence,
    reason,
    riskNote,
    suggestedAction,
  };
}

/**
 * Batch process multiple wallet buy events.
 * Returns all generated signals.
 */
export function runSignalGenerator(inputs: SignalInput[]): SignalGeneratorResult {
  const signals: GeneratedSignal[] = [];
  let skipped = 0;

  for (const input of inputs) {
    try {
      const signal = generateSignalFromEvent(input);
      if (signal) {
        signals.push(signal);
      } else {
        skipped++;
      }
    } catch (error) {
      console.error(`[SignalGenerator] Error processing ${input.walletAddress}:`, error);
      skipped++;
    }
  }

  const buyCount = signals.filter((s) => s.signalType === "BUY").length;
  const waitCount = signals.filter((s) => s.signalType === "WAIT").length;
  const rejectCount = signals.filter((s) => s.signalType === "REJECT").length;
  const exitCount = signals.filter((s) => s.signalType === "EXIT").length;
  const warningCount = signals.filter((s) => s.signalType === "WARNING").length;

  const agentSummary = [
    `Signal Generator selesai.`,
    `Input: ${inputs.length} events.`,
    `Output: ${signals.length} signals (BUY: ${buyCount}, WAIT: ${waitCount}, REJECT: ${rejectCount}, EXIT: ${exitCount}, WARNING: ${warningCount}).`,
    `Skipped: ${skipped}.`,
  ].join(" ");

  return { signals, skipped, agentSummary };
}
