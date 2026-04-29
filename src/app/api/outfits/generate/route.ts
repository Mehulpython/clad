// ─── POST /api/outfits/generate ─────────────────────────────
// Generate outfit combinations from user's wardrobe.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import {
  generateOutfitCandidates,
  refineOutfitsWithAI,
} from "@/lib/outfit-engine";
import type { OutfitContext, GeneratedOutfit, WardrobeItem, Occasion, Season, Mood } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const context: OutfitContext = {
      occasion: (body.occasion as Occasion) || "casual",
      mood: (body.mood as Mood) || "comfortable",
      timeAvailable: (body.timeAvailable as "rushed" | "normal" | "relaxed") || "normal",
      locationType: (body.locationType as "indoor" | "outdoor" | "mixed") || "mixed",
      excludeItemIds: body.excludeItemIds as string[] | undefined,
      forceIncludeItemIds: body.forceIncludeItemIds as string[] | undefined,
    };

    if (body.weather) context.weather = body.weather;

    const supabase = await getSupabase();

    const { data: rawItems, error: itemsError } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false)
      .eq("is_in_laundry", false);

    if (itemsError || !rawItems) {
      return NextResponse.json({ error: "Failed to load wardrobe" }, { status: 500 });
    }

    if (rawItems.length === 0) {
      return NextResponse.json({
        outfits: [],
        message: "Your wardrobe is empty! Upload some clothes first.",
        needsUpload: true,
      });
    }

    // Map DB rows to WardrobeItem type
    const wardrobe: WardrobeItem[] = (rawItems as Array<Record<string, unknown>>).map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      itemType: (row.item_type as string) as WardrobeItem["itemType"],
      category: (row.category as string) as WardrobeItem["category"],
      subtype: (row.subtype as string) || "",
      primaryColor: (row.primary_color as string) || "unknown",
      secondaryColor: row.secondary_color as string | null,
      pattern: (row.pattern as string) as WardrobeItem["pattern"],
      material: (row.material as string | null) as WardrobeItem["material"],
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

    // Fetch user profile for style preferences
    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("clerk_id", userId)
      .single();

    // Step 1: Generate algorithmic candidates
    const candidates = generateOutfitCandidates(wardrobe, context);

    if (candidates.length === 0) {
      return NextResponse.json({
        outfits: [],
        message: "Couldn't generate outfits with current filters. Try relaxing occasion or mood.",
        wardrobeSize: wardrobe.length,
      });
    }

    // Step 2: Refine with AI reasoning
    const refinedOutfits = await refineOutfitsWithAI(candidates, context, profile ?? undefined);

    // Step 3: Save top outfits to database
    const savedOutfits: GeneratedOutfit[] = [];
    for (const outfit of refinedOutfits.slice(0, 5)) {
      const { error: saveErr, data: saved } = await supabase
        .from("outfits")
        .insert({
          user_id: userId,
          name: outfit.name,
          item_ids: outfit.itemIds,
          context: context as unknown as Record<string, unknown>,
          ai_reasoning: outfit.reasoning,
          confidence_score: outfit.confidence,
        })
        .select()
        .single();

      if (!saveErr && saved) {
        savedOutfits.push({ ...outfit, id: (saved as Record<string, unknown>).id as string });
      } else {
        savedOutfits.push(outfit);
      }
    }

    return NextResponse.json({
      outfits: savedOutfits,
      totalCandidates: candidates.length,
      wardrobeSize: wardrobe.length,
      context,
    });
  } catch (error) {
    console.error("Outfit generation error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Generation failed" },
      { status: 500 }
    );
  }
}
