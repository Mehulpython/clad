// ─── GET /api/wardrobe ─────────────
// List wardrobe items with filters and pagination.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { escapeLikePattern } from "@/lib/rate-limit";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 24;
const MAX_LIMIT = 100;

// GET: List user's wardrobe items (paginated)
export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getSupabase();
    const searchParams = req.nextUrl.searchParams;

    // Pagination params
    const page = Math.max(DEFAULT_PAGE, parseInt(searchParams.get("page") || String(DEFAULT_PAGE), 10));
    const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_LIMIT), 10)));
    const offset = (page - 1) * limit;

    // Build filtered query (no range yet — we need the full count first)
    let baseQuery = supabase
      .from("wardrobe_items")
      .select("*", { count: "exact" })
      .eq("user_id", userId)
      .eq("is_archived", false);

    // Filters — applied before pagination
    const category = searchParams.get("category");
    const color = searchParams.get("color");
    const occasion = searchParams.get("occasion");
    const season = searchParams.get("season");
    const type = searchParams.get("type");
    const favorites = searchParams.get("favorites");
    const search = searchParams.get("search");

    if (category) baseQuery = baseQuery.eq("category", category);
    if (color) baseQuery = baseQuery.ilike("primary_color", `%${escapeLikePattern(color)}%`);
    if (occasion) baseQuery = baseQuery.contains("occasions", [occasion]);
    if (season) baseQuery = baseQuery.contains("seasons", [season]);
    if (type) baseQuery = baseQuery.eq("item_type", type);
    if (favorites === "true") baseQuery = baseQuery.eq("is_favorite", true);
    if (search) {
      const safeSearch = escapeLikePattern(search);
      baseQuery = baseQuery.or(`suggested_name.ilike.%${safeSearch}%,primary_color.ilike.%${safeSearch}%,item_type.ilike.%${safeSearch}%`);
    }

    // Get total count via a count-only query clone
    const { count: totalCount, error: countError } = await baseQuery;

    if (countError) {
      console.error("Wardrobe count error:", countError);
      return NextResponse.json({ error: "Failed to fetch wardrobe" }, { status: 500 });
    }

    // Now apply ordering + range for the actual data page
    let dataQuery = supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    // Re-apply same filters on the data query
    if (category) dataQuery = dataQuery.eq("category", category);
    if (color) dataQuery = dataQuery.ilike("primary_color", `%${escapeLikePattern(color)}%`);
    if (occasion) dataQuery = dataQuery.contains("occasions", [occasion]);
    if (season) dataQuery = dataQuery.contains("seasons", [season]);
    if (type) dataQuery = dataQuery.eq("item_type", type);
    if (favorites === "true") dataQuery = dataQuery.eq("is_favorite", true);
    if (search) {
      const safeSearch = escapeLikePattern(search);
      dataQuery = dataQuery.or(`suggested_name.ilike.%${safeSearch}%,primary_color.ilike.%${safeSearch}%,item_type.ilike.%${safeSearch}%`);
    }

    const { data: items, error } = await dataQuery;

    if (error) {
      console.error("Wardrobe query error:", error);
      return NextResponse.json({ error: "Failed to fetch wardrobe" }, { status: 500 });
    }

    const total = totalCount || 0;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return NextResponse.json({
      items: items || [],
      total,
      page,
      totalPages,
      hasMore: page < totalPages,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}

// PATCH and DELETE moved to /api/wardrobe/[id]/route.ts
