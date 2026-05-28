import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (!supabase) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        source: "env-missing",
        message: "Supabase server env is not configured",
      },
      { status: 503 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("wallets")
      .select("id,address,status,copy_score,roi_24h,created_at")
      .limit(5);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      connected: true,
      source: "supabase",
      rows: data || [],
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        connected: false,
        source: "supabase-error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
