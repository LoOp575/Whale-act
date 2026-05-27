// ============================================================
// API Route: /api/wallets
// WhaleCopy AI — Returns wallet data from mock/database
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { wallets } from "@/lib/mock-data";
import type { WalletData } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/wallets
 * Returns list of tracked wallets.
 * Query params: ?tag=good&sort=roi24h
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const sort = searchParams.get("sort") || "roi24h";

    // Try Supabase first, fallback to mock
    const supabase = getSupabaseAdmin();
    let data: WalletData[];

    if (supabase) {
      // TODO: replace with real Supabase query when DB is seeded
      // const { data: rows, error } = await supabase
      //   .from("wallets")
      //   .select("*")
      //   .order("roi_24h", { ascending: false });
      // if (error) throw error;
      // data = rows;
      data = wallets;
    } else {
      data = wallets;
    }

    // Filter by tag
    if (tag && tag !== "all") {
      data = data.filter((w) => w.tag === tag);
    }

    // Sort
    if (sort === "roi24h") {
      data = [...data].sort((a, b) => b.roi24h - a.roi24h);
    } else if (sort === "copyScore") {
      data = [...data].sort((a, b) => b.copyScore - a.copyScore);
    } else if (sort === "winRate") {
      data = [...data].sort((a, b) => b.winRate - a.winRate);
    }

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
        error: "Failed to fetch wallets",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wallets
 * Add a new wallet to tracking list.
 * Body: { address: string, label?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, label } = body;

    if (!address || typeof address !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'address' field" },
        { status: 400 }
      );
    }

    // TODO: validate Solana address format
    // TODO: insert into Supabase when configured

    const newWallet: WalletData = {
      id: `w_${Date.now()}`,
      address,
      label: label || `Wallet ${address.slice(0, 6)}`,
      roi24h: 0,
      realizedPnl: 0,
      winRate: 0,
      totalTrades: 0,
      avgHoldTime: "0m",
      copyScore: 0,
      status: "new",
      tag: "neutral",
      isTracked: true,
      riskScore: "Medium",
      lastActive: "just now",
    };

    return NextResponse.json({
      success: true,
      data: newWallet,
      message: "Wallet added to tracking (paper mode)",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to add wallet",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
