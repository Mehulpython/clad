// ─── POST /api/scan ────────────────────────────────────────
// Pre-purchase scanner: "Should I buy this?"

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getSupabase } from "@/lib/supabase";
import { getOpenAIClient, analyzeClothingPhoto } from "@/lib/vision";
import type { PrePurchaseScan, ScanVerdict, WardrobeItem } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
    const wardrobe: WardrobeItem[] = (rawItems as Array<Record<string, unknown>>).map((row) => ({
      id: row.id as string,
      userId: row.user_id as string,
      itemType: (row.item_type as string) as WardrobeItem["itemType"],
      category: (row.category as string) as WardrobeItem["category"],
      subtype: (row.subtype as string) || "",
      primaryColor: (row.primary_color as string) || "unknown",
      secondaryColor: row.secondary_color as string | null,
      pattern: ((row.pattern as string) || "solid") as any,
      material: (row.material as any) as any || null,
      occasions: [],
      seasons: [],
      formalityLevel: Number(row.formality_level) || 3,
      tags: [],
      aiConfidence: Number(row.ai_confidence) || 0.5,
      brand: row.brand as string | null,
      size: row.size_text as string | null,
      purchasedFrom: row.purchased_from as string | null,
      priceUsd: row.price_usd as number | null,
      purchaseDate: row.purchase_date as string | null,
      imageUrl: (row.image_url as string) || "",
      thumbnailUrl: (row.thumbnail_url as string) || "",
      aiRawOutput: null,
      isFavorite: Boolean(row.is_favorite),
      isArchived: Boolean(row.is_archived),
      isInLaundry: Boolean(row.is_in_laundry),
      wearCount: Number(row.wear_count) || 0,
      lastWornAt: row.last_worn_at as string | null,
      correctedFields: [],
      suggestedName: (row.primary_color as string) + " " + (row.item_type as string),
      createdAt: (row.created_at as string) || "",
      updatedAt: (row.updated_at as string) || "",
    }));

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
      const complementaryCategories: Record<string, string[]> = {
        tops: ["bottoms", "outerwear", "footwear"],
        bottoms: ["tops", "footwear", "belts"],
        outerwear: ["tops", "dresses", "footwear"],
        footwear: ["bottoms", "tops", "dresses"],
        dresses: ["outerwear", "footwear", "accessories"],
        accessories: ["tops", "dresses", "outerwear"],
      };
      // Map itemType to category
      const itemCategoryMap: Record<string, string> = {
        "t-shirt": "tops", "polo": "tops", "button-up": "tops", "hoodie": "tops",
        "sweater": "tops", "cardigan": "tops", "sweatshirt": "tops", "tank-top": "tops",
        "blouse": "tops", "bodysuit": "tops",
        "jacket": "outerwear", "blazer": "outerwear", "coat": "outerwear",
        "denim-jacket": "outerwear", "leather-jacket": "outerwear", "bomber": "outerwear",
        "puffer": "outerwear", "trench": "outerwear",
        "jeans": "bottoms", "trousers": "bottoms", "chinos": "bottoms", "shorts": "bottoms",
        "leggings": "bottoms", "skirt": "bottoms", "mini-skirt": "bottoms", "midi-skirt": "bottoms",
        "maxi-skirt": "bottoms",
        "dress": "dresses", "mini-dress": "dresses", "midi-dress": "dresses", "maxi-dress": "dresses",
        "jumpsuit": "dresses", "romper": "dresses",
        "sneakers": "footwear", "running-shoes": "footwear", "high-tops": "footwear",
        "loafers": "footwear", "oxfords": "footwear", "boots": "footwear",
        "ankle-boots": "footwear", "knee-high-boots": "footwear", "heels": "footwear",
        "pumps": "footwear", "flats": "footwear", "sandals": "footwear",
        "flip-flops": "footwear", "slides": "footwear", "crocs": "footwear", "dress-shoes": "footwear",
        "belt": "accessories", "hat": "accessories", "cap": "accessories",
        "beanie": "accessories", "scarf": "accessories", "gloves": "accessories",
        "watch": "accessories", "bracelet": "accessories", "necklace": "accessories",
        "earrings": "accessories", "ring": "accessories", "sunglasses": "accessories",
        "eyeglasses": "accessories", "tie": "accessories", "bow-tie": "accessories",
        "pocket-square": "accessories", "bag": "accessories", "backpack": "accessories",
        "tote": "accessories", "crossbody": "accessories", "clutch": "accessories",
        "wallet": "accessories", "umbrella": "accessories",
      };
      const analyzedCategory = itemCategoryMap[analyzedItem.itemType] || "tops";
      const complements = complementaryCategories[analyzedCategory] || [];
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
