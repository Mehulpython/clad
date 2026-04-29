// ─── GET/POST /api/gap-analysis ────────────────────────────
// Analyze wardrobe for gaps and missing items.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAIClient } from "@/lib/vision";
import type { WardrobeItem, WardrobeGap, GapSuggestion, ClothingCategory, Season, Occasion } from "@/lib/types";

// ── Category Requirements (minimums) ───────────────────────

const MIN_REQUIREMENTS: Record<string, { minCount: number; priority: WardrobeGap["priority"] }> = {
  tops:           { minCount: 5,  priority: "high" },
  bottoms:        { minCount: 4,  priority: "critical" },
  dresses:        { minCount: 2,  priority: "medium" },
  outerwear:       { minCount: 2,  priority: "high" },
  footwear:        { minCount: 4,  priority: "critical" },
  accessories:     { minCount: 3,  priority: "low" },
};

// ── Suggested Items per Gap ────────────────────────────────

function getSuggestionsForCategory(category: string, existingColors: string[], existingItems: WardrobeItem[]): any[] {
  const suggestions: Array<Record<string, unknown>> = {
    tops: [
      { name: "White Crew Neck T-Shirt", type: "t-shirt", color: "White", estimatedPriceMin: 15, estimatedPriceMax: 35, shopUrl: null, platform: null },
      { name: "Navy Button-Up Shirt", type: "button-up", color: "Navy", estimatedPriceMin: 40, estimatedPriceMax: 80, shopUrl: null, platform: null },
      { name: "Black Blazer", type: "blazer", color: "Black", estimatedPriceMin: 60, estimatedPriceMax: 150, shopUrl: null, platform: null },
    ],
    bottoms: [
      { name: "Classic Blue Jeans", type: "jeans", color: "Blue", estimatedPriceMin: 40, estimatedPriceMax: 100, shopUrl: null, platform: null },
      { name: "Khaki Chinos", type: "chinos", color: "Beige", estimatedPriceMin: 35, estimatedPriceMax: 70, shopUrl: null, platform: null },
      { name: "Black Trousers", type: "trousers", color: "Black", estimatedPriceMin: 40, estimatedPriceMax: 90, shopUrl: null, platform: null },
    ],
    dresses: [
      { name: "Little Black Dress", type: "dress", color: "Black", estimatedPriceMin: 50, estimatedPriceMax: 150, shopUrl: null, platform: null },
      { name: "Midi Wrap Dress", type: "midi-dress", color: "Floral", estimatedPriceMin: 60, estimatedPriceMax: 120, shopUrl: null, platform: null },
    ],
    outerwear: [
      { name: "Denim Jacket", type: "denim-jacket", color: "Blue", estimatedPriceMin: 50, estimatedPriceMax: 120, shopUrl: null, platform: null },
      { name: "Classic Trench Coat", type: "trench", color: "Beige", estimatedPriceMin: 100, estimatedPriceMax: 300, shopUrl: null, platform: null },
    ],
    footwear: [
      { name: "White Sneakers", type: "sneakers", color: "White", estimatedPriceMin: 40, estimatedPriceMax: 100, shopUrl: null, platform: null },
      { name: "Black Ankle Boots", type: "ankle-boots", color: "Black", estimatedPriceMin: 60, estimatedPriceMax: 150, shopUrl: null, platform: null },
    ],
    accessories: [
      { name: "Leather Belt", type: "belt", color: "Brown", estimatedPriceMin: 20, estimatedPriceMax: 50, shopUrl: null, platform: null },
      { name: "Minimalist Watch", type: "watch", color: "Silver/Black", estimatedPriceMin: 50, estimatedPriceMax: 200, shopUrl: null, platform: null },
    ],
  }[category] || [];

  // Filter out items similar to what they already own
  return suggestions.filter((s) =>
    !existingItems.some((e) =>
      e.itemType === s.type && e.primaryColor.toLowerCase() === (s.color as string).toLowerCase()
    )
  );
}

