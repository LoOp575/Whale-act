// ============================================================
// API Route: /api/signals
// WhaleCopy AI — Returns AI signals from mock/database
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { signals } from "@/lib/mock-data";
import type { SignalData, SignalType } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/signals
 * Returns AI-generated trading signals.
 * Query params: ?type=BUY&limit=10
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") as SignalType | null;
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const supabase = getSupabaseAdmin();
    let data: SignalData[];

    if (supabase) {
      // TODO: replace with real Supabase query
      // const query = supabase.from("signals").select("*").order("created_at", { ascending: false }).limit(limit);
      // if (type) query.eq("signal_type", type);
      // const { data: rows, error } = await query;
      data = signals;
    } else {
      data = signals;
    }

    // Filter by type
    if (type) {
      data = data.filter((s) => s.type === type);
    }

    // Limit
    data = data.slice(0, limit);

    return NextResponse.json({
      success: true,
      data,
      count: data.length,
      source: supabase ? "database" : "mock",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch signals",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/signals
 * Manually trigger signal generation (for testing).
 * Body: { walletAddress?: string, tokenAddress?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { walletAddress, tokenAddress } = body;

    // TODO: implement real AI signal generation
    // - Call aiSignalService.generateSignals()
    // - Store in Supabase
    // - Return new signal

    const mockSignal: SignalData = {
      id: `s_${Date.now()}`,
      token: tokenAddress || "UNKNOWN",
      type: "WAIT",
      walletCopied: walletAddress || "Unknown Wallet",
      confidence: 50,
      reason: "Manual test signal — waiting for real AI integration.",
      riskNote: "No real analysis performed.",
      suggestedAction: "Ignore — this is a test signal.",
      priceChange24h: 0,
      volume24h: "$0",
      timestamp: "just now",
    };

    return NextResponse.json({
      success: true,
      data: mockSignal,
      message: "Test signal created (paper mode only)",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create signal",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
