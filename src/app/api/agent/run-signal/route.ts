import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { callOpenAICompatible } from "@/lib/ai/openai-compatible";
import { getLatestTokenPairs, getTokenPairs, pickBestPair, searchDexPairs } from "@/lib/market/dexscreener";

function safeJson(text: string) {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("AI response did not include JSON");
  return JSON.parse(match[0]);
}

function normalizeSignalType(value: unknown): "BUY" | "WAIT" | "REJECT" | "EXIT" | "WARNING" {
  const type = String(value || "WAIT").toUpperCase();
  if (type === "BUY" || type === "WAIT" || type === "REJECT" || type === "EXIT" || type === "WARNING") return type;
  return "WAIT";
}

function uniqueStrings(values: unknown[]): string[] {
  return Array.from(
    new Set(
      values
        .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
        .map((value) => value.trim())
    )
  );
}

async function buildMarketContext(activities: any[]) {
  const chainId = process.env.CHAIN_ID || "solana";
  const tokenAddresses = uniqueStrings(activities.map((activity) => activity.token_address));
  const tokenSymbols = uniqueStrings(activities.map((activity) => activity.token_symbol));
  const targets = tokenAddresses.length ? tokenAddresses.slice(0, 5) : tokenSymbols.slice(0, 5);

  const marketRows = [];

  for (const target of targets) {
    try {
      const pairs = tokenAddresses.includes(target)
        ? await getTokenPairs(chainId, target).catch(() => getLatestTokenPairs(target))
        : await searchDexPairs(target);

      const bestPair = pickBestPair(pairs);
      if (!bestPair) continue;

      marketRows.push({
        target,
        chainId: bestPair.chainId,
        dexId: bestPair.dexId,
        pairAddress: bestPair.pairAddress,
        tokenSymbol: bestPair.baseToken?.symbol,
        tokenName: bestPair.baseToken?.name,
        priceUsd: bestPair.priceUsd,
        liquidityUsd: bestPair.liquidity?.usd || 0,
        volume24h: bestPair.volume?.h24 || 0,
        priceChange5m: bestPair.priceChange?.m5 || 0,
        priceChange1h: bestPair.priceChange?.h1 || 0,
        priceChange24h: bestPair.priceChange?.h24 || 0,
        txns24h: bestPair.txns?.h24 || null,
        url: bestPair.url,
      });
    } catch (error) {
      marketRows.push({
        target,
        error: error instanceof Error ? error.message : "DexScreener lookup failed",
      });
    }
  }

  return marketRows;
}

export async function POST() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json({ success: false, error: "Supabase is not configured" }, { status: 503 });
  }

  try {
    const { data: activities, error: activityError } = await supabase
      .from("live_activities")
      .select("wallet_address,token_address,token_symbol,action,amount_usd,description,created_at")
      .order("created_at", { ascending: false })
      .limit(20);

    if (activityError) throw activityError;

    if (!activities || activities.length === 0) {
      return NextResponse.json({
        success: true,
        created: 0,
        message: "No live activity yet. AI agent needs Helius events first.",
      });
    }

    const marketContext = await buildMarketContext(activities as any[]);

    const aiText = await callOpenAICompatible([
      {
        role: "system",
        content:
          "You are WhaleCopy AI, a paper-trading signal analyst. Never recommend live trading. Use wallet activity plus DexScreener liquidity, volume, and price-change context. Return only valid JSON with keys signal_type, confidence, reason, risk_note, suggested_action, wallet_address, token_address, token_symbol.",
      },
      {
        role: "user",
        content: `Create one safe paper-trading signal from this data. Latest whale activities JSON: ${JSON.stringify(activities).slice(0, 5000)} DexScreener market context JSON: ${JSON.stringify(marketContext).slice(0, 5000)}`,
      },
    ]);

    const parsed = safeJson(aiText);
    const latest = activities[0] as any;
    const bestMarket = marketContext.find((item: any) => !item.error) as any;

    const row = {
      signal_type: normalizeSignalType(parsed.signal_type),
      wallet_address: parsed.wallet_address || latest.wallet_address || null,
      token_address: parsed.token_address || latest.token_address || null,
      token_symbol: parsed.token_symbol || latest.token_symbol || bestMarket?.tokenSymbol || "UNKNOWN",
      confidence: Number(parsed.confidence || 50),
      reason: String(parsed.reason || "AI signal generated from live whale activity and DexScreener market data."),
      risk_note: String(parsed.risk_note || "Paper trading only. Confirm manually before action."),
      suggested_action: String(parsed.suggested_action || "WAIT"),
      status: "NEW",
      source: "ai_agent_dexscreener",
      raw_payload: { aiText, activities, marketContext },
    };

    const { data: inserted, error: insertError } = await supabase
      .from("signals")
      .insert(row)
      .select("*")
      .single();

    if (insertError) throw insertError;

    await supabase.from("agent_logs").insert({
      agent_name: "signal_agent",
      action: "generate_signal_with_dexscreener",
      input_summary: `${activities.length} activity rows and ${marketContext.length} market rows analyzed`,
      output_summary: `Created ${row.signal_type} signal for ${row.token_symbol}`,
      level: "info",
      raw_payload: { row, marketContext },
    });

    return NextResponse.json({
      success: true,
      created: 1,
      data: inserted,
      marketContext,
      message: "AI signal agent generated a Supabase signal using DexScreener context",
    });
  } catch (error) {
    await supabase.from("agent_logs").insert({
      agent_name: "signal_agent",
      action: "generate_signal_error",
      input_summary: "AI signal generation failed",
      output_summary: error instanceof Error ? error.message : "Unknown error",
      level: "error",
    });

    return NextResponse.json(
      {
        success: false,
        error: "AI signal agent failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
