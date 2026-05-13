// ─── Shared DB Entity Mappers ───────────────────────────────
// Single source of truth for mapping Supabase rows → TypeScript types.
// Previously copy-pasted in 4+ API routes.

import type { WardrobeItem } from "./types";
import type { Occasion, Season } from "./types";

/**
 * Map a single `wardrobe_items` DB row → WardrobeItem.
 *
 * This is the **canonical** mapping.  All API routes that read
 * wardrobe_items should use this instead of inlining the same ~35 lines.
 */
export function mapWardrobeRow(row: Record<string, unknown>): WardrobeItem {
  return {
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
    correctedFields: (Array.isArray(row.corrected_fields)
      ? row.corrected_fields
      : []) as string[],
    suggestedName:
      ((row.ai_raw_output as Record<string, unknown>)?.suggestedName as string) ||
      ((row.primary_color as string) + " " + (row.item_type as string)),
    createdAt: (row.created_at as string) || "",
    updatedAt: (row.updated_at as string) || "",
  };
}

/** Map an array of DB rows → WardrobeItem[]. */
export function mapWardrobeRows(
  rows: Record<string, unknown>[],
): WardrobeItem[] {
  return rows.map(mapWardrobeRow);
}
