import { NextResponse } from "next/server";

function hasEnv(name: string): boolean {
  return Boolean(process.env[name]);
}

export async function GET() {
  return NextResponse.json({
    success: true,
    appEnv: process.env.APP_ENV || "unknown",
    mockFallback: process.env.ENABLE_MOCK_FALLBACK !== "false",
    supabase: {
      url: hasEnv("NEXT_PUBLIC_SUPABASE_URL"),
      publishableKey: hasEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY"),
      serviceRoleKey: hasEnv("SUPABASE_SERVICE_ROLE_KEY"),
    },
    helius: {
      apiKey: hasEnv("HELIUS_API_KEY"),
      webhookSecret: hasEnv("HELIUS_WEBHOOK_SECRET"),
    },
    ai: {
      apiKey: hasEnv("OPENAI_API_KEY"),
      baseUrl: hasEnv("OPENAI_BASE_URL"),
      model: process.env.OPENAI_MODEL || null,
    },
    dexScreener: {
      baseUrl: hasEnv("DEXSCREENER_BASE_URL"),
    },
  });
}
