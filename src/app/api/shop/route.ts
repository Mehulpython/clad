// ─── GET /api/shop ─────────────────────────────────────────
// Shop suggestions with affiliate links.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import type { ShopSuggestion } from "@/lib/shop-types";

// ── Mock Shop Data (replace with real affiliate API later) ──

const SHOP_CATALOG: ShopSuggestion[] = [
  // Tops
  { id: "s1", userId: "", platform: "Amazon", productName: "Essential Crew Neck T-Shirt (3-Pack)", productUrl: "https://amazon.com/dp/B08J9Y7XRS", productImageUrl: "", priceUsd: 29, affiliateUrl: "https://amzn.to/essential-tee", reason: "Wardrobe staple — pairs with everything" },
  { id: "s2", userId: "", platform: "H&M", productName: "Slim Fit Oxford Shirt", productUrl: "https://hm.com/product/oxford", productImageUrl: "", priceUsd: 35, affiliateUrl: null, reason: "Perfect for work and smart casual" },
  { id: "s3", userId: "", platform: "Zara", productName: "Oversized Knit Sweater", productUrl: "https://zara.com/sweater", productImageUrl: "", priceUsd: 60, affiliateUrl: null, reason: "Great layering piece for fall/winter" },
  { id: "s4", userId: "", platform: "Uniqlo", productName: "U-Airism T-Shirt", productUrl: "https://uniqlo.com/airism", productImageUrl: "", priceUsd: 15, affiliateUrl: null, reason: "Best basic tee for summer" },

  // Bottoms
  { id: "s5", userId: "", platform: "Levi's (Amazon)", productName: "501 Original Fit Jeans", productUrl: "https://amazon.com/dp/B0012VQ6CM", productImageUrl: "", priceUsd: 70, affiliateUrl: "https://amzn.to/levis501", reason: "Classic fit every wardrobe needs" },
  { id: "s6", userId: "", platform: "Target", productName: "Goodfellow Chinos Slim Fit", productUrl: "https://target.com/chinos", productImageUrl: "", priceUsd: 45, affiliateUrl: null, reason: "Best value chinos on the market" },
  { id: "s7", userId: "", platform: "ASOS", productName: "Tailored Black Trousers", productUrl: "https://asos.com/trousers", productImageUrl: "", priceUsd: 52, affiliateUrl: null, reason: "Essential for formal occasions" },
  { id: "s8", userId: "", platform: "H&M", productName: "Linen Blend Shorts", productUrl: "https://hm.com/shorts", productImageUrl: "", priceUsd: 25, affiliateUrl: null, reason: "Summer essential — breathable fabric" },

  // Outerwear
  { id: "s9", userId: "", platform: "Amazon", productName: "Denim Jacket Classic Trucker", productUrl: "https://amazon.com/dp/B07G2M9V4K", productImageUrl: "", priceUsd: 55, affiliateUrl: "https://amzn.to/denim-jacket", reason: "Layer over anything — timeless style" },
  { id: "s10", userId: "", platform: "Nordstrom", productName: "Trench Coat Midi Length", productUrl: "https://nordstrom.com/trench", productImageUrl: "", priceUsd: 189, affiliateUrl: null, reason: "Investment piece — lasts for years" },
  { id: "s11", userId: "", platform: "Zara", productName: "Puffer Jacket Lightweight", productUrl: "https://zara.com/puffer", productImageUrl: "", priceUsd: 90, affiliateUrl: null, reason: "Trendy but practical for cold weather" },

  // Footwear
  { id: "s12", userId: "", platform: "Nike (Amazon)", productName: "Air Force 1 '07 White", productUrl: "https://amazon.com/dp/B00DQRFLYK", productImageUrl: "", priceUsd: 110, affiliateUrl: "https://amzn.to/af1", reason: "#1 versatile sneaker — goes with 90% of outfits" },
  { id: "s13", userId: "", platform: "Steve Madden", productName: "Marte Ankle Boot Black", productUrl: "https://stevemadden.com/boots", productImageUrl: "", priceUsd: 130, affiliateUrl: null, reason: "Elevates any outfit instantly" },
  { id: "s14", userId: "", platform: "Amazon", productName: "Common Projects Achilles Low", productUrl: "https://amazon.com/dp/B01HIZ8C38", productImageUrl: "", priceUsd: 285, affiliateUrl: "https://amzn.to/cp-achilles", reason: "Clean minimalist white sneaker" },
  { id: "s15", userId: "", platform: "Target", productName: "Canvas Slip-On Sneakers", productUrl: "https://target.com/slipon", productImageUrl: "", priceUsd: 30, affiliateUrl: null, reason: "Budget-friendly everyday option" },

  // Dresses
  { id: "s16", userId: "", platform: "Revolve", productName: "Little Black Dress Midi", productUrl: "https://revolve.com/lbd", productImageUrl: "", priceUsd: 128, affiliateUrl: null, reason: "Every woman needs an LBD" },
  { id: "s17", userId: "", platform: "H&M", productName: "Floral Wrap Dress", productUrl: "https://hm.com/wrap-dress", productImageUrl: "", priceUsd: 50, affiliateUrl: null, reason: "Great for brunch, dates, and summer events" },

  // Accessories
  { id: "s18", userId: "", platform: "Amazon", productName: "Leather Belt Classic Buckle", productUrl: "https://amazon.com/dp/B07FZ8N4SV", productImageUrl: "", priceUsd: 18, affiliateUrl: "https://amzn.to/leather-belt", reason: "Finishing touch for any outfit" },
  { id: "s19", userId: "", platform: "Amazon", productName: "Minimalist Watch Leather Band", productUrl: "https://amazon.com/dp/B08L9YPQN4", productImageUrl: "", priceUsd: 45, affiliateUrl: "https://amzn.to/minimal-watch", reason: "Elevates casual and smart-casual looks" },
  { id: "s20", userId: "", platform: "ASOS", productName: "Silk Scarf Neutral Print", productUrl: "https://asos.com/scarf", productImageUrl: "", priceUsd: 22, affiliateUrl: null, reason: "Adds personality to simple outfits" },
];

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const color = searchParams.get("color");
    const platform = searchParams.get("platform");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    let results = [...SHOP_CATALOG];

    if (category) {
      results = results.filter((s) =>
        s.productName.toLowerCase().includes(category.toLowerCase()) ||
        s.reason.toLowerCase().includes(category.toLowerCase())
      );
    }

    if (color) {
      results = results.filter((s) =>
        s.productName.toLowerCase().includes(color.toLowerCase())
      );
    }

    if (platform) {
      results = results.filter((s) =>
        s.platform.toLowerCase() === platform.toLowerCase()
      );
    }

    if (minPrice) {
      results = results.filter((s) => s.priceUsd >= Number(minPrice));
    }

    if (maxPrice) {
      results = results.filter((s) => s.priceUsd <= Number(maxPrice));
    }

    return NextResponse.json({
      suggestions: results,
      total: results.length,
      filters: { category, color, platform, minPrice, maxPrice },
      platforms: [...new Set(SHOP_CATALOG.map((s) => s.platform))],
    });
  } catch (error) {
    console.error("Shop error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Shop fetch failed" },
      { status: 500 }
    );
  }
}
