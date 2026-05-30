import { NextRequest, NextResponse } from "next/server";
import { getServerDb } from "@/lib/db/server";

function isAuthorized(request: NextRequest) {
  const expected = process.env.HELIUS_WEBHOOK_SECRET;
  if (!expected) return false;
  const secret = new URL(request.url).searchParams.get("secret");
  return secret === expected;
}

function firstString(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function firstNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  return 0;
}

function getAction(event: any) {
  const text = String(event?.type || event?.transactionType || event?.description || "activity").toLowerCase();
  if (text.includes("buy") || text.includes("swap")) return "BUY";
  if (text.includes("sell")) return "SELL";
  if (text.includes("transfer")) return "TRANSFER";
  return "ACTIVITY";
}

function getWallet(event: any) {
  const account = Array.isArray(event?.accountData) ? event.accountData[0] : null;
  const tokenTransfer = Array.isArray(event?.tokenTransfers) ? event.tokenTransfers[0] : null;
  const nativeTransfer = Array.isArray(event?.nativeTransfers) ? event.nativeTransfers[0] : null;

  return firstString(
    event?.feePayer,
    event?.walletAddress,
    account?.account,
    tokenTransfer?.fromUserAccount,
    tokenTransfer?.toUserAccount,
    nativeTransfer?.fromUserAccount,
    nativeTransfer?.toUserAccount
  );
}

function getToken(event: any) {
  const tokenTransfer = Array.isArray(event?.tokenTransfers) ? event.tokenTransfers[0] : null;
  return {
    address: firstString(event?.tokenAddress, event?.mint, tokenTransfer?.mint),
    symbol: firstString(event?.tokenSymbol, event?.symbol) || "UNKNOWN",
    amount: firstNumber(event?.amount, tokenTransfer?.tokenAmount),
  };
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    source: "helius-webhook",
    message: "Webhook endpoint active",
  });
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = getServerDb();
    if (!db) {
      return NextResponse.json({ success: false, error: "Database environment is not configured" }, { status: 503 });
    }

    const payload = await request.json();
    const events = Array.isArray(payload) ? payload : [payload];

    const rows = events.map((event: any) => {
      const wallet = getWallet(event);
      const token = getToken(event);
      const action = getAction(event);
      const description = firstString(event?.description) || `${action} activity received`;

      return {
        wallet_address: wallet,
        token_address: token.address,
        token_symbol: token.symbol,
        action,
        amount: token.amount,
        amount_usd: firstNumber(event?.amountUsd, event?.valueUsd, event?.usdAmount),
        tx_hash: firstString(event?.signature, event?.transactionHash, event?.txHash),
        description,
        source: "helius",
        raw_summary: description,
        raw_payload: event,
      };
    });

    const { error } = await db.from("live_activities").insert(rows);
    if (error) throw error;

    const uniqueWallets = Array.from(new Set(rows.map((row) => row.wallet_address).filter(Boolean))) as string[];
    if (uniqueWallets.length > 0) {
      const walletRows = uniqueWallets.map((address) => ({
        address,
        chain: "solana",
        label: address,
        status: "CANDIDATE",
        source: "helius",
        notes: "Wallet detected from Helius activity.",
        last_seen_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }));

      const { error: walletError } = await db.from("wallets").upsert(walletRows, { onConflict: "address" });
      if (walletError) throw walletError;
    }

    return NextResponse.json({
      success: true,
      source: "helius-webhook",
      received: events.length,
      saved: rows.length,
      walletsUpserted: uniqueWallets.length,
    });
  } catch (error) {
    return NextResponse.json({ success: false, source: "helius-error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
