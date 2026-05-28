// GET /api/paper-trades/summary
// Returns paper trading performance summary.

import { NextResponse } from "next/server";
import { getPaperTradingSummary, getAllTrades } from "@/lib/engines/paperTradingEngine";

export async function GET() {
  try {
    const summary = getPaperTradingSummary();
    const trades = getAllTrades();

    return NextResponse.json({
      success: true,
      data: { summary, trades },
      message: "Paper trading summary (no real funds)",
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to get summary", message: error instanceof Error ? error.message : "Unknown" },
      { status: 500 }
    );
  }
}
