// ============================================================
// API Route: POST /api/wallets/scan
// WhaleCopy AI — Scan a wallet's trading activity (read-only)
// No trading. No private keys. No auto-buy.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import {
  fetchWalletTransactions,
  parseWalletSwaps,
  detectBuySellEvents,
  summarizeWalletActivity,
} from "@/lib/services/heliusService";
import { scoreWallet } from "@/lib/engines/walletScoringEngine";
import type { WalletScoringInput } from "@/lib/engines/walletScoringEngine";

/**
 * POST /api/wallets/scan
 * Scans a wallet address and returns trading activity + score.
 *
 * Body: { "walletAddress": "ABC...xyz" }
 *
 * Response: {
 *   wallet, trades, summary, score, mode
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress } = body;

    // Validate input
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing or invalid 'walletAddress' field",
          example: { walletAddress: "7xKQ...92A" },
        },
        { status: 400 }
      );
    }

    if (walletAddress.length < 20) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid wallet address format (too short)",
        },
        { status: 400 }
      );
    }

    // 1. Fetch transactions (read-only)
    const { transactions, mode } = await fetchWalletTransactions(walletAddress);

    // 2. Parse swaps
    const swaps = parseWalletSwaps(transactions, walletAddress);

    // 3. Detect buy/sell events
    const trades = detectBuySellEvents(swaps);

    // 4. Generate summary
    const summary = summarizeWalletActivity(swaps);

    // 5. Score the wallet
    const buyCount = swaps.filter((s) => s.side === "buy").length;
    const sellCount = swaps.filter((s) => s.side === "sell").length;
    const totalTrades = buyCount + sellCount;

    const scoringInput: WalletScoringInput = {
      roi24h: 0, // Cannot calculate without price history
      realizedPnl24h: 0, // Cannot calculate without price data
      winrate24h: totalTrades > 0 ? (buyCount / totalTrades) * 100 : 0,
      winrate7d: totalTrades > 0 ? (buyCount / totalTrades) * 100 : 0,
      tradeCount: totalTrades,
      profitableTradeCount: buyCount, // Approximation without PnL data
      avgHoldMinutes: 0, // Cannot calculate without entry/exit pairing
      avgTokenLiquidityUsd: 50000, // Default assumption
      lowLiquidityTradeCount: 0,
      totalTradeCount: totalTrades,
      riskHistory: 0,
    };

    const score = scoreWallet(scoringInput);

    // Return response
    return NextResponse.json({
      success: true,
      wallet: walletAddress,
      trades,
      summary,
      score: {
        copyScore: score.copyScore,
        status: score.status,
        reasons: score.reasons,
      },
      mode,
      note: mode === "mock"
        ? "Running with mock data. Set HELIUS_API_KEY in .env.local for live blockchain reads."
        : "Reading live blockchain data (read-only). No transactions sent.",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to scan wallet",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
