// ============================================================
// Supabase Server Client (Server Components / API Routes only)
// Uses SERVICE_ROLE_KEY — NEVER import this in client components
// ============================================================

type SupabaseClient = any; // Avoids hard dependency when package not installed

let supabaseAdmin: SupabaseClient | null = null;

/**
 * Get Supabase admin client for server-side operations.
 * Uses service role key — bypasses Row Level Security.
 *
 * ONLY use in:
 * - Server Components
 * - API Routes (app/api/*)
 * - Server Actions
 *
 * NEVER import this file in client components.
 * Returns null if env is not configured.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (supabaseAdmin) return supabaseAdmin;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    console.warn(
      "[WhaleCopy Server] Supabase admin not configured. Running in mock data mode. " +
      "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
    );
    return null;
  }

  try {
    const { createClient } = require("@supabase/supabase-js");
    supabaseAdmin = createClient(url, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
    return supabaseAdmin;
  } catch {
    console.warn("[WhaleCopy Server] @supabase/supabase-js not installed. Using mock data.");
    return null;
  }
}

/**
 * Check if Supabase admin (server) is available
 */
export function isSupabaseAdminAvailable(): boolean {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );
}

/**
 * Safe wrapper: run a Supabase query, fallback to default value if not configured
 */
export async function withSupabase<T>(
  queryFn: (client: SupabaseClient) => Promise<T>,
  fallback: T
): Promise<T> {
  const client = getSupabaseAdmin();
  if (!client) return fallback;

  try {
    return await queryFn(client);
  } catch (error) {
    console.error("[WhaleCopy Server] Supabase query failed:", error);
    return fallback;
  }
}
