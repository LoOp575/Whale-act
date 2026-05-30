import { NextRequest, NextResponse } from "next/server";
import { runWhaleAgent } from "@/lib/agent/whaleAgent";

function authorized(request: NextRequest) {
  const secret = process.env.AGENT_SECRET || process.env.CRON_SECRET;
  if (!secret) return true;
  const auth = request.headers.get("authorization") || "";
  const headerSecret = request.headers.get("x-agent-secret") || "";
  return auth === `Bearer ${secret}` || headerSecret === secret;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const sp = request.nextUrl.searchParams;
  const result = await runWhaleAgent({
    tokenAddress: sp.get("tokenAddress") || undefined,
    tokenSymbol: sp.get("tokenSymbol") || undefined,
    limitWallets: Number(sp.get("limitWallets") || 20),
    txLimit: Number(sp.get("txLimit") || 20),
    dryRun: sp.get("dryRun") === "1" || sp.get("dryRun") === "true",
  });
  return NextResponse.json(result, { status: result.success ? 200 : 503 });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const result = await runWhaleAgent({
    tokenAddress: typeof body.tokenAddress === "string" ? body.tokenAddress : undefined,
    tokenSymbol: typeof body.tokenSymbol === "string" ? body.tokenSymbol : undefined,
    limitWallets: Number(body.limitWallets || 20),
    txLimit: Number(body.txLimit || 20),
    dryRun: Boolean(body.dryRun),
  });
  return NextResponse.json(result, { status: result.success ? 200 : 503 });
}
