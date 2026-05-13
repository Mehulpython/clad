// ─── POST /api/scan ────────────────────────────────────────
// Pre-purchase scanner: "Should I buy this?"

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAIClient, analyzeClothingPhoto } from "@/lib/vision";
import type { PrePurchaseScan, ScanVerdict, WardrobeItem } from "@/lib/types";
import { checkRateLimit } from "@/lib/rate-limit";
import { mapWardrobeRows } from "@/lib/mappers";
import { ITEM_CATEGORIES, COMPLEMENTARY_CATEGORIES } from "@/lib/categories";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Rate limit: 15 requests per minute per user
    const rateLimit = checkRateLimit(`${userId}:scan`, 15);
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
    const imageUrl = body.imageUrl as string | undefined;
    const base64Data = body.base64 as string | undefined;

    if (!imageUrl && !base64Data) {
      return NextResponse.json({ error: "Provide imageUrl or base64" }, { status: 400 });
    }

    const supabase = await getSupabase();

    // Step 1: Analyze the item with Vision
    let analyzedItem;
    try {
      analyzedItem = await analyzeClothingPhoto(imageUrl || "", base64Data);
    } catch (visionError) {
      console.error("[scan] Vision analysis failed:", visionError);
      return NextResponse.json(
        { error: "Failed to analyze image. Try a clearer photo." },
        { status: 500 }
      );
    }

    // Step 2: Fetch user's existing wardrobe
    const { data: rawItems, error } = await supabase
      .from("wardrobe_items")
      .select("*")
      .eq("user_id", userId)
      .eq("is_archived", false);

    if (error || !rawItems) {
      return NextResponse.json({ error: "Failed to load wardrobe for comparison" }, { status: 500 });
    }

    // Step 3: Cross-reference against wardrobe
    const wardrobe = mapWardrobeRows(rawItems as Array<Record<string, unknown>>);

    // Find matching items
    const matchingItems: string[] = [];
    const similarItems: string[] = [];

    for (const item of wardrobe) {
      // Exact type match
      if (item.itemType === analyzedItem.itemType) {
        // Check color similarity
        if (item.primaryColor.toLowerCase() === analyzedItem.primaryColor.toLowerCase()) {
          similarItems.push(item.suggestedName || item.itemType);
        } else {
          matchingItems.push(item.suggestedName || item.itemType);
        }
      }
      // Category match (complementary items)
      const analyzedCategory = ITEM_CATEGORIES[analyzedItem.itemType] || "tops";
      const complements = COMPLEMENTARY_CATEGORIES[analyzedCategory] || [];
      if (complements.includes(item.category)) {
        if (!matchingItems.includes(item.suggestedName || item.itemType)) {
          matchingItems.push(item.suggestedName || item.itemType);
        }
      }
    }

    // Step 4: Determine verdict
    const totalCombos = matchingItems.length;
    const duplicateScore = similarItems.length;

    let verdict: ScanVerdict;
    let score: number;
    let reasoning: string;

    if (duplicateScore >= 2) {
      verdict = "duplicate";
      score = 15;
      reasoning =
        "Skip — you already have " + duplicateScore + " very similar " +
        analyzedItem.itemType + "(s). This would be redundant.";
    } else if (totalCombos >= 8) {
      verdict = "great-buy";
      score = 92;
      reasoning =
        "Great buy! This " + analyzedItem.itemType + " combines with " +
        totalCombos + " items you own. It fills a versatile gap in your wardrobe.";
    } else if (totalCombos >= 4) {
      verdict = "decent";
      score = 65;
      reasoning =
        "Decent choice — matches " + totalCombos + " items in your wardrobe. " +
        (duplicateScore > 0
          ? "But you have " + duplicateScore + " similar piece(s) already."
          : "Consider if you really need another item in this category.");
    } else if (totalCombos >= 1) {
      verdict = "decent";
      score = 42;
      reasoning =
        "It's OK — only pairs with " + totalCombos + " thing(s) you own. " +
        "Limited outfit combinations. Consider prioritizing a more versatile piece first.";
    } else {
      verdict = "skip";
      score = 22;
      reasoning =
        "Skip — nothing in your wardrobe pairs well with this. " +
        "Build your foundation pieces first before adding statement items.";
    }

    // Boost score for versatile basics
    const basics = ["t-shirt", "jeans", "sneakers", "button-up", "cardigan", "blazer", "dress-shoes", "belt"];
    if (basics.includes(analyzedItem.itemType)) {
      score = Math.min(95, score + 15);
      if (score > 80 && verdict !== "great-buy") {
        verdict = "decent";
        reasoning += " However, this is a versatile basic that tends to pair with many things.";
      }
    }

    // Cost-per-wear estimate
    const estimatedPrice = body.estimatedPrice ? Number(body.estimatedPrice) : 50;
    const wearsPerWeek = score > 75 ? 3 : score > 50 ? 1.5 : 0.5;
    const costPerWear = estimatedPrice > 0
      ? "$" + (estimatedPrice / (wearsPerWeek * 52)).toFixed(2)
      : "N/A";

    // Step 5: AI-powered reasoning enhancement
    try {
      const client = getOpenAIClient();
      const aiReasoning = await client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "You are a personal stylist helping someone decide whether to buy a clothing item. " +
              "Given the item and their existing wardrobe, give a concise verdict explanation in 2-3 sentences. " +
              "Be opinionated but helpful. Return plain text only.",
          },
          {
            role: "user",
            content:
              "Item to buy: " + analyzedItem.itemType + " (" +
              analyzedItem.primaryColor + " " + analyzedItem.subtype + ")\n" +
              "Matches " + totalCombos + " existing items: " +
              matchingItems.slice(0, 5).join(", ") + "\n" +
              "Similar items owned (" + duplicateScore + "): " +
              similarItems.slice(0, 3).join(", ") + "\n" +
              "Wardrobe size: " + wardrobe.length + " items",
          },
        ],
        max_tokens: 200,
      });

      const aiText = aiReasoning.choices[0]?.message?.content;
      if (aiText) reasoning = aiText;
    } catch (e) {
      // Keep algorithmic reasoning
    }

    const result: PrePurchaseScan = {
      verdict,
      score,
      reasoning,
      combinationsWithExisting: totalCombos,
      wardrobeItemsThatMatch: matchingItems,
      costPerWearEstimate: costPerWear,
      alternativesAlreadyOwned: similarItems,
    };

    return NextResponse.json({
      scan: result,
      analyzedItem,
      wardrobeSize: wardrobe.length,
    });
  } catch (error) {
    console.error("Pre-purchase scan error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scan failed" },
      { status: 500 }
    );
  }
}
