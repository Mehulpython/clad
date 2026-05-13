// ─── Single Source of Truth for Item Categories ─────────────
// Previously defined separately in:
//   • upload/route.ts  (categorizeItem — array-based)
//   • scan/route.ts    (itemCategoryMap — object-based)
//
// Both are now replaced by this one module.

import type { ClothingCategory } from "./types";

/** Authoritative itemType → ClothingCategory mapping. */
export const ITEM_CATEGORIES: Record<string, ClothingCategory> = {
  // Tops
  "t-shirt": "tops",
  polo: "tops",
  "button-up": "tops",
  hoodie: "tops",
  sweater: "tops",
  cardigan: "tops",
  sweatshirt: "tops",
  "tank-top": "tops",
  blouse: "tops",
  bodysuit: "tops",

  // Bottoms
  jeans: "bottoms",
  trousers: "bottoms",
  chinos: "bottoms",
  shorts: "bottoms",
  leggings: "bottoms",
  skirt: "bottoms",
  "mini-skirt": "bottoms",
  "midi-skirt": "bottoms",
  "maxi-skirt": "bottoms",

  // Dresses
  dress: "dresses",
  "mini-dress": "dresses",
  "midi-dress": "dresses",
  "maxi-dress": "dresses",
  jumpsuit: "dresses",
  romper: "dresses",
  suit: "dresses",
  "suit-separates": "dresses",

  // Outerwear
  jacket: "outerwear",
  blazer: "outerwear",
  coat: "outerwear",
  "denim-jacket": "outerwear",
  "leather-jacket": "outerwear",
  bomber: "outerwear",
  puffer: "outerwear",
  trench: "outerwear",

  // Footwear
  sneakers: "footwear",
  "running-shoes": "footwear",
  "high-tops": "footwear",
  loafers: "footwear",
  oxfords: "footwear",
  boots: "footwear",
  "ankle-boots": "footwear",
  "knee-high-boots": "footwear",
  heels: "footwear",
  pumps: "footwear",
  flats: "footwear",
  sandals: "footwear",
  "flip-flops": "footwear",
  slides: "footwear",
  crocs: "footwear",
  "dress-shoes": "footwear",

  // Accessories
  belt: "accessories",
  hat: "accessories",
  cap: "accessories",
  beanie: "accessories",
  scarf: "accessories",
  gloves: "accessories",
  watch: "accessories",
  bracelet: "accessories",
  necklace: "accessories",
  earrings: "accessories",
  ring: "accessories",
  sunglasses: "accessories",
  eyeglasses: "accessories",
  tie: "accessories",
  "bow-tie": "accessories",
  "pocket-square": "accessories",
  bag: "accessories",
  backpack: "accessories",
  tote: "accessories",
  crossbody: "accessories",
  clutch: "accessories",
  wallet: "accessories",
  umbrella: "accessories",

  // Activewear
  "activewear-top": "activewear",
  "activewear-bottom": "activewear",
  "sports-bra": "activewear",

  // Intimate
  pajamas: "intimate",
  robe: "intimate",
  undergarment: "intimate",

  // Swimwear
  "swimwear-top": "swimwear",
  "swimwear-bottom": "swimwear",
} as const;

/**
 * Return the `ClothingCategory` for a given itemType.
 * Falls back to `"tops"` for unknown types (safe default).
 */
export function categorizeItem(
  itemType: string,
  _description?: string,
): ClothingCategory {
  return ITEM_CATEGORIES[itemType] ?? ("tops" as ClothingCategory);
}

/** Complementary category lookup (used by scan route). */
export const COMPLEMENTARY_CATEGORIES: Record<string, string[]> = {
  tops: ["bottoms", "outerwear", "footwear"],
  bottoms: ["tops", "footwear", "belts"],
  outerwear: ["tops", "dresses", "footwear"],
  footwear: ["bottoms", "tops", "dresses"],
  dresses: ["outerwear", "footwear", "accessories"],
  accessories: ["tops", "dresses", "outerwear"],
} as const;
