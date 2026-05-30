import { NextResponse } from "next/server";
import { getServerDb } from "@/lib/db/server";
import { callAi, parseJsonFromAi } from "@/lib/ai/provider";
import { normalizeConfidence, shouldGuardActivity } from "@/lib/ai/guard";
import { getLatestTokenPairs, getTokenPairs, mapPair, pickBestPair, searchPairs } from "@/lib/market/dexscreener";

type Activity = {
  wallet_address: string | null;
  token_address: string | null;
  token_symbol: string | null;
  action: string | null;
  amount: number | string | null;
  amount_usd: number | string | null;
  description: string | null;
  created_at: string | null;
};

function num(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function unique(values: Array<string | null | undefined>) {
  return Array.from(new Set(values.filter((value): value is string => Boolean(value && value.trim()))));
}

function normalizeSignalType(value: unknown) {
  const type = String(value || "WAIT").toUpperCase();
  if (["BUY", "WAIT", "REJECT", "EXIT", "WARNING"].includes(type)) return type;
  return "WAIT";
}

async function buildMarketContext(activities: Activity[]) {
  const chainId = process.env.CHAIN_ID || "solana";
  const tokenAddresses = unique(activities.map((activity) => activity.token_address));
  const tokenSymbols = unique(activities.map((activity) => activity.token_symbol).filter((symbol) => symbol !== "UNKNOWN"));
  const targets = tokenAddresses.length ? tokenAddresses.slice(0, 5) : tokenSymbols.slice(0, 5);
  const results = [];

  for (const target of targets) {
    try {
      const pairs = tokenAddresses.includes(target)
        ? await getTokenPairs(chainId, target).catch(() => getLatestTokenPairs(target))
        : await searchPairs(target);
      const best = mapPair(pickBestPair(pairs));
      if (best) results.push(best);
    } catch (error) {
      results.push({ target, error: error instanceof Error ? error.message : "DexScreener lookup failed" });
    }
  }

  return results;
}

export async function POST() {
  const db = getServerDb();
  if (!db) {
    return NextResponse.json({ success: false, source: "env-error", error: "Database environment is not configured" }, { status: 503 });
  }

  try {
    const { data: activities, error: activityError } = await db
      .from("live_activities")
      .select("wallet_address,token_address,token_symbol,action,amount,amount_usd,description,created_at")
      .order("created_at", { ascending: false })
      .limit(25);

    if (activityError) throw activityError;

    const activityRows = (activities || []) as Activity[];
    if (activityRows.length === 0) {
      return NextResponse.json({ success: true, source: "ai_agent", created: 0, message: "Belum ada live activity untuk dianalisis" });
    }

    const marketContext = await buildMarketContext(activityRows);
    const latest = activityRows[0];
    const bestMarket = marketContext.find((item: any) => !item.error) as any;
    const guard = shouldGuardActivity(activityRows, Boolean(bestMarket), num(bestMarket?.liquidityUsd));

    if (guard.shouldGuard) {
      const guardRow = {
        signal_type: "WARNING",
        wallet_address: latest.wallet_address,
        token_address: latest.token_address,
        token_symbol: latest.token_symbol || "UNKNOWN",
        confidence: 25,
        reason: "Activity skipped because token context or liquid market data is incomplete.",
        risk_note: "No paper entry is allowed without valid token symbol, liquidity, and market data.",
        suggested_action: "WAIT",
        entry_plan: "No entry.",
        exit_plan: "Ignore unless a matching paper position exists.",
        invalid_if: "Valid token liquidity and market context become available.",
        time_horizon: "immediate",
        position_size_usd: 0,
        price_change_24h: 0,
        volume_24h: 0,
        liquidity_usd: 0,
        status: "NEW",
        source: "ai_agent",
        raw_payload: { guard: true, activities: activityRows, marketContext },
      };

      const { data: signal, error: signalError } = await db.from("signals").insert(guardRow).select("*").single();
      if (signalError) throw signalError;

      await db.from("agent_logs").insert({
        agent_name: "signal_agent",
        action: "guard_signal",
        input_summary: `${activityRows.length} live activities analyzed`,
        output_summary: "WARNING guard signal created",
        level: "warning",
        raw_payload: guardRow,
      });

      return NextResponse.json({
        success: true,
        source: "ai_agent",
        created: 1,
        guarded: true,
        data: signal,
        marketContext,
      });
    }

    const aiText = await callAi([
      {
        role: "system",
        content:
          "Kamu adalah WhaleCopy AI, analis wallet whale Solana untuk paper trading. Jangan eksekusi trade asli. Nilai wallet activity, token momentum, liquidity, volume, price action, dan exit risk. Jika data lemah pilih WAIT atau REJECT. Jika liquidity rendah pilih WARNING atau REJECT. Jika harga sudah pump terlalu jauh pilih WAIT. Jika wallet berkualitas baru masuk dan momentum sehat, pilih BUY. Jika whale mulai jual atau momentum melemah, pilih EXIT atau WARNING. Return hanya JSON valid dengan keys: signal_type, confidence, wallet_address, token_address, token_symbol, reason, risk_note, suggested_action, entry_plan, exit_plan, invalid_if, time_horizon, position_size_usd. Confidence harus skala 0 sampai 100."
      },
      {
        role: "user",
        content: JSON.stringify({
          task: "Analyze latest Solana whale activities and create one paper-trading signal.",
          rules: {
            paper_trading_only: true,
            min_liquidity_usd: Number(process.env.MIN_LIQUIDITY_USD || 20000),
            max_price_pump_5m: Number(process.env.MAX_PRICE_PUMP_5M || 40),
            max_position_usd: Number(process.env.MAX_PAPER_TRADE_USD || 10)
          },
          activities: activityRows,
          marketContext
        }).slice(0, 9000)
      }
    ]);

    const parsed = parseJsonFromAi(aiText);
    const signalType = normalizeSignalType(parsed.signal_type);

    const signalRow = {
      signal_type: signalType,
      wallet_address: parsed.wallet_address || latest.wallet_address,
      token_address: parsed.token_address || latest.token_address || bestMarket?.tokenAddress || null,
      token_symbol: parsed.token_symbol || latest.token_symbol || bestMarket?.tokenSymbol || "UNKNOWN",
      confidence: normalizeConfidence(parsed.confidence),
      reason: String(parsed.reason || "AI signal generated from live wallet activity."),
      risk_note: String(parsed.risk_note || "Review manually. Paper trading only."),
      suggested_action: String(parsed.suggested_action || signalType),
      entry_plan: String(parsed.entry_plan || "Wait for confirmation."),
      exit_plan: String(parsed.exit_plan || "Use risk rules and fast exit if momentum weakens."),
      invalid_if: String(parsed.invalid_if || "Invalid if liquidity falls or price action reverses."),
      time_horizon: String(parsed.time_horizon || "short-term"),
      position_size_usd: Math.min(num(parsed.position_size_usd), Number(process.env.MAX_PAPER_TRADE_USD || 10)),
      price_change_24h: num(bestMarket?.priceChange24h),
      volume_24h: num(bestMarket?.volume24h),
      liquidity_usd: num(bestMarket?.liquidityUsd),
      status: "NEW",
      source: "ai_agent",
      raw_payload: { aiText, parsed, activities: activityRows, marketContext },
    };

    const { data: signal, error: signalError } = await db.from("signals").insert(signalRow).select("*").single();
    if (signalError) throw signalError;

    if (bestMarket) {
      await db.from("token_snapshots").insert({
        token_address: bestMarket.tokenAddress,
        token_symbol: bestMarket.tokenSymbol,
        chain: bestMarket.chainId || "solana",
        price_usd: num(bestMarket.priceUsd),
        liquidity_usd: num(bestMarket.liquidityUsd),
        volume_24h: num(bestMarket.volume24h),
        price_change_5m: num(bestMarket.priceChange5m),
        price_change_1h: num(bestMarket.priceChange1h),
        price_change_24h: num(bestMarket.priceChange24h),
        txns_24h: bestMarket.txns24h || null,
        pair_address: bestMarket.pairAddress,
        pair_url: bestMarket.pairUrl,
        source: "dexscreener",
        raw_payload: bestMarket,
      });
    }

    await db.from("agent_logs").insert({
      agent_name: "signal_agent",
      action: "run_signal",
      input_summary: `${activityRows.length} live activities analyzed`,
      output_summary: `${signalType} signal created for ${signalRow.token_symbol}`,
      level: "info",
      raw_payload: { signalRow, marketContext },
    });

    return NextResponse.json({
      success: true,
      source: "ai_agent",
      created: 1,
      data: signal,
      marketContext,
    });
  } catch (error) {
    await db.from("agent_logs").insert({
      agent_name: "signal_agent",
      action: "run_signal_error",
      input_summary: "Signal agent failed",
      output_summary: error instanceof Error ? error.message : "Unknown error",
      level: "error",
    });

    return NextResponse.json({ success: false, source: "ai-agent-error", error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
