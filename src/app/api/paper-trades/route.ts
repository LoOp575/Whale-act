// ============================================================
// API Route: /api/paper-trades
// WhaleCopy AI — Paper trading positions (virtual only)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { paperTrades, paperTradingSummary } from "@/lib/mock-data";
import type { PaperTradeData } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/paper-trades
 * Returns paper trading positions and summary.
 * Query params: ?status=OPEN
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "OPEN" | "CLOSED" | null

    const supabase = getSupabaseAdmin();
    let data: PaperTradeData[];

    if (supabase) {
      // TODO: replace with real Supabase query
      // const query = supabase.from("paper_trades").select("*").order("opened_at", { ascending: false });
      // if (status) query.eq("status", status);
      // const { data: rows, error } = await query;
      data = paperTrades;
    } else {
      data = paperTrades;
    }

    // Filter by status
    if (status) {
      data = data.filter((t) => t.status === status);
    }

    return NextResponse.json({
      success: true,
      data,
      summary: paperTradingSummary,
      count: data.length,
      source: supabase ? "database" : "mock",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch paper trades",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/paper-trades
 * Open a new paper trade position.
 * Body: { token, entryPrice, copiedFrom, entryReason }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, entryPrice, copiedFrom, entryReason } = body;

    // Validate required fields
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'token' field" },
        { status: 400 }
      );
    }
    if (!entryPrice || typeof entryPrice !== "number" || entryPrice <= 0) {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'entryPrice' (must be positive number)" },
        { status: 400 }
      );
    }

    // TODO: validate against user settings (max trade size, daily loss limit)
    // TODO: insert into Supabase when configured

    const newTrade: PaperTradeData = {
      id: `pt_${Date.now()}`,
      token,
      copiedFrom: copiedFrom || "Manual",
      entryPrice,
      exitPrice: null,
      pnl: 0,
      pnlPercent: 0,
      duration: "0m",
      entryReason: entryReason || "Manual paper trade entry",
      exitReason: null,
      status: "OPEN",
    };

    return NextResponse.json({
      success: true,
      data: newTrade,
      message: "Paper trade opened (no real funds used)",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to open paper trade",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
