// ============================================================
// Helius Service — Read-Only Solana Wallet Tracking
// WhaleCopy AI — No sending transactions. No private keys.
// ============================================================

import { wallets, activities } from "@/lib/mock-data";
import type { WalletData } from "@/lib/mock-data";
import { serverConfig, isApiConfigured } from "@/lib/config";

// ---- Types ----

export interface HeliusTransaction {
  signature: string;
  timestamp: number;
  type: string;
  source: string;
  fee: number;
  description: string;
  tokenTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    mint: string;
    tokenAmount: number;
    tokenStandard: string;
  }[];
  nativeTransfers: {
    fromUserAccount: string;
    toUserAccount: string;
    amount: number;
  }[];
  accountData: {
    account: string;
    nativeBalanceChange: number;
    tokenBalanceChanges: {
      mint: string;
      rawTokenAmount: { tokenAmount: string; decimals: number };
      userAccount: string;
    }[];
  }[];
}

export interface ParsedSwap {
  signature: string;
  timestamp: number;
  tokenIn: string;
  tokenOut: string;
  amountIn: number;
  amountOut: number;
  side: "buy" | "sell" | "swap";
  source: string;
}

export interface BuySellEvent {
  signature: string;
  timestamp: number;
  action: "bought" | "sold";
  token: string;
  amount: number;
  estimatedValueUsd: number;
  source: string;
}

export interface WalletScanSummary {
  totalTransactions: number;
  buyCount: number;
  sellCount: number;
  swapCount: number;
  uniqueTokens: number;
  firstSeen: number | null;
  lastSeen: number | null;
}

// ---- Config ----

const HELIUS_BASE = "https://api.helius.xyz";
const TIMEOUT_MS = 10000;

// ---- Helpers ----

