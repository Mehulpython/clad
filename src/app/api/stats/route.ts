// ─── GET /api/stats ────────────────────────────────────────
// Wardrobe & outfit statistics dashboard.

import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getSupabase();

    // Get user DB ID
    const { data: user } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", userId)
      .single();

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userIdDb = (user as Record<string, unknown>).id as string;

    // Parallel fetches
    const [itemsRes, outfitsRes, favoritesRes] = await Promise.all([
      supabase
        .from("wardrobe_items")
        .select("category, primary_color, formality_level, wear_count, price_usd, occasions, seasons, created_at, is_favorite")
        .eq("user_id", userIdDb)
        .eq("is_archived", false),
      supabase
        .from("outfits")
        .select("confidence_score, was_worn, user_rating, is_favorite, created_at")
        .eq("user_id", userIdDb),
      supabase
        .from("wardrobe_items")
        .select("id")
        .eq("user_id", userIdDb)
        .eq("is_favorite", true)
        .eq("is_archived", false),
    ]);

    const items = itemsRes.data as Array<Record<string, unknown>> || [];
    const outfits = outfitsRes.data as Array<Record<string, unknown>> || [];
    const favoriteCount = favoritesRes.count || 0;

    // Category breakdown
    const categoryCounts: Record<string, number> = {};
    for (const item of items) {
      const cat = item.category as string;
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    }

    // Color breakdown
    const colorCounts: Record<string, number> = {};
    for (const item of items) {
      const color = (item.primary_color as string) || "unknown";
      colorCounts[color] = (colorCounts[color] || 0) + 1;
    }

    // Total wear count & most worn
    let totalWears = 0;
    let topWornItem = { name: "", wears: 0 };
    for (const item of items) {
      const wc = Number(item.wear_count) || 0;
      totalWears += wc;
      if (wc > topWornItem.wears) {
        topWornItem = {
          name: ((item.primary_color as string) || "") + " " + ((item.item_type as string) || ""),
          wears: wc,
        };
      }
    }

    // Total value
    let totalValue = 0;
    for (const item of items) {
      totalValue += Number(item.price_usd) || 0;
    }
    const avgCostPerWear = totalWears > 0 ? totalValue / totalWears : 0;

    // Outfit stats
    let totalOutfits = outfits.length;
    let wornOutfits = 0;
    let totalRating = 0;
    let ratedCount = 0;
    let favoriteOutfits = 0;

    for (const outfit of outfits) {
      if (outfit.was_worn) wornOutfits++;
      if (outfit.is_favorite) favoriteOutfits++;
      const rating = outfit.user_rating as number | null;
      if (rating != null && rating > 0) {
        totalRating += rating;
        ratedCount++;
      }
    }

    // Average confidence
    const avgConfidence =
      totalOutfits > 0
        ? outfits.reduce((sum: number, o: Record<string, unknown>) => sum + (Number(o.confidence_score) || 0), 0) /
          totalOutfits
        : 0;

    // Formality distribution
    const formalityDist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of items) {
      const fl = Math.min(5, Math.max(1, Number(item.formality_level) || 3));
      formalityDist[fl]++;
    }

    // Season coverage
    const seasonItems: Record<string, Set<string>> = {};
    for (const item of items) {
      const seasons = item.seasons as string[] | null;
      if (seasons) {
        for (const s of seasons) {
          if (!seasonItems[s]) seasonItems[s] = new Set();
          seasonItems[s].add(item.id as string);
        }
      }
    }

    return NextResponse.json({
      overview: {
        totalItems: items.length,
        totalOutfits,
        totalWears,
        totalValue,
        avgCostPerWear: Math.round(avgCostPerWear * 100) / 100,
        favoriteItems: favoriteCount,
        favoriteOutfits,
        avgConfidence: Math.round(avgConfidence * 100) / 100,
        avgRating: ratedCount > 0 ? Math.round((totalRating / ratedCount) * 100) / 100 : null,
        wornOutfitRate: totalOutfits > 0 ? Math.round((wornOutfits / totalOutfits) * 100) : 0,
      },
      categoryBreakdown: categoryCounts,
      colorBreakdown: Object.entries(colorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 12),
      topWornItem: topWornItem.wears > 0 ? topWornItem : null,
      formalityDistribution: formalityDist,
      seasonCoverage: Object.fromEntries(
        Object.entries(seasonItems).map(([k, v]) => [k, v.size])
      ),
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Stats fetch failed" },
      { status: 500 }
    );
  }
}
