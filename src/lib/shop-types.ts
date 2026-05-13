// ─── Shop Suggestion Type ───────────────────────────────────

export interface ShopSuggestion {
  id?: string;
  userId?: string;
  wardrobeItemId?: string;
  /** AI-curated suggestion label (not a real store) */
  platform: string;
  productName: string;
  /** Google Shopping search URL — no fake affiliate links */
  productUrl: string;
  productImageUrl: string;
  /** Exact midpoint price for sorting; display uses priceRange */
  priceUsd: number;
  /** Human-readable range like "$25–45" */
  priceRange: string;
  /** Canonical category for filtering */
  category: "tops" | "bottoms" | "outerwear" | "footwear" | "accessories";
  affiliateUrl: string | null;
  reason: string;
  clickedAt?: string | null;
  createdAt?: string;
}
