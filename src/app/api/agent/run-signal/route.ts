import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { callOpenAICompatible } from "@/lib/ai/openai-compatible";

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

    const aiText = await callOpenAICompatible([
      {
        role: "system",
        content:
          "You are WhaleCopy AI, a paper-trading signal analyst. Never recommend live trading. Return only valid JSON with keys signal_type, confidence, reason, risk_note, suggested_action, wallet_address, token_address, token_symbol.",
      },
      {
        role: "user",
        content: `Analyze these latest Solana whale activities and create one safe paper-trading signal. Activities JSON: ${JSON.stringify(activities).slice(0, 6000)}`,
      },
    ]);

    const parsed = safeJson(aiText);
    const latest = activities[0] as any;

    const row = {
      signal_type: normalizeSignalType(parsed.signal_type),
      wallet_address: parsed.wallet_address || latest.wallet_address || null,
      token_address: parsed.token_address || latest.token_address || null,
      token_symbol: parsed.token_symbol || latest.token_symbol || "UNKNOWN",
      confidence: Number(parsed.confidence || 50),
      reason: String(parsed.reason || "AI signal generated from live whale activity."),
      risk_note: String(parsed.risk_note || "Paper trading only. Confirm manually before action."),
      suggested_action: String(parsed.suggested_action || "WAIT"),
      status: "NEW",
      source: "ai_agent",
      raw_payload: { aiText, activities },
    };

    const { data: inserted, error: insertError } = await supabase
      .from("signals")
      .insert(row)
      .select("*")
      .single();

    if (insertError) throw insertError;

    await supabase.from("agent_logs").insert({
      agent_name: "signal_agent",
      action: "generate_signal",
      input_summary: `${activities.length} activity rows analyzed`,
      output_summary: `Created ${row.signal_type} signal for ${row.token_symbol}`,
      level: "info",
      raw_payload: { row },
    });

    return NextResponse.json({
      success: true,
      created: 1,
      data: inserted,
      message: "AI signal agent generated a Supabase signal",
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
