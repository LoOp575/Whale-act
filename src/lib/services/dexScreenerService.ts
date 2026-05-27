// ============================================================
// DexScreener Service (Read-Only — Token Market Data)
// WhaleCopy AI — No trading, no buy/sell, read data only
// ============================================================

import { publicConfig } from "@/lib/config";

// ---- Types ----

export interface DexPairRaw {
  chainId: string;
  dexId: string;
  url: string;
  pairAddress: string;
  baseToken: {
    address: string;
    name: string;
    symbol: string;
  };
  quoteToken: {
    address: string;
    name: string;
    symbol: string;
  };
  priceNative: string;
  priceUsd: string;
  txns: {
    m5: { buys: number; sells: number };
    h1: { buys: number; sells: number };
    h24: { buys: number; sells: number };
  };
  volume: {
    m5: number;
    h1: number;
    h24: number;
  };
  priceChange: {
    m5: number;
    h1: number;
    h24: number;
  };
  liquidity: {
    usd: number;
    base: number;
    quote: number;
  };
  fdv: number;
  pairCreatedAt: number;
}

export interface TokenMarketData {
  tokenAddress: string;
  symbol: string;
  name: string;
  priceUsd: number;
  liquidityUsd: number;
  volume5m: number;
  volume1h: number;
  volume24h: number;
  txns5m: number;
  buyCount5m: number;
  sellCount5m: number;
  priceChange5m: number;
  priceChange1h: number;
  priceChange24h: number;
  fdv: number;
  pairAddress: string;
  dexId: string;
  chainId: string;
}

// ---- Config ----

const BASE_URL = publicConfig.dexScreenerBaseUrl || "https://api.dexscreener.com";
const TIMEOUT_MS = 8000;

// ---- Helpers ----

/**
 * Fetch with timeout — prevents hanging requests
 */
async function fetchWithTimeout(url: string, timeoutMs: number = TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { "Accept": "application/json" },
    });
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Normalize raw DexScreener pair data into our clean format
 */
export function normalizeDexTokenData(raw: DexPairRaw): TokenMarketData {
  return {
    tokenAddress: raw.baseToken.address,
    symbol: raw.baseToken.symbol,
    name: raw.baseToken.name,
    priceUsd: parseFloat(raw.priceUsd) || 0,
    liquidityUsd: raw.liquidity?.usd || 0,
    volume5m: raw.volume?.m5 || 0,
    volume1h: raw.volume?.h1 || 0,
    volume24h: raw.volume?.h24 || 0,
    txns5m: (raw.txns?.m5?.buys || 0) + (raw.txns?.m5?.sells || 0),
    buyCount5m: raw.txns?.m5?.buys || 0,
    sellCount5m: raw.txns?.m5?.sells || 0,
    priceChange5m: raw.priceChange?.m5 || 0,
    priceChange1h: raw.priceChange?.h1 || 0,
    priceChange24h: raw.priceChange?.h24 || 0,
    fdv: raw.fdv || 0,
    pairAddress: raw.pairAddress,
    dexId: raw.dexId,
    chainId: raw.chainId,
  };
}

// ---- Service Functions (Read-Only) ----

/**
 * Fetch token pairs from DexScreener
 * GET /latest/dex/tokens/{tokenAddress}
 * Returns all trading pairs for a token on a specific chain.
 */
export async function fetchTokenPairs(
  chainId: string,
  tokenAddress: string
): Promise<TokenMarketData[]> {
  try {
    const url = `${BASE_URL}/latest/dex/tokens/${tokenAddress}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) {
      console.warn(`[DexScreener] HTTP ${response.status} for token ${tokenAddress}`);
      return [];
    }

    const json = await response.json();
    const pairs: DexPairRaw[] = json.pairs || [];

    if (pairs.length === 0) return [];

    // Filter by chain and normalize
    return pairs
      .filter((pair) => pair.chainId === chainId)
      .map(normalizeDexTokenData);
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      console.warn(`[DexScreener] Timeout fetching token ${tokenAddress}`);
    } else {
      console.error(`[DexScreener] Error fetching token pairs:`, error);
    }
    return [];
  }
}

/**
 * Fetch token profile (best pair by liquidity)
 * Returns the single highest-liquidity pair data for a token.
 */
export async function fetchTokenProfile(
  chainId: string,
  tokenAddress: string
): Promise<TokenMarketData | null> {
  const pairs = await fetchTokenPairs(chainId, tokenAddress);

  if (pairs.length === 0) return null;

  // Return pair with highest liquidity
  return pairs.sort((a, b) => b.liquidityUsd - a.liquidityUsd)[0];
}

// ---- Keep existing placeholders for backward compat ----

export async function fetchTokenData(tokenAddress: string): Promise<TokenMarketData | null> {
  return fetchTokenProfile("solana", tokenAddress);
}

export async function fetchMultipleTokens(tokenAddresses: string[]): Promise<TokenMarketData[]> {
  // DexScreener supports comma-separated addresses
  try {
    if (tokenAddresses.length === 0) return [];

    const batch = tokenAddresses.slice(0, 30).join(",");
    const url = `${BASE_URL}/latest/dex/tokens/${batch}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) return [];

    const json = await response.json();
    const pairs: DexPairRaw[] = json.pairs || [];

    // Get best pair per token (highest liquidity)
    const tokenMap = new Map<string, TokenMarketData>();
    for (const pair of pairs) {
      const normalized = normalizeDexTokenData(pair);
      const existing = tokenMap.get(normalized.tokenAddress);
      if (!existing || normalized.liquidityUsd > existing.liquidityUsd) {
        tokenMap.set(normalized.tokenAddress, normalized);
      }
    }

    return Array.from(tokenMap.values());
  } catch (error) {
    console.error("[DexScreener] Error fetching multiple tokens:", error);
    return [];
  }
}

export async function searchTokens(query: string): Promise<TokenMarketData[]> {
  try {
    if (!query || query.length < 2) return [];

    const url = `${BASE_URL}/latest/dex/search?q=${encodeURIComponent(query)}`;
    const response = await fetchWithTimeout(url);

    if (!response.ok) return [];

    const json = await response.json();
    const pairs: DexPairRaw[] = json.pairs || [];

    return pairs.slice(0, 10).map(normalizeDexTokenData);
  } catch (error) {
    console.error("[DexScreener] Error searching tokens:", error);
    return [];
  }
}

export async function checkLiquidity(
  tokenAddress: string,
  minLiquidity: number
): Promise<{ meetsThreshold: boolean; currentLiquidity: number }> {
  const profile = await fetchTokenProfile("solana", tokenAddress);

  if (!profile) {
    return { meetsThreshold: false, currentLiquidity: 0 };
  }

  return {
    meetsThreshold: profile.liquidityUsd >= minLiquidity,
    currentLiquidity: profile.liquidityUsd,
  };
}
