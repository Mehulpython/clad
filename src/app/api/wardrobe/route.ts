// ─── GET /api/wardrobe ─────────────
// List wardrobe items with filters.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

// GET: List user's wardrobe items
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getSupabase();
    const searchParams = req.nextUrl.searchParams;

    let query = supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false });

    // Filters
    const category = searchParams.get("category");
    const color = searchParams.get("color");
    const occasion = searchParams.get("occasion");
    const season = searchParams.get("season");
    const type = searchParams.get("type");
    const favorites = searchParams.get("favorites");

    if (category) query = query.eq("category", category);
    if (color) query = query.ilike("primary_color", `%${color}%`);
    if (occasion) query = query.contains("occasions", [occasion]);
    if (season) query = query.contains("seasons", [season]);
    if (type) query = query.eq("item_type", type);
    if (favorites === "true") query = query.eq("is_favorite", true);

    const { data: items, error } = await query;

    if (error) {
      console.error("Wardrobe query error:", error);
      return NextResponse.json({ error: "Failed to fetch wardrobe" }, { status: 500 });
    }

    return NextResponse.json({ items: items || [], count: items?.length || 0 });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH and DELETE moved to /api/wardrobe/[id]/route.ts
