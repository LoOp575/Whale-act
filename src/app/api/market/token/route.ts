// ============================================================
// API Route: /api/market/token
// WhaleCopy AI — Read-only token market data from DexScreener
// No trading. No buy/sell. Data only.
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { fetchTokenProfile } from "@/lib/services/dexScreenerService";
import type { TokenMarketData } from "@/lib/services/dexScreenerService";

// Mock token data for fallback when API fails
const MOCK_TOKEN: TokenMarketData = {
  tokenAddress: "So11111111111111111111111111111111111111112",
  symbol: "SOL",
  name: "Wrapped SOL",
  priceUsd: 175.42,
  liquidityUsd: 245000000,
  volume5m: 1250000,
  volume1h: 18400000,
  volume24h: 2400000000,
  txns5m: 342,
  buyCount5m: 198,
  sellCount5m: 144,
  priceChange5m: 0.12,
  priceChange1h: 0.85,
  priceChange24h: 5.2,
  fdv: 82000000000,
  pairAddress: "mock-pair",
  dexId: "raydium",
  chainId: "solana",
};

/**
 * GET /api/market/token?chainId=solana&tokenAddress=...
 * Returns normalized token market data.
 * Falls back to mock data if DexScreener is unreachable.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const chainId = searchParams.get("chainId") || "solana";
    const tokenAddress = searchParams.get("tokenAddress");

    if (!tokenAddress || typeof tokenAddress !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Missing 'tokenAddress' query parameter",
          example: "/api/market/token?chainId=solana&tokenAddress=So111...112",
        },
        { status: 400 }
      );
    }

    // Attempt real DexScreener fetch
    const data = await fetchTokenProfile(chainId, tokenAddress);

    if (data) {
      return NextResponse.json({
        success: true,
        data,
        source: "dexscreener",
      });
    }

    // Fallback to mock data with the requested address
    return NextResponse.json({
      success: true,
      data: { ...MOCK_TOKEN, tokenAddress, chainId },
      source: "mock",
      notice: "DexScreener unavailable or token not found. Returning mock data.",
    });
  } catch (error) {
    // Never crash — return mock data on error
    return NextResponse.json({
      success: true,
      data: MOCK_TOKEN,
      source: "mock",
      notice: "Request failed. Returning mock data.",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
}
