// ─── Shop Suggestion Type ───────────────────────────────────

export interface ShopSuggestion {
  id?: string;
  userId?: string;
  wardrobeItemId?: string;
  platform: string;
  productName: string;
  productUrl: string;
  productImageUrl: string;
  priceUsd: number;
  affiliateUrl: string | null;
  reason: string;
  clickedAt?: string | null;
  createdAt?: string;
}