async function heliusFetch(endpoint: string): Promise<Response | null> {
  const apiKey = serverConfig.heliusApiKey;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${HELIUS_BASE}${endpoint}?api-key=${apiKey}`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[Helius] Request timeout");
    } else {
      console.error("[Helius] Fetch error:", error);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

async function heliusPost(endpoint: string, body: object): Promise<Response | null> {
  const apiKey = serverConfig.heliusApiKey;
  if (!apiKey) return null;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const url = `${HELIUS_BASE}${endpoint}?api-key=${apiKey}`;
    const response = await fetch(url, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("[Helius] Request timeout");
    } else {
      console.error("[Helius] Fetch error:", error);
    }
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

// ---- Mock Data (fallback) ----

function getMockTransactions(walletAddress: string): HeliusTransaction[] {
  return [
    {
      signature: "4xK9mock...signature1",
      timestamp: Date.now() / 1000 - 120,
      type: "SWAP",
      source: "RAYDIUM",
      fee: 5000,
      description: `${walletAddress.slice(0, 6)} swapped SOL for JUP`,
      tokenTransfers: [
        { fromUserAccount: walletAddress, toUserAccount: "pool", mint: "SOL_MINT", tokenAmount: 50, tokenStandard: "native" },
        { fromUserAccount: "pool", toUserAccount: walletAddress, mint: "JUP_MINT", tokenAmount: 4500, tokenStandard: "fungible" },
      ],
      nativeTransfers: [],
      accountData: [],
    },
    {
      signature: "7tLmock...signature2",
      timestamp: Date.now() / 1000 - 600,
      type: "SWAP",
      source: "JUPITER",
      fee: 5000,
      description: `${walletAddress.slice(0, 6)} swapped USDC for SOL`,
      tokenTransfers: [
        { fromUserAccount: walletAddress, toUserAccount: "pool", mint: "USDC_MINT", tokenAmount: 10000, tokenStandard: "fungible" },
        { fromUserAccount: "pool", toUserAccount: walletAddress, mint: "SOL_MINT", tokenAmount: 57, tokenStandard: "native" },
      ],
      nativeTransfers: [],
      accountData: [],
    },
    {
      signature: "9cYmock...signature3",
      timestamp: Date.now() / 1000 - 1800,
      type: "SWAP",
      source: "RAYDIUM",
      fee: 5000,
      description: `${walletAddress.slice(0, 6)} swapped WIF for SOL`,
      tokenTransfers: [
        { fromUserAccount: walletAddress, toUserAccount: "pool", mint: "WIF_MINT", tokenAmount: 25000, tokenStandard: "fungible" },
        { fromUserAccount: "pool", toUserAccount: walletAddress, mint: "SOL_MINT", tokenAmount: 120, tokenStandard: "native" },
      ],
      nativeTransfers: [],
      accountData: [],
    },
  ];
}

// ---- Service Functions (Read-Only) ----

/**
 * Fetch wallet transaction history from Helius.
 * Returns parsed enhanced transactions.
 * Falls back to mock data if HELIUS_API_KEY not set.
 *
 * READ-ONLY: This only reads blockchain data. No sending.
 */
export async function fetchWalletTransactions(
  walletAddress: string,
  limit: number = 50
): Promise<{ transactions: HeliusTransaction[]; mode: "live-readonly" | "mock" }> {
  if (!serverConfig.heliusApiKey) {
    return {
      transactions: getMockTransactions(walletAddress),
      mode: "mock",
    };
  }

  try {
    const response = await heliusPost("/v0/addresses/" + walletAddress + "/transactions", {
      limit,
      type: "SWAP",
    });

    if (!response || !response.ok) {
      console.warn(`[Helius] HTTP ${response?.status} for wallet ${walletAddress}`);
      return {
        transactions: getMockTransactions(walletAddress),
        mode: "mock",
      };
    }

    const data: HeliusTransaction[] = await response.json();
    return { transactions: data, mode: "live-readonly" };
  } catch (error) {
    console.error("[Helius] Failed to fetch transactions:", error);
    return {
      transactions: getMockTransactions(walletAddress),
      mode: "mock",
    };
  }
}

/**
 * Parse raw Helius transactions into swap events.
 * Extracts tokenIn, tokenOut, amounts from token transfers.
 */
export function parseWalletSwaps(
  transactions: HeliusTransaction[],
  walletAddress: string
): ParsedSwap[] {
  const swaps: ParsedSwap[] = [];

  for (const tx of transactions) {
    if (!tx.tokenTransfers || tx.tokenTransfers.length < 2) continue;

    // Find what went out (from wallet) and what came in (to wallet)
    const outTransfers = tx.tokenTransfers.filter(
      (t) => t.fromUserAccount?.toLowerCase() === walletAddress.toLowerCase()
    );
    const inTransfers = tx.tokenTransfers.filter(
      (t) => t.toUserAccount?.toLowerCase() === walletAddress.toLowerCase()
    );

    if (outTransfers.length === 0 || inTransfers.length === 0) continue;

    const tokenOut = outTransfers[0];
    const tokenIn = inTransfers[0];

    // Determine side based on common patterns
    const STABLECOINS = ["USDC_MINT", "USDT_MINT", "UST_MINT"];
    const SOL_MINTS = ["SOL_MINT", "So11111111111111111111111111111111111111112"];

    let side: "buy" | "sell" | "swap" = "swap";
    if (STABLECOINS.includes(tokenOut.mint) || SOL_MINTS.includes(tokenOut.mint)) {
      side = "buy"; // Spending stable/SOL to get token = buying
    } else if (STABLECOINS.includes(tokenIn.mint) || SOL_MINTS.includes(tokenIn.mint)) {
      side = "sell"; // Getting stable/SOL back = selling
    }

    swaps.push({
      signature: tx.signature,
      timestamp: tx.timestamp,
      tokenIn: tokenIn.mint,
      tokenOut: tokenOut.mint,
      amountIn: tokenIn.tokenAmount,
      amountOut: tokenOut.tokenAmount,
      side,
      source: tx.source || "unknown",
    });
  }

  return swaps;
}

/**
 * Convert parsed swaps into simplified buy/sell events.
 * Used for display in Live Activity and Wallet Scan.
 */
export function detectBuySellEvents(parsedSwaps: ParsedSwap[]): BuySellEvent[] {
  return parsedSwaps
    .filter((swap) => swap.side === "buy" || swap.side === "sell")
    .map((swap) => ({
      signature: swap.signature,
      timestamp: swap.timestamp,
      action: swap.side === "buy" ? "bought" as const : "sold" as const,
      token: swap.side === "buy" ? swap.tokenIn : swap.tokenOut,
      amount: swap.side === "buy" ? swap.amountIn : swap.amountOut,
      estimatedValueUsd: 0, // TODO: cross-reference with DexScreener for USD value
      source: swap.source,
    }));
}

/**
 * Generate summary stats from parsed swaps.
 */
export function summarizeWalletActivity(swaps: ParsedSwap[]): WalletScanSummary {
  const buys = swaps.filter((s) => s.side === "buy");
  const sells = swaps.filter((s) => s.side === "sell");
  const swapOnly = swaps.filter((s) => s.side === "swap");

  const allTokens = new Set<string>();
  swaps.forEach((s) => {
    allTokens.add(s.tokenIn);
    allTokens.add(s.tokenOut);
  });

  const timestamps = swaps.map((s) => s.timestamp).filter((t) => t > 0);

  return {
    totalTransactions: swaps.length,
    buyCount: buys.length,
    sellCount: sells.length,
    swapCount: swapOnly.length,
    uniqueTokens: allTokens.size,
    firstSeen: timestamps.length > 0 ? Math.min(...timestamps) : null,
    lastSeen: timestamps.length > 0 ? Math.max(...timestamps) : null,
  };
}

// ---- Keep existing exports for backward compat ----

export async function fetchTopWallets(): Promise<WalletData[]> {
  if (!isApiConfigured()) return wallets;
  return wallets;
}

export async function fetchWalletBalance(walletAddress: string): Promise<{
  sol: number;
  tokens: { mint: string; amount: number; symbol: string }[];
}> {
  // TODO: implement with Helius getBalances
  return { sol: 0, tokens: [] };
}

export async function subscribeToWallet(walletAddress: string): Promise<{
  webhookId: string;
  status: "active" | "error";
}> {
  // TODO: implement Helius webhook
  return { webhookId: "placeholder", status: "active" };
}
