// ─── GET /api/shop ─────────────────────────────────────────
// AI-curated shopping suggestions — not a real store (yet).
// Products are suggestions based on common wardrobe gaps.
// Links go to Google Shopping so users can compare real prices.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { ShopSuggestion } from "@/lib/shop-types";

type ProductCategory = "tops" | "bottoms" | "outerwear" | "footwear" | "accessories";

// ── AI-Curated Suggestion Catalog ──

const CATALOG: ShopSuggestion[] = [
  // ── Tops ──────────────────────────────────────────────
  {
    id: "s1", platform: "Suggestion", productName: "Essential Crew Neck T-Shirt (3-Pack)",
    productUrl: googleShoppingUrl("Essential Crew Neck T-Shirt 3-Pack"),
    productImageUrl: "", priceUsd: 29, priceRange: "$25–35",
    category: "tops", affiliateUrl: null,
    reason: "Wardrobe staple — pairs with everything",
  },
  {
    id: "s2", platform: "Suggestion", productName: "Slim Fit Oxford Shirt",
    productUrl: googleShoppingUrl("Slim Fit Oxford Shirt"),
    productImageUrl: "", priceUsd: 35, priceRange: "$30–50",
    category: "tops", affiliateUrl: null,
    reason: "Perfect for work and smart casual",
  },
  {
    id: "s3", platform: "Suggestion", productName: "Oversized Knit Sweater",
    productUrl: googleShoppingUrl("Oversized Knit Sweater"),
    productImageUrl: "", priceUsd: 60, priceRange: "$45–80",
    category: "tops", affiliateUrl: null,
    reason: "Great layering piece for fall/winter",
  },
  {
    id: "s4", platform: "Suggestion", productName: "U-Airism Performance T-Shirt",
    productUrl: googleShoppingUrl("U-Airism Performance T-Shirt"),
    productImageUrl: "", priceUsd: 15, priceRange: "$12–20",
    category: "tops", affiliateUrl: null,
    reason: "Best basic tee for summer — breathable",
  },

  // ── Bottoms ────────────────────────────────────────────
  {
    id: "s5", platform: "Suggestion", productName: "501 Original Fit Jeans",
    productUrl: googleShoppingUrl("501 Original Fit Jeans"),
    productImageUrl: "", priceUsd: 70, priceRange: "$60–90",
    category: "bottoms", affiliateUrl: null,
    reason: "Classic fit every wardrobe needs",
  },
  {
    id: "s6", platform: "Suggestion", productName: "Slim Fit Chinos",
    productUrl: googleShoppingUrl("Slim Fit Chinos"),
    productImageUrl: "", priceUsd: 45, priceRange: "$35–55",
    category: "bottoms", affiliateUrl: null,
    reason: "Best value chinos on the market",
  },
  {
    id: "s7", platform: "Suggestion", productName: "Tailored Black Trousers",
    productUrl: googleShoppingUrl("Tailored Black Trousers"),
    productImageUrl: "", priceUsd: 52, priceRange: "$40–70",
    category: "bottoms", affiliateUrl: null,
    reason: "Essential for formal occasions",
  },
  {
    id: "s8", platform: "Suggestion", productName: "Linen Blend Shorts",
    productUrl: googleShoppingUrl("Linen Blend Shorts"),
    productImageUrl: "", priceUsd: 25, priceRange: "$20–35",
    category: "bottoms", affiliateUrl: null,
    reason: "Summer essential — breathable fabric",
  },

  // ── Outerwear ──────────────────────────────────────────
  {
    id: "s9", platform: "Suggestion", productName: "Denim Trucker Jacket",
    productUrl: googleShoppingUrl("Denim Trucker Jacket"),
    productImageUrl: "", priceUsd: 65, priceRange: "$50–90",
    category: "outerwear", affiliateUrl: null,
    reason: "Layer over anything — timeless style",
  },
  {
    id: "s10", platform: "Suggestion", productName: "Midi Trench Coat",
    productUrl: googleShoppingUrl("Midi Trench Coat"),
    productImageUrl: "", priceUsd: 150, priceRange: "$120–250",
    category: "outerwear", affiliateUrl: null,
    reason: "Investment piece — lasts for years",
  },
  {
    id: "s11", platform: "Suggestion", productName: "Lightweight Puffer Jacket",
    productUrl: googleShoppingUrl("Lightweight Puffer Jacket"),
    productImageUrl: "", priceUsd: 90, priceRange: "$70–130",
    category: "outerwear", affiliateUrl: null,
    reason: "Trendy but practical for cold weather",
  },

  // ── Footwear ───────────────────────────────────────────
  {
    id: "s12", platform: "Suggestion", productName: "White Leather Sneakers (AF1 style)",
    productUrl: googleShoppingUrl("White Leather Sneakers"),
    productImageUrl: "", priceUsd: 110, priceRange: "$90–140",
    category: "footwear", affiliateUrl: null,
    reason: "#1 versatile sneaker — goes with 90% of outfits",
  },
  {
    id: "s13", platform: "Suggestion", productName: "Black Ankle Boots",
    productUrl: googleShoppingUrl("Black Ankle Boots"),
    productImageUrl: "", priceUsd: 120, priceRange: "$80–160",
    category: "footwear", affiliateUrl: null,
    reason: "Elevates any outfit instantly",
  },
  {
    id: "s14", platform: "Suggestion", productName: "Minimalist White Low-Top Sneakers",
    productUrl: googleShoppingUrl("Minimalist White Low-Top Sneakers"),
    productImageUrl: "", priceUsd: 200, priceRange: "$150–300",
    category: "footwear", affiliateUrl: null,
    reason: "Clean minimalist white sneaker",
  },
  {
    id: "s15", platform: "Suggestion", productName: "Canvas Slip-On Sneakers",
    productUrl: googleShoppingUrl("Canvas Slip-On Sneakers"),
    productImageUrl: "", priceUsd: 30, priceRange: "$20–45",
    category: "footwear", affiliateUrl: null,
    reason: "Budget-friendly everyday option",
  },

  // ── Accessories ─────────────────────────────────────────
  {
    id: "s16", platform: "Suggestion", productName: "Leather Belt Classic Buckle",
    productUrl: googleShoppingUrl("Leather Belt Classic Buckle"),
    productImageUrl: "", priceUsd: 22, priceRange: "$15–35",
    category: "accessories", affiliateUrl: null,
    reason: "Finishing touch for any outfit",
  },
  {
    id: "s17", platform: "Suggestion", productName: "Minimalist Watch Leather Band",
    productUrl: googleShoppingUrl("Minimalist Watch Leather Band"),
    productImageUrl: "", priceUsd: 55, priceRange: "$40–80",
    category: "accessories", affiliateUrl: null,
    reason: "Elevates casual and smart-casual looks",
  },
  {
    id: "s18", platform: "Suggestion", productName: "Neutral Print Silk Scarf",
    productUrl: googleShoppingUrl("Neutral Print Silk Scarf"),
    productImageUrl: "", priceUsd: 28, priceRange: "$18–40",
    category: "accessories", affiliateUrl: null,
    reason: "Adds personality to simple outfits",
  },
  {
    id: "s19", platform: "Suggestion", productName: "Canvas Tote Bag Everyday",
    productUrl: googleShoppingUrl("Canvas Tote Bag Everyday"),
    productImageUrl: "", priceUsd: 35, priceRange: "$25–50",
    category: "accessories", affiliateUrl: null,
    reason: "Practical and stylish everyday carry",
  },
  {
    id: "s20", platform: "Suggestion", productName: "Polarized Sunglasses Classic",
    productUrl: googleShoppingUrl("Polarized Sunglasses Classic"),
    productImageUrl: "", priceUsd: 45, priceRange: "$30–70",
    category: "accessories", affiliateUrl: null,
    reason: "Instant upgrade to any look",
  },
];

/** Build a Google Shopping search URL for a product name */
function googleShoppingUrl(query: string): string {
  return `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=shop`;
}

const VALID_CATEGORIES: Set<string> = new Set(["tops", "bottoms", "outerwear", "footwear", "accessories"]);

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const rawCategory = searchParams.get("category");

    let results = [...CATALOG];

    // Filter by canonical category field
    const category = rawCategory && VALID_CATEGORIES.has(rawCategory) ? rawCategory : undefined;
    if (category) {
      results = results.filter((p) => p.category === category);
    }

    return NextResponse.json({
      products: results,
      category: category ?? "all",
      total: results.length,
    });
  } catch (error) {
    console.error("Shop error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Shop fetch failed" },
      { status: 500 }
    );
  }
}
