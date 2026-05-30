import { NextRequest, NextResponse } from "next/server";
import { getLatestTokenPairs, getTokenPairs, mapPair, pickBestPair, searchPairs } from "@/lib/market/dexscreener";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const tokenAddress = searchParams.get("tokenAddress");
    const chainId = searchParams.get("chainId") || process.env.CHAIN_ID || "solana";

    if (!query && !tokenAddress) {
      return NextResponse.json(
        {
          success: false,
          source: "dexscreener",
          error: "Missing query. Use ?q=SOL or ?tokenAddress=TOKEN_ADDRESS",
        },
        { status: 400 }
      );
    }

    const pairs = tokenAddress
      ? await getTokenPairs(chainId, tokenAddress).catch(() => getLatestTokenPairs(tokenAddress))
      : await searchPairs(query || "");

    const bestPair = pickBestPair(pairs);
    const mappedPairs = pairs.map(mapPair).filter(Boolean);

    return NextResponse.json({
      success: true,
      source: "dexscreener",
      chainId,
      query: query || null,
      tokenAddress: tokenAddress || null,
      count: mappedPairs.length,
      bestPair: mapPair(bestPair),
      pairs: mappedPairs,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        source: "dexscreener-error",
        error: error instanceof Error ? error.message : "Unknown DexScreener error",
      },
      { status: 500 }
    );
  }
}
