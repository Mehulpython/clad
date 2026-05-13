// ─── POST /api/outfits/generate ─────────────────────────────
// Generate outfit combinations from user's wardrobe.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  generateOutfitCandidates,
  refineOutfitsWithAI,
} from "@/lib/outfit-engine";
import { mapWardrobeRows } from "@/lib/mappers";
import type { OutfitContext, GeneratedOutfit, Occasion, Season, Mood } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 10 requests per minute per user
    const rateLimit = checkRateLimit(`${userId}:outfits-generate`, 10);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: "Rate limit exceeded. Try again shortly." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfter) },
        }
      );
    }

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
    const wardrobe = mapWardrobeRows(rawItems as Array<Record<string, unknown>>);

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
