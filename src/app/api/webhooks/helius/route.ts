import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

function isAuthorized(request: NextRequest): boolean {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.HELIUS_WEBHOOK_SECRET;
  return !expectedSecret || secret === expectedSecret;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    if (typeof value === "string" && value.length > 0) return value;
  }
  return null;
}

function detectAction(event: any): string {
  const type = String(event?.type || event?.transactionType || event?.description || "unknown").toLowerCase();
  if (type.includes("swap") || type.includes("buy")) return "buy";
  if (type.includes("sell")) return "sell";
  if (type.includes("transfer")) return "transfer";
  return "unknown";
}

function extractToken(event: any): { tokenAddress: string | null; tokenSymbol: string | null } {
  const tokenTransfer = Array.isArray(event?.tokenTransfers) ? event.tokenTransfers[0] : null;
  const nativeTransfer = Array.isArray(event?.nativeTransfers) ? event.nativeTransfers[0] : null;

  return {
    tokenAddress: firstString(event?.tokenAddress, event?.mint, tokenTransfer?.mint, nativeTransfer?.mint),
    tokenSymbol: firstString(event?.tokenSymbol, event?.symbol) || "UNKNOWN",
  };
}

function extractWallet(event: any): string | null {
  const accountData = Array.isArray(event?.accountData) ? event.accountData[0] : null;
  const tokenTransfer = Array.isArray(event?.tokenTransfers) ? event.tokenTransfers[0] : null;
  const nativeTransfer = Array.isArray(event?.nativeTransfers) ? event.nativeTransfers[0] : null;

  return firstString(
    event?.feePayer,
    event?.walletAddress,
    event?.source,
    accountData?.account,
    tokenTransfer?.fromUserAccount,
    tokenTransfer?.toUserAccount,
    nativeTransfer?.fromUserAccount,
    nativeTransfer?.toUserAccount
  );
}

function amountUsd(event: any): number {
  const value = Number(event?.amountUsd || event?.valueUsd || event?.usdAmount || 0);
  return Number.isFinite(value) ? value : 0;
}

function uniqueWallets(activities: Array<{ wallet_address: string | null }>) {
  return Array.from(new Set(activities.map((activity) => activity.wallet_address).filter(Boolean))) as string[];
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    message: "Helius webhook endpoint is active",
    mode: "paper-trading-only",
    timestamp: new Date().toISOString(),
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const events = Array.isArray(body) ? body : [body];
    const supabase = getSupabaseAdmin();

    if (!supabase) {
      return NextResponse.json({
        success: true,
        received: events.length,
        saved: 0,
        source: "no-supabase",
        message: "Webhook received but Supabase is not configured",
      });
    }

    const activities = events.map((event: any) => {
      const walletAddress = extractWallet(event);
      const token = extractToken(event);
      const action = detectAction(event);
      const txHash = firstString(event?.signature, event?.transactionHash, event?.txHash);
      const description = firstString(event?.description) || `Helius ${action} event received`;

      return {
        wallet_address: walletAddress,
        token_address: token.tokenAddress,
        token_symbol: token.tokenSymbol,
        action,
        amount_usd: amountUsd(event),
        tx_hash: txHash,
        description,
        source: "helius",
        raw_summary: description,
        raw_payload: event,
      };
    });

    const { error } = await supabase.from("live_activities").insert(activities);
    if (error) throw error;

    const walletRows = uniqueWallets(activities).map((address) => ({
      address,
      chain: "solana",
      status: "WATCHLIST",
      notes: "Real wallet detected from Helius webhook.",
      roi_24h: 0,
      realized_pnl_24h: 0,
      winrate_24h: 0,
      winrate_7d: 0,
      trade_count_24h: activities.filter((activity) => activity.wallet_address === address).length,
      avg_hold_minutes: 0,
      copy_score: 0,
      risk_score: 50,
    }));

    if (walletRows.length > 0) {
      const { error: walletError } = await supabase
        .from("wallets")
        .upsert(walletRows, { onConflict: "address" });
      if (walletError) throw walletError;
    }

    await supabase.from("agent_logs").insert({
      agent_name: "helius_webhook",
      action: "receive_webhook",
      input_summary: `${events.length} event(s) received`,
      output_summary: `${activities.length} live activity row(s) saved and ${walletRows.length} wallet row(s) upserted`,
      level: "info",
    });

    return NextResponse.json({
      success: true,
      received: events.length,
      saved: activities.length,
      walletsUpserted: walletRows.length,
      message: "Webhook received and saved to Supabase",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process webhook",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
