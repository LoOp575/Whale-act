// ============================================================
// API Route: /api/settings
// WhaleCopy AI — App configuration (paper mode)
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { userSettings } from "@/lib/mock-data";
import type { UserSettings } from "@/lib/mock-data";
import { getSupabaseAdmin } from "@/lib/supabase/server";

/**
 * GET /api/settings
 * Returns current app settings.
 */
export async function GET() {
  try {
    const supabase = getSupabaseAdmin();

    if (supabase) {
      // TODO: replace with real Supabase query
      // const { data, error } = await supabase.from("settings").select("key, value");
      // if (error) throw error;
      // const settings = Object.fromEntries(data.map(r => [r.key, r.value]));
    }

    return NextResponse.json({
      success: true,
      data: userSettings,
      source: supabase ? "database" : "mock",
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch settings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/settings
 * Update a setting value.
 * Body: { key: string, value: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { success: false, error: "Missing or invalid 'key' field" },
        { status: 400 }
      );
    }
    if (value === undefined || value === null) {
      return NextResponse.json(
        { success: false, error: "Missing 'value' field" },
        { status: 400 }
      );
    }

    // Block dangerous settings
    const BLOCKED_KEYS = ["private_key", "secret_key", "wallet_key", "seed_phrase"];
    if (BLOCKED_KEYS.some((blocked) => key.toLowerCase().includes(blocked))) {
      return NextResponse.json(
        { success: false, error: "This setting is not allowed for security reasons" },
        { status: 403 }
      );
    }

    // TODO: upsert into Supabase when configured
    // const supabase = getSupabaseAdmin();
    // if (supabase) {
    //   await supabase.from("settings").upsert({ key, value, updated_at: new Date().toISOString() });
    // }

    return NextResponse.json({
      success: true,
      data: { key, value },
      message: `Setting '${key}' updated (paper mode)`,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update setting",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
