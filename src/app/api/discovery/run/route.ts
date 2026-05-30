import { NextRequest, NextResponse } from "next/server";
import { runWalletDiscovery } from "@/lib/agent/walletDiscovery";

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
  const result = await runWalletDiscovery({
    limitPairs: Number(sp.get("limitPairs") || 8),
    txLimit: Number(sp.get("txLimit") || 20),
    minUsdVolume: Number(sp.get("minUsdVolume") || 0),
    dryRun: sp.get("dryRun") === "1" || sp.get("dryRun") === "true",
  });
  return NextResponse.json(result, { status: result.success ? 200 : 503 });
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const body = await request.json().catch(() => ({}));
  const result = await runWalletDiscovery({
    limitPairs: Number(body.limitPairs || 8),
    txLimit: Number(body.txLimit || 20),
    minUsdVolume: Number(body.minUsdVolume || 0),
    dryRun: Boolean(body.dryRun),
  });
  return NextResponse.json(result, { status: result.success ? 200 : 503 });
}
