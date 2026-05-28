// ============================================================
// AI Analyst Service — Explains scoring results in natural language
// WhaleCopy AI — Read-only analysis. No trading execution.
// Supports OpenAI-compatible providers (OpenAI, Aixchia, etc.)
// ============================================================

import { serverConfig, isAiConfigured, getAiBaseUrl } from "@/lib/config";
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

// ---- OpenAI-Compatible Client (Server-Only) ----

/**
 * Call any OpenAI-compatible Chat Completions API.
 * Supports: OpenAI, Aixchia, Azure, local LLMs, etc.
 *
 * Uses:
 * - OPENAI_BASE_URL: custom endpoint (or default OpenAI)
 * - OPENAI_API_KEY: server-side only
 * - OPENAI_MODEL: configurable model name
 * - OPENAI_TEMPERATURE: response creativity
 * - OPENAI_MAX_TOKENS: response length limit
 *
 * NEVER sends: private keys, wallet seeds, real funds info.
 */
async function callChatCompletion(
  systemPrompt: string,
  userPrompt: string
): Promise<{ content: string | null; error: string | null }> {
  if (!isAiConfigured()) {
    return { content: null, error: "OPENAI_API_KEY not configured" };
  }

  const baseUrl = getAiBaseUrl();
  const endpoint = `${baseUrl}/v1/chat/completions`;

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${serverConfig.openaiApiKey}`,
      },
      body: JSON.stringify({
        model: serverConfig.openaiModel,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: serverConfig.openaiMaxTokens,
        temperature: serverConfig.openaiTemperature,
      }),
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "Unknown");
      return { content: null, error: `AI provider returned ${response.status}: ${errText.slice(0, 100)}` };
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content?.trim() || null;

    if (!content) {
      return { content: null, error: "AI returned empty response" };
    }

    return { content, error: null };
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    return { content: null, error: `AI call failed: ${msg}` };
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

// ---- Agent Log Helper ----

function createErrorLog(action: string, error: string) {
  return {
    agentName: "ai_analyst",
    action,
    error,
    timestamp: new Date().toISOString(),
  };
}

// ---- Service Functions ----

/**
 * Explain a wallet's copy score in natural language.
 * Uses AI if available, otherwise returns rule-based fallback.
 */
export async function explainWalletScore(
  walletData: Partial<WalletScoringInput> & { label?: string; address?: string },
  scoreResult: WalletScoringResult
): Promise<WalletExplanation & { agentLog?: ReturnType<typeof createErrorLog> }> {
  const { content, error } = await callChatCompletion(
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

  if (content) {
    return parseAiWalletResponse(content, scoreResult);
  }

  // Fallback + log error
  const fallback = generateFallbackWalletExplanation(walletData, scoreResult);
  return { ...fallback, agentLog: error ? createErrorLog("explain_wallet_score", error) : undefined };
}

/**
 * Explain a token's risk assessment in natural language.
 */
export async function explainTokenRisk(
  tokenData: Partial<TokenMarketData>,
  riskResult: TokenRiskResult
): Promise<TokenRiskExplanation & { agentLog?: ReturnType<typeof createErrorLog> }> {
  const { content, error } = await callChatCompletion(
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

  if (content) {
    return parseAiTokenResponse(content, riskResult);
  }

  const fallback = generateFallbackTokenExplanation(tokenData, riskResult);
  return { ...fallback, agentLog: error ? createErrorLog("explain_token_risk", error) : undefined };
}

/**
 * Explain a trading signal in natural language.
 */
export async function explainSignal(
  signalData: SignalData
): Promise<SignalExplanation & { agentLog?: ReturnType<typeof createErrorLog> }> {
  const { content, error } = await callChatCompletion(
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

  if (content) {
    return parseAiSignalResponse(content, signalData);
  }

  const fallback = generateFallbackSignalExplanation(signalData);
  return { ...fallback, agentLog: error ? createErrorLog("explain_signal", error) : undefined };
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
    detailedReason: reasons.length > 0 ? reasons.join(". ") + "." : "Tidak ada detail tambahan dari scoring engine.",
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
    detailedReason: reasons.length > 0 ? reasons.join(". ") + "." : "Token memiliki parameter pasar yang normal.",
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

function generateFallbackSignalExplanation(signalData: SignalData): SignalExplanation {
  let suggestedAction: SuggestedAction;

  switch (signalData.type) {
    case "BUY": suggestedAction = "PAPER_BUY"; break;
    case "EXIT": suggestedAction = "PAPER_EXIT"; break;
    case "REJECT":
    case "WARNING": suggestedAction = "REJECT"; break;
    case "WAIT":
    default: suggestedAction = "WAIT"; break;
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
    reason: [new RegExp("reason[:\\s]*(.+?)(?:\\n|risk|$)", "i"), new RegExp("2\\)\\s*(.+?)(?:\\n|3\\)|$)", "i")],
    risk: [new RegExp("risk[:\\s]*(.+?)(?:\\n|suggest|action|$)", "i"), new RegExp("3\\)\\s*(.+?)(?:\\n|4\\)|$)", "i")],
  };

  for (const pattern of patterns[section]) {
    const match = text.match(pattern);
    if (match && match[1]?.trim()) {
      return match[1].trim();
    }
  }
  return null;
}
