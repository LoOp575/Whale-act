// ============================================================
// API Route: /api/webhooks/helius
// WhaleCopy AI — Receives Helius webhook events (read-only)
// No live trading. No private keys. Paper trading only.
// ============================================================

import { NextRequest, NextResponse } from "next/server";

/**
 * GET /api/webhooks/helius
 * Health check / browser test endpoint.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const expectedSecret = process.env.HELIUS_WEBHOOK_SECRET;

  // If secret is configured, validate it
  if (expectedSecret && secret !== expectedSecret) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return NextResponse.json({
    success: true,
    message: "Helius webhook endpoint is active",
    mode: "paper-trading-only",
    timestamp: new Date().toISOString(),
  });
}

/**
 * POST /api/webhooks/helius
 * Receives webhook events from Helius.
 * Validates secret, parses transaction data.
 * Does NOT execute any trades — only logs and processes for signals.
 */
export async function POST(request: NextRequest) {
  try {
    // Validate webhook secret
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get("secret");
    const expectedSecret = process.env.HELIUS_WEBHOOK_SECRET;

    if (expectedSecret && secret !== expectedSecret) {
      return NextResponse.json(
        { success: false, error: "Unauthorized — invalid webhook secret" },
        { status: 401 }
      );
    }

    // Parse webhook payload
    const body = await request.json();
    const events = Array.isArray(body) ? body : [body];

    // TODO: Process webhook events
    // 1. Parse transaction data
    // 2. Detect buy/sell events from tracked wallets
    // 3. Feed into Signal Generator Agent
    // 4. Store in database (agent_logs / wallet_trades)
    // No live trading — only signal generation for paper mode

    return NextResponse.json({
      success: true,
      received: events.length,
      message: "Webhook received (paper trading mode — no execution)",
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
