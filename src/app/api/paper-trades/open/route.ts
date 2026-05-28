// POST /api/paper-trades/open
// Open a new paper trade — no real funds, no private keys.

import { NextRequest, NextResponse } from "next/server";
import { openPaperTrade } from "@/lib/engines/paperTradingEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, tokenAddress, copiedWallet, signalType, entryPrice, entryReason, sizeUsd } = body;

    if (!token || !entryPrice || !signalType) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: token, entryPrice, signalType" },
        { status: 400 }
      );
    }

    const result = openPaperTrade({
      token,
      tokenAddress,
      copiedWallet: copiedWallet || "Manual",
      signalType,
      entryPrice,
      entryReason: entryReason || "Manual paper trade",
      sizeUsd,
    });

    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: "Paper trade opened (no real funds used)",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to open paper trade", message: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
