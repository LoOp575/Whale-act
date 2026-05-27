// ============================================================
// Environment Config — WhaleCopy AI
// Reads env vars with safe fallbacks to mock mode.
// App works without any env configured.
// ============================================================

/**
 * Public config (safe to use in client components)
 */
export const publicConfig = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  supabaseKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "",
  dexScreenerBaseUrl:
    process.env.DEXSCREENER_BASE_URL || "https://api.dexscreener.com",
  isPaperTrading: process.env.PAPER_TRADING !== "false", // defaults to true
};

/**
 * Server-only config (NEVER import this in client components)
 * These values are only available in server components, API routes, etc.
 */
export const serverConfig = {
  supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  heliusApiKey: process.env.HELIUS_API_KEY || "",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
};

/**
 * Check if real API connections are available
 * Returns false if env is not configured — services fall back to mock data
 */
export function isApiConfigured(): boolean {
  return !!(
    process.env.HELIUS_API_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL
  );
}

/**
 * Check if AI features are available
 */
export function isAiConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY;
}
