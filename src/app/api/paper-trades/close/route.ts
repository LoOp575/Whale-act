// POST /api/paper-trades/close
// Close an existing paper trade — calculates PnL.

import { NextRequest, NextResponse } from "next/server";
import { closePaperTrade } from "@/lib/engines/paperTradingEngine";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tradeId, exitPrice, exitReason } = body;

    if (!tradeId || !exitPrice) {
      return NextResponse.json(
        { success: false, error: "Missing required fields: tradeId, exitPrice" },
        { status: 400 }
      );
    }

    const result = closePaperTrade(tradeId, exitPrice, exitReason || "Manual close");

    if ("error" in result) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result,
      message: `Paper trade closed. PnL: ${result.pnlPercent >= 0 ? "+" : ""}${result.pnlPercent}% ($${result.pnlUsd})`,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to close paper trade", message: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
