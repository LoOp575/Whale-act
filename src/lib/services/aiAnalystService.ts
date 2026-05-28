// ============================================================
// AI Analyst Service — Explains scoring results in natural language
// WhaleCopy AI — Read-only analysis. No trading execution.
// ============================================================

import { serverConfig, isAiConfigured } from "@/lib/config";
import type { WalletScoringInput, WalletScoringResult } from "@/lib/engines/walletScoringEngine";
import type { TokenRiskResult } from "@/lib/engines/tokenRiskEngine";
import type { TokenMarketData } from "./dexScreenerService";
import type { SignalData } from "@/lib/mock-data";

// ---- Allowed Actions (Paper Only) ----

export type SuggestedAction = "WATCH" | "PAPER_BUY" | "PAPER_EXIT" | "REJECT" | "WAIT";

// ---- Output Types ----

export interface WalletExplanation {
  summary: string;
  detailedReason: string;
  riskNote: string;
  suggestedAction: SuggestedAction;
}

export interface TokenRiskExplanation {
  summary: string;
  detailedReason: string;
  riskNote: string;
  suggestedAction: SuggestedAction;
}

export interface SignalExplanation {
  summary: string;
  detailedReason: string;
  riskNote: string;
  suggestedAction: SuggestedAction;
}

// ---- OpenAI Helper (Server-Only) ----

/**
 * Call OpenAI for natural language explanation.
 * ONLY runs server-side. Never exposes API key.
 * Never sends private keys or wallet secrets.
 */
async function callOpenAI(systemPrompt: string, userPrompt: string): Promise<string | null> {
  if (!isAiConfigured()) return null;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serverConfig.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 300,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      console.warn(`[AI Analyst] OpenAI returned ${response.status}`);
      return null;
    }

    const json = await response.json();
    return json.choices?.[0]?.message?.content?.trim() || null;
  } catch (error) {
    console.error("[AI Analyst] OpenAI call failed:", error);
    return null;
  }
}

// ---- System Prompts ----

const SYSTEM_PROMPT_BASE = `Kamu adalah AI analyst untuk WhaleCopy AI, sebuah tool paper trading crypto.
Tugasmu HANYA menjelaskan dan merangkum data scoring. Kamu TIDAK boleh:
- Mengeksekusi trade apapun
- Menyarankan LIVE_BUY atau LIVE_SELL
- Meminta private key atau seed phrase

Suggested action yang diperbolehkan HANYA: WATCH, PAPER_BUY, PAPER_EXIT, REJECT, WAIT.
Jawab dalam bahasa Indonesia yang singkat dan jelas. Max 3 kalimat per section.`;

// ---- Service Functions ----

/**
 * Explain a wallet's copy score in natural language.
 * Uses AI if available, otherwise returns rule-based fallback.
 */
export async function explainWalletScore(
  walletData: Partial<WalletScoringInput> & { label?: string; address?: string },
  scoreResult: WalletScoringResult
): Promise<WalletExplanation> {
  // Try AI explanation
  const aiResponse = await callOpenAI(
    SYSTEM_PROMPT_BASE,
    `Jelaskan hasil scoring wallet ini untuk paper trading:
Wallet: ${walletData.label || walletData.address || "Unknown"}
Copy Score: ${scoreResult.copyScore}/100
Status: ${scoreResult.status}
ROI 24h: ${walletData.roi24h || 0}%
Winrate 7d: ${walletData.winrate7d || 0}%
Trade count: ${walletData.tradeCount || 0}
Avg hold: ${walletData.avgHoldMinutes || 0} menit
Reasons dari engine: ${scoreResult.reasons.join("; ")}

Berikan: 1) summary singkat, 2) detailed reason, 3) risk note, 4) suggested action (WATCH/PAPER_BUY/PAPER_EXIT/REJECT/WAIT)`
  );

  if (aiResponse) {
    return parseAiWalletResponse(aiResponse, scoreResult);
  }

  // Fallback: rule-based explanation
  return generateFallbackWalletExplanation(walletData, scoreResult);
}

/**
 * Explain a token's risk assessment in natural language.
 */
