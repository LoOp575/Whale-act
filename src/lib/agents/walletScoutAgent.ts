// ============================================================
// Wallet Scout Agent — Evaluates candidate wallets
// WhaleCopy AI — No live trading. No private keys.
// ============================================================

import {
  fetchWalletTransactions,
  parseWalletSwaps,
  summarizeWalletActivity,
} from "@/lib/services/heliusService";
import { scoreWallet } from "@/lib/engines/walletScoringEngine";
import type { WalletScoringInput, WalletScoringResult } from "@/lib/engines/walletScoringEngine";
import { wallets } from "@/lib/mock-data";

// ---- Types ----

export interface WalletCandidate {
  address: string;
  label?: string;
}

export interface ScoutedWallet {
  address: string;
  label: string;
  score: WalletScoringResult;
  summary: {
    totalTransactions: number;
    buyCount: number;
    sellCount: number;
    uniqueTokens: number;
  };
}

export interface WalletScoutResult {
  topWallets: ScoutedWallet[];
  rejectedWallets: ScoutedWallet[];
  agentSummary: string;
  agentLog: AgentLogEntry;
}

export interface AgentLogEntry {
  agentName: string;
  action: string;
  inputSummary: string;
  outputSummary: string;
  timestamp: string;
}

// ---- Agent ----

/**
 * Wallet Scout Agent
 *
 * Evaluates a list of candidate wallets by:
 * 1. Fetching transaction history (via Helius or mock)
 * 2. Parsing swap events
 * 3. Summarizing activity
 * 4. Running wallet scoring engine
 * 5. Categorizing into top vs rejected
 *
 * Does NOT:
 * - Discover wallets from blockchain (manual candidates only)
 * - Execute any trades
 * - Create or use private keys
 */
export async function runWalletScout(
  candidates?: WalletCandidate[]
): Promise<WalletScoutResult> {
  const startTime = Date.now();

  // Use provided candidates or fall back to mock wallet list
  const walletCandidates: WalletCandidate[] = candidates || wallets.map((w) => ({
    address: w.address,
    label: w.label,
  }));

  const scoutedWallets: ScoutedWallet[] = [];

  // Process each candidate
  for (const candidate of walletCandidates) {
    try {
      // 1. Fetch transactions (read-only)
      const { transactions } = await fetchWalletTransactions(candidate.address, 30);

      // 2. Parse into swaps
      const swaps = parseWalletSwaps(transactions, candidate.address);

      // 3. Summarize activity
      const summary = summarizeWalletActivity(swaps);

      // 4. Build scoring input from parsed data
      const totalTrades = summary.buyCount + summary.sellCount;
      const scoringInput: WalletScoringInput = {
        roi24h: 0, // Cannot determine without price history
        realizedPnl24h: 0, // Cannot determine without USD values
        winrate24h: totalTrades > 0 ? (summary.buyCount / totalTrades) * 100 : 0,
        winrate7d: totalTrades > 0 ? (summary.buyCount / totalTrades) * 100 : 0,
        tradeCount: totalTrades,
        profitableTradeCount: summary.buyCount,
        avgHoldMinutes: 60, // Default estimate without entry/exit pairing
        avgTokenLiquidityUsd: 50000, // Default assumption
        lowLiquidityTradeCount: 0,
        totalTradeCount: summary.totalTransactions,
        riskHistory: 0,
      };

      // 5. Score
      const score = scoreWallet(scoringInput);

      scoutedWallets.push({
        address: candidate.address,
        label: candidate.label || `Wallet ${candidate.address.slice(0, 8)}`,
        score,
        summary: {
          totalTransactions: summary.totalTransactions,
          buyCount: summary.buyCount,
          sellCount: summary.sellCount,
          uniqueTokens: summary.uniqueTokens,
        },
      });
    } catch (error) {
      // Skip wallet on error, don't crash entire agent
      console.error(`[WalletScout] Failed to process ${candidate.address}:`, error);
    }
  }

  // Categorize results
  const topWallets = scoutedWallets
    .filter((w) => w.score.status === "GOOD" || w.score.status === "TESTING")
    .sort((a, b) => b.score.copyScore - a.score.copyScore);

  const rejectedWallets = scoutedWallets
    .filter((w) => w.score.status === "REJECTED")
    .sort((a, b) => a.score.copyScore - b.score.copyScore);

  // Build summary
  const elapsed = Date.now() - startTime;
  const agentSummary = [
    `Wallet Scout selesai dalam ${elapsed}ms.`,
    `Kandidat: ${walletCandidates.length} wallet.`,
    `Top wallets (GOOD/TESTING): ${topWallets.length}.`,
    `Rejected: ${rejectedWallets.length}.`,
    `Watchlist/Neutral: ${scoutedWallets.length - topWallets.length - rejectedWallets.length}.`,
  ].join(" ");

  // Agent log entry
  const agentLog: AgentLogEntry = {
    agentName: "wallet_scout",
    action: "scan_candidates",
    inputSummary: `${walletCandidates.length} candidate wallets`,
    outputSummary: `${topWallets.length} top, ${rejectedWallets.length} rejected, ${elapsed}ms`,
    timestamp: new Date().toISOString(),
  };

  return {
    topWallets,
    rejectedWallets,
    agentSummary,
    agentLog,
  };
}