export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const supabase = await getSupabase();

    const { data: rawItems, error } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false);

    if (error || !rawItems) {
      return NextResponse.json({ error: "Failed to load wardrobe" }, { status: 500 });
    }

    const items: WardrobeItem[] = (rawItems as Array<Record<string, unknown>>).map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      itemType: (row.item_type as string) as WardrobeItem["itemType"],
      category: (row.category as string) as ClothingCategory,
      subtype: (row.subtype as string) || "",
      primaryColor: (row.primary_color as string) || "unknown",
      secondaryColor: row.secondary_color as string | null,
      pattern: ((row.pattern as string) || "solid") as any,
      material: (row.material as any) as any || null,
      occasions: (Array.isArray(row.occasions) ? row.occasions : []) as Occasion[],
      seasons: (Array.isArray(row.seasons) ? row.seasons : []) as Season[],
      formalityLevel: Number(row.formality_level) || 3,
      tags: (Array.isArray(row.tags) ? row.tags : []) as string[],
      aiConfidence: Number(row.ai_confidence) || 0.5,
      brand: row.brand as string | null,
      size: row.size_text as string | null,
      purchasedFrom: row.purchased_from as string | null,
      priceUsd: row.price_usd as number | null,
      purchaseDate: row.purchase_date as string | null,
      imageUrl: (row.image_url as string) || "",
      thumbnailUrl: (row.thumbnail_url as string) || "",
      aiRawOutput: (row.ai_raw_output as Record<string, unknown>) || null,
      isFavorite: Boolean(row.is_favorite),
      isArchived: Boolean(row.is_archived),
      isInLaundry: Boolean(row.is_in_laundry),
      wearCount: Number(row.wear_count) || 0,
      lastWornAt: row.last_worn_at as string | null,
      correctedFields: (Array.isArray(row.corrected_fields) ? row.corrected_fields : []) as string[],
      suggestedName:
        ((row.ai_raw_output as Record<string, unknown>)?.suggestedName as string) ||
        ((row.primary_color as string) + " " + (row.item_type as string)),
      createdAt: (row.created_at as string) || "",
      updatedAt: (row.updated_at as string) || "",
    }));

    const gaps: WardrobeGap[] = [];

    // 1. Category count analysis
    const categoryCounts: Record<string, number> = {};
    for (const item of items) {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    }

    for (const [cat, req] of Object.entries(MIN_REQUIREMENTS)) {
      const current = categoryCounts[cat] || 0;
      if (current < req.minCount) {
        const existingColors = items
          .filter((i) => i.category === cat)
          .map((i) => i.primaryColor);
        const catItems = items.filter((i) => i.category === cat);

        gaps.push({
          category: cat,
          priority: req.priority,
          description:
            "You have " + current + " " + cat + " (recommended: " + req.minCount + "). " +
            "Add " + (req.minCount - current) + " more to unlock more outfit combinations.",
          suggestedItems: getSuggestionsForCategory(cat, existingColors, catItems),
          combinationsUnlocked: estimateCombinations(cat, current, req.minCount),
        });
      }
    }

    // 2. Color diversity check
    const allColors = items.map((i) => i.primaryColor.toLowerCase());
    const uniqueColors = new Set(allColors);
    if (uniqueColors.size < 5 && items.length >= 8) {
      gaps.push({
        category: "color-diversity",
        priority: "medium",
        description:
          "Your wardrobe has limited color variety (" + uniqueColors.size + " colors across " +
          items.length + " items). Adding neutral basics (white, black, navy, beige) would combine with everything.",
        suggestedItems: [
          { name: "White Basic T-Shirt", type: "t-shirt", color: "White", estimatedPriceMin: 15, estimatedPriceMax: 35, shopUrl: null, platform: null },
          { name: "Black Slim-Fit Pants", type: "trousers", color: "Black", estimatedPriceMin: 40, estimatedPriceMax: 80, shopUrl: null, platform: null },
          { name: "Navy Merino Sweater", type: "sweater", color: "Navy", estimatedPriceMin: 50, estimatedPriceMax: 120, shopUrl: null, platform: null },
        ],
        combinationsUnlocked: Math.min(items.length * 2, 20),
      });
    }

    // 3. Occasion coverage
    const coveredOccasions = new Set<Occasion>();
    for (const item of items) {
      for (const occ of item.occasions) {
        coveredOccasions.add(occ);
      }
    }
    const missingOccasions = (["formal", "work", "interview"] as Occasion[]).filter(
      (o) => !coveredOccasions.has(o)
    );
    if (missingOccasions.length > 0) {
      gaps.push({
        category: "occasion-coverage",
        priority: missingOccasions.includes("formal") ? "high" : "medium",
        description:
          "Your wardrobe doesn't cover: " + missingOccasions.join(", ") +
          ". Consider adding pieces for these occasions.",
        suggestedItems: missingOccasions.includes("formal")
          ? [
              { name: "Tailored Suit Jacket", type: "blazer", color: "Navy", estimatedPriceMin: 80, estimatedPriceMax: 250, shopUrl: null, platform: null },
              { name: "Dress Shoes", type: "dress-shoes", color: "Black", estimatedPriceMin: 60, estimatedPriceMax: 150, shopUrl: null, platform: null },
            ]
          : [
              { name: "Oxford Button-Up", type: "button-up", color: "White", estimatedPriceMin: 40, estimatedPriceMax: 90, shopUrl: null, platform: null },
            ],
        combinationsUnlocked: missingOccasions.length * 3,
      });
    }

    // 4. Season coverage
    const coveredSeasons = new Set<Season>();
    for (const item of items) {
      for (const s of item.seasons) {
        coveredSeasons.add(s);
      }
    }
    const missingSeasons = (["winter", "summer"] as Season[]).filter(
      (s) => !coveredSeasons.has(s)
    );
    if (missingSeasons.length > 0) {
      gaps.push({
        category: "season-coverage",
        priority: "medium",
        description:
          "Your wardrobe lacks coverage for: " + missingSeasons.join(", ") + ".",
        suggestedItems: missingSeasons.includes("winter")
          ? [
              { name: "Wool Coat", type: "coat", color: "Camel", estimatedPriceMin: 120, estimatedPriceMax: 350, shopUrl: null, platform: null },
              { name: "Knit Scarf", type: "scarf", color: "Gray", estimatedPriceMin: 15, estimatedPriceMax: 40, shopUrl: null, platform: null },
            ]
          : [
              { name: "Linen Shorts", type: "shorts", color: "Beige", estimatedPriceMin: 25, estimatedPriceMax: 60, shopUrl: null, platform: null },
            ],
        combinationsUnlocked: missingSeasons.length * 4,
      });
    }

    // 5. AI-powered deep analysis (async, best-effort)
    let aiInsights: string | null = null;
    try {
      const wardrobeSummary = items.map((i) =>
        i.itemType + " (" + i.primaryColor + ", " + i.category + ")"
      ).join("\n");

      const client = getOpenAIClient();
      const aiResponse = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are a professional wardrobe analyst. Given a user's wardrobe summary, identify the top 3 most impactful gaps in 2 sentences each. Return ONLY a plain text paragraph, no JSON or markdown.",
          },
          {
            role: "user",
            content: "Wardrobe (" + items.length + " items):\n" + wardrobeSummary,
          },
        ],
        max_tokens: 300,
      });
      aiInsights = aiResponse.choices[0]?.message?.content || null;
    } catch (e) {
      // AI insights are optional — don't fail the request
      console.error("[gap-analysis] AI insights failed:", e);
    }

    // Save analysis to DB
    try {
      await supabase.from("gap_analyses").insert({
        user_id: userId,
        gaps: gaps as unknown as Record<string, unknown>[],
      });
    } catch (e) {
      // Non-critical
    }

    return NextResponse.json({
      gaps,
      totalItems: items.length,
      categoryCounts,
      aiInsights,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Gap analysis error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500 }
    );
  }
}

function estimateCombinations(category: string, current: number, needed: number): number {
  const add = needed - current;
  if (category === "bottoms") return add * 5; // each bottom × 5 tops
  if (category === "tops") return add * 3;
  return add * 2;
}