export async function explainTokenRisk(
  tokenData: Partial<TokenMarketData>,
  riskResult: TokenRiskResult
): Promise<TokenRiskExplanation> {
  const aiResponse = await callOpenAI(
    SYSTEM_PROMPT_BASE,
    `Jelaskan hasil risk assessment token ini:
Token: ${tokenData.symbol || "Unknown"} (${tokenData.tokenAddress || "?"})
Risk Score: ${riskResult.riskScore}/100
Status: ${riskResult.status}
Price: $${tokenData.priceUsd || 0}
Liquidity: $${tokenData.liquidityUsd?.toLocaleString() || 0}
Volume 5m: $${tokenData.volume5m?.toLocaleString() || 0}
Price change 5m: ${tokenData.priceChange5m || 0}%
Reasons dari engine: ${riskResult.reasons.join("; ")}

Berikan: 1) summary, 2) detailed reason, 3) risk note, 4) suggested action (WATCH/PAPER_BUY/PAPER_EXIT/REJECT/WAIT)`
  );

  if (aiResponse) {
    return parseAiTokenResponse(aiResponse, riskResult);
  }

  return generateFallbackTokenExplanation(tokenData, riskResult);
}

/**
 * Explain a trading signal in natural language.
 */
export async function explainSignal(
  signalData: SignalData
): Promise<SignalExplanation> {
  const aiResponse = await callOpenAI(
    SYSTEM_PROMPT_BASE,
    `Jelaskan signal trading ini untuk paper trading:
Token: ${signalData.token}
Signal Type: ${signalData.type}
Confidence: ${signalData.confidence}%
Wallet Source: ${signalData.walletCopied}
Original Reason: ${signalData.reason}
Risk Note: ${signalData.riskNote}
Price 24h: ${signalData.priceChange24h}%

Berikan penjelasan ulang yang lebih jelas: 1) summary, 2) detailed reason, 3) risk note, 4) suggested action (WATCH/PAPER_BUY/PAPER_EXIT/REJECT/WAIT)`
  );

  if (aiResponse) {
    return parseAiSignalResponse(aiResponse, signalData);
  }

  return generateFallbackSignalExplanation(signalData);
}

// ---- Fallback Generators (No AI Needed) ----

function generateFallbackWalletExplanation(
  walletData: Partial<WalletScoringInput> & { label?: string },
  scoreResult: WalletScoringResult
): WalletExplanation {
  const { copyScore, status, reasons } = scoreResult;

  let suggestedAction: SuggestedAction;
  let summary: string;

  if (status === "GOOD") {
    suggestedAction = "PAPER_BUY";
    summary = `Wallet ${walletData.label || "ini"} layak di-copy (score ${copyScore}/100).`;
  } else if (status === "TESTING") {
    suggestedAction = "WATCH";
    summary = `Wallet ${walletData.label || "ini"} menarik tapi perlu uji lebih lanjut (score ${copyScore}/100).`;
  } else if (status === "WATCHLIST") {
    suggestedAction = "WAIT";
    summary = `Wallet ${walletData.label || "ini"} masuk watchlist — belum cukup data (score ${copyScore}/100).`;
  } else if (status === "REJECTED") {
    suggestedAction = "REJECT";
    summary = `Wallet ${walletData.label || "ini"} tidak layak di-copy (score ${copyScore}/100).`;
  } else {
    suggestedAction = "WAIT";
    summary = `Wallet ${walletData.label || "ini"} berstatus neutral — perlu monitoring (score ${copyScore}/100).`;
  }

  return {
    summary,
    detailedReason: reasons.length > 0
      ? reasons.join(". ") + "."
      : "Tidak ada detail tambahan dari scoring engine.",
    riskNote: copyScore < 40
      ? "Score rendah — jangan copy wallet ini untuk paper trading."
      : copyScore < 70
      ? "Score menengah — gunakan position size kecil jika paper buy."
      : "Score bagus — wallet ini konsisten dalam periode analisis.",
    suggestedAction,
  };
}

