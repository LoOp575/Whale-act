// ============================================================
// Supabase Client (Browser / Client Components)
// Uses ONLY public keys — safe for frontend
// ============================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

/**
 * Get Supabase client for browser/client components.
 * Uses public anon key only — no server secrets.
 * Returns null if env is not configured (app falls back to mock data).
 */
export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    console.warn(
      "[WhaleCopy] Supabase not configured. Running in mock data mode. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in .env.local"
    );
    return null;
  }

  supabaseClient = createClient(url, key);
  return supabaseClient;
}

/**
 * Check if Supabase client is available
 */
export function isSupabaseAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  );
}
