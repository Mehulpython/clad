// ─── GET /api/export-data ────────────────────────────────
// Exports all user data as a downloadable JSON file.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Rate limit: 1 request per minute per user
    const rateLimit = checkRateLimit(`${userId}:export-data`, 1);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: `Rate limited. Try again in ${rateLimit.retryAfter}s.` },
        { status: 429 }
      );
    }

    const supabase = await getSupabase();

    // Get user record
    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "No account data found" }, { status: 404 });
    }

    const userIdDb = (user as Record<string, unknown>).id as string;

    // Fetch all related data in parallel
    const [itemsRes, outfitsRes, weeklyPlansRes, scanHistoryRes] = await Promise.all([
      supabase.from("wardrobe_items").select("*").eq("user_id", userIdDb),
      supabase.from("outfits").select("*").eq("user_id", userIdDb),
      supabase.from("weekly_plans").select("*").eq("user_id", userIdDb),
      supabase.from("scan_history").select("*").eq("user_id", userIdDb),
    ]);

    const exportPayload = {
      exportDate: new Date().toISOString(),
      version: 1,
      profile: user,
      wardrobeItems: itemsRes.data || [],
      outfits: outfitsRes.data || [],
      weeklyPlans: weeklyPlansRes.data || [],
      scanHistory: (scanHistoryRes?.data) || [],
    };

    const dateStr = new Date().toISOString().slice(0, 10);

    return new Response(JSON.stringify(exportPayload, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="clad-export-${dateStr}.json"`,
      },
    });
  } catch (error) {
    console.error("[ExportData] Error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Export failed" },
      { status: 500 }
    );
  }
}
