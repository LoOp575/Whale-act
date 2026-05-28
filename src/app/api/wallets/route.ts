// ============================================================
// API Route: /api/wallets
// WhaleCopy AI — Returns wallet data from database with mock fallback
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { wallets } from "@/lib/mock-data";
import type { WalletData } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type DbWallet = {
  id: string;
  address: string;
  roi_24h: number | string | null;
  realized_pnl_24h: number | string | null;
  winrate_24h: number | string | null;
  winrate_7d: number | string | null;
  trade_count_24h: number | string | null;
  avg_hold_minutes: number | string | null;
  copy_score: number | string | null;
  risk_score: number | string | null;
  status: string | null;
  notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

function toNumber(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 4)}...${address.slice(-4)}` : address;
}

function mapDbWallet(row: DbWallet): WalletData {
  const status = (row.status || "NEUTRAL").toLowerCase();
  const riskScore = toNumber(row.risk_score);

  return {
    id: row.id || row.address,
    address: shortAddress(row.address),
    label: row.notes || shortAddress(row.address),
    roi24h: toNumber(row.roi_24h),
    realizedPnl: toNumber(row.realized_pnl_24h),
    winRate: toNumber(row.winrate_7d || row.winrate_24h),
    totalTrades: toNumber(row.trade_count_24h),
    avgHoldTime: `${toNumber(row.avg_hold_minutes)}m`,
    copyScore: toNumber(row.copy_score),
    status: status === "rejected" ? "inactive" : status === "neutral" ? "new" : "active",
    tag: status === "watchlist" || status === "testing" || status === "good" || status === "rejected" ? status : "neutral",
    isTracked: status !== "rejected",
    riskScore: riskScore <= 35 ? "Low" : riskScore <= 65 ? "Medium" : "High",
    lastActive: row.updated_at || row.created_at ? "synced" : "unknown",
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tag = searchParams.get("tag");
    const sort = searchParams.get("sort") || "roi24h";

    const supabase = getSupabaseAdmin();
    let data: WalletData[] = wallets;
    let source = "mock";

    if (supabase) {
      const { data: rows, error } = await supabase
        .from("wallets")
        .select("*")
        .order("copy_score", { ascending: false });

      if (error) throw error;

      const mapped = ((rows || []) as DbWallet[]).map(mapDbWallet);
      if (mapped.length > 0) {
        data = mapped;
        source = "database";
      }
    }

    if (tag && tag !== "all") {
      data = data.filter((w) => w.tag === tag);
    }

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
      source,
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

    const supabase = getSupabaseAdmin();

    if (supabase) {
      const { data: row, error } = await supabase
        .from("wallets")
        .upsert(
          {
            address,
            chain: "solana",
            status: "WATCHLIST",
            notes: label || shortAddress(address),
          },
          { onConflict: "address" }
        )
        .select("*")
        .single();

      if (error) throw error;

      return NextResponse.json({
        success: true,
        data: mapDbWallet(row as DbWallet),
        message: "Wallet saved to database",
        source: "database",
      });
    }

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
      message: "Wallet added to tracking fallback mode",
      source: "mock",
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
