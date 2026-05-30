import { NextResponse } from "next/server";
import { getDbEnvStatus, getServerDb } from "@/lib/db/server";

async function safeCount(table: string) {
  const db = getServerDb();
  if (!db) return { table, ok: false, count: 0, error: "db_not_configured" };
  const { count, error } = await db.from(table).select("*", { count: "exact", head: true });
  return { table, ok: !error, count: count || 0, error: error?.message || null };
}

export async function GET() {
  const db = getServerDb();
  const env = getDbEnvStatus();
  const checks = await Promise.all([
    safeCount("wallets"),
    safeCount("live_activities"),
    safeCount("signals"),
    safeCount("agent_logs"),
    safeCount("settings"),
  ]);

  return NextResponse.json({
    success: Boolean(db) && checks.every((item) => item.ok),
    env: {
      supabaseUrl: env.url,
      supabasePublicKey: env.publicKey,
      supabaseServiceRole: env.serverKey,
      helius: Boolean(process.env.HELIUS_API_KEY || process.env.NEXT_PUBLIC_HELIUS_API_KEY),
      ai: Boolean(process.env.AI_API_KEY || process.env.OPENAI_API_KEY || process.env.AICHIXIA_API_KEY),
      agentSecretConfigured: Boolean(process.env.AGENT_SECRET || process.env.CRON_SECRET),
    },
    tables: checks,
    hint: !db
      ? "Supabase env belum kebaca di Vercel deployment ini."
      : checks.some((item) => !item.ok)
        ? "Ada tabel Supabase yang belum dibuat atau service role tidak bisa akses. Jalankan supabase/schema.sql."
        : "Backend connection OK. Kalau data kosong, jalankan /api/agent/full-run tanpa dryRun.",
  });
}
