import { NextRequest, NextResponse } from "next/server";
import { runWalletDiscovery } from "@/lib/agent/walletDiscovery";
import { runWhaleAgent } from "@/lib/agent/whaleAgent";

function authorized(request: NextRequest) {
  const secrets = [process.env.AGENT_SECRET, process.env.CRON_SECRET].filter(Boolean);
  if (!secrets.length) return true;
  const auth = request.headers.get("authorization") || "";
  const headerSecret = request.headers.get("x-agent-secret") || "";
  return secrets.some((secret) => auth === `Bearer ${secret}` || headerSecret === secret);
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const sp = request.nextUrl.searchParams;
  const dryRun = sp.get("dryRun") === "1" || sp.get("dryRun") === "true";
  const discovery = await runWalletDiscovery({
    limitPairs: Number(sp.get("limitPairs") || 8),
    txLimit: Number(sp.get("txLimit") || 20),
    minUsdVolume: Number(sp.get("minUsdVolume") || 0),
    dryRun,
  });
  const signals = await runWhaleAgent({
    limitWallets: Number(sp.get("limitWallets") || 30),
    txLimit: Number(sp.get("txLimit") || 20),
    dryRun,
  });
  return NextResponse.json({ success: discovery.success && signals.success, source: "full-agent", discovery, signals }, { status: discovery.success && signals.success ? 200 : 503 });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const dryRun = Boolean(body.dryRun);
  const discovery = await runWalletDiscovery({
    limitPairs: Number(body.limitPairs || 8),
    txLimit: Number(body.txLimit || 20),
    minUsdVolume: Number(body.minUsdVolume || 0),
    dryRun,
  });
  const signals = await runWhaleAgent({
    tokenAddress: typeof body.tokenAddress === "string" ? body.tokenAddress : undefined,
    tokenSymbol: typeof body.tokenSymbol === "string" ? body.tokenSymbol : undefined,
    limitWallets: Number(body.limitWallets || 30),
    txLimit: Number(body.txLimit || 20),
    dryRun,
  });
  return NextResponse.json({ success: discovery.success && signals.success, source: "full-agent", discovery, signals }, { status: discovery.success && signals.success ? 200 : 503 });
}
