// ─── GET /api/outfits ──────────────────────────────────────
// List saved outfits with filters.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getSupabase();

    // Get user ID from clerk_id
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return NextResponse.json({ outfits: [], total: 0 });
    }

    const userIdDb = (user as Record<string, unknown>).id as string;

    // Build query
    let query = supabase
      .from("outfits")
      .select("*", { count: "exact" })
      .eq("user_id", userIdDb)
      .order("created_at", { ascending: false })
      .limit(50);

    // Filters
    const searchParams = req.nextUrl.searchParams;
    const favoritesOnly = searchParams.get("favorites") === "true";
    const wornOnly = searchParams.get("worn") === "true";

    if (favoritesOnly) query = query.eq("is_favorite", true);
    if (wornOnly) query = query.eq("was_worn", true);

    const { data: outfits, error, count } = await query;

    if (error) {
      console.error("[outfits] Fetch error:", error);
      return NextResponse.json({ error: "Failed to load outfits" }, { status: 500 });
    }

    return NextResponse.json({
      outfits: outfits || [],
      total: count || 0,
    });
  } catch (error) {
    console.error("Outfits list error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch outfits" },
      { status: 500 }
    );
  }
}