function generateFallbackTokenExplanation(
  tokenData: Partial<TokenMarketData>,
  riskResult: TokenRiskResult
): TokenRiskExplanation {
  const { riskScore, status, reasons } = riskResult;

  let suggestedAction: SuggestedAction;
  let summary: string;

  if (status === "LOW") {
    suggestedAction = "PAPER_BUY";
    summary = `Token ${tokenData.symbol || "ini"} relatif aman (risk ${riskScore}/100).`;
  } else if (status === "MEDIUM") {
    suggestedAction = "WATCH";
    summary = `Token ${tokenData.symbol || "ini"} perlu perhatian ekstra (risk ${riskScore}/100).`;
  } else if (status === "HIGH") {
    suggestedAction = "WAIT";
    summary = `Token ${tokenData.symbol || "ini"} berisiko tinggi (risk ${riskScore}/100).`;
  } else {
    suggestedAction = "REJECT";
    summary = `Token ${tokenData.symbol || "ini"} sebaiknya dihindari (risk ${riskScore}/100).`;
  }

  return {
    summary,
    detailedReason: reasons.length > 0
      ? reasons.join(". ") + "."
      : "Token memiliki parameter pasar yang normal.",
    riskNote: riskScore >= 70
      ? "SANGAT BERISIKO — jangan entry bahkan paper trade."
      : riskScore >= 45
      ? "Risiko tinggi — jika entry, gunakan size sangat kecil dengan stop loss ketat."
      : riskScore >= 20
      ? "Risiko menengah — pastikan liquidity cukup sebelum entry."
      : "Risiko rendah — parameter pasar terlihat sehat.",
    suggestedAction,
  };
}

function generateFallbackSignalExplanation(
  signalData: SignalData
): SignalExplanation {
  let suggestedAction: SuggestedAction;

  switch (signalData.type) {
    case "BUY":
      suggestedAction = "PAPER_BUY";
      break;
    case "EXIT":
      suggestedAction = "PAPER_EXIT";
      break;
    case "REJECT":
    case "WARNING":
      suggestedAction = "REJECT";
      break;
    case "WAIT":
    default:
      suggestedAction = "WAIT";
      break;
  }

  return {
    summary: `Signal ${signalData.type} untuk ${signalData.token} dari ${signalData.walletCopied} (confidence ${signalData.confidence}%).`,
    detailedReason: signalData.reason,
    riskNote: signalData.riskNote,
    suggestedAction,
  };
}

// ---- AI Response Parsers ----

function parseAiWalletResponse(aiText: string, scoreResult: WalletScoringResult): WalletExplanation {
  // Simple parsing — AI might not follow format perfectly
  const action = extractAction(aiText);
  return {
    summary: extractSection(aiText, "summary") || `Score: ${scoreResult.copyScore}/100, Status: ${scoreResult.status}`,
    detailedReason: extractSection(aiText, "reason") || scoreResult.reasons.join(". "),
    riskNote: extractSection(aiText, "risk") || "Lihat detail scoring untuk info lebih lanjut.",
    suggestedAction: action,
  };
}

function parseAiTokenResponse(aiText: string, riskResult: TokenRiskResult): TokenRiskExplanation {
  const action = extractAction(aiText);
  return {
    summary: extractSection(aiText, "summary") || `Risk: ${riskResult.riskScore}/100, Status: ${riskResult.status}`,
    detailedReason: extractSection(aiText, "reason") || riskResult.reasons.join(". "),
    riskNote: extractSection(aiText, "risk") || "Periksa liquidity dan volume sebelum entry.",
    suggestedAction: action,
  };
}

function parseAiSignalResponse(aiText: string, signalData: SignalData): SignalExplanation {
  const action = extractAction(aiText);
  return {
    summary: extractSection(aiText, "summary") || `${signalData.type} signal for ${signalData.token}`,
    detailedReason: extractSection(aiText, "reason") || signalData.reason,
    riskNote: extractSection(aiText, "risk") || signalData.riskNote,
    suggestedAction: action,
  };
}

// ---- Utility ----

const VALID_ACTIONS: SuggestedAction[] = ["WATCH", "PAPER_BUY", "PAPER_EXIT", "REJECT", "WAIT"];

function extractAction(text: string): SuggestedAction {
  const upper = text.toUpperCase();
  for (const action of VALID_ACTIONS) {
    if (upper.includes(action)) return action;
  }
  return "WAIT"; // safe default
}

function extractSection(text: string, section: "summary" | "reason" | "risk"): string | null {
  const patterns: Record<string, RegExp[]> = {
    summary: [/summary[:\s]*(.+?)(?:\n|$)/i, /1\)\s*(.+?)(?:\n|$)/i],
    reason: [/reason[:\s]*(.+?)(?:\n|risk|$)/is, /2\)\s*(.+?)(?:\n|3\)|$)/is],
    risk: [/risk[:\s]*(.+?)(?:\n|suggest|action|$)/is, /3\)\s*(.+?)(?:\n|4\)|$)/is],
  };

  for (const pattern of patterns[section]) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }
  return null;
}
