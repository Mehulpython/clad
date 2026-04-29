// ─── Clad Core Types ──────────────────────────────────────

export type BodyType = "slim" | "athletic" | "average" | "broad" | "plus-size";
export type SkinTone = "fair" | "light" | "medium" | "olive" | "tan" | "dark";
export type Gender = "male" | "female" | "non-binary" | "prefer-not";

export type ItemType =
  | "t-shirt"
  | "polo"
  | "button-up"
  | "hoodie"
  | "sweater"
  | "cardigan"
  | "sweatshirt"
  | "tank-top"
  | "blouse"
  | "bodysuit"
  | "jacket"
  | "blazer"
  | "coat"
  | "denim-jacket"
  | "leather-jacket"
  | "bomber"
  | "puffer"
  | "trench"
  | "jeans"
  | "trousers"
  | "chinos"
  | "shorts"
  | "leggings"
  | "skirt"
  | "mini-skirt"
  | "midi-skirt"
  | "maxi-skirt"
  | "dress"
  | "mini-dress"
  | "midi-dress"
  | "maxi-dress"
  | "jumpsuit"
  | "romper"
  | "suit"
  | "suit-separates"
  | "activewear-top"
  | "activewear-bottom"
  | "sports-bra"
  | "swimwear-top"
  | "swimwear-bottom"
  | "pajamas"
  | "robe"
  | "undergarment";

export type FootwearType =
  | "sneakers"
  | "running-shoes"
  | "high-tops"
  | "loafers"
  | "oxfords"
  | "boots"
  | "ankle-boots"
  | "knee-high-boots"
  | "heels"
  | "pumps"
  | "flats"
  | "sandals"
  | "flip-flops"
  | "slides"
  | "crocs"
  | "dress-shoes";

export type AccessoryType =
  | "belt"
  | "hat"
  | "cap"
  | "beanie"
  | "scarf"
  | "gloves"
  | "watch"
  | "bracelet"
  | "necklace"
  | "earrings"
  | "ring"
  | "sunglasses"
  | "eyeglasses"
  | "tie"
  | "bow-tie"
  | "pocket-square"
  | "bag"
  | "backpack"
  | "tote"
  | "crossbody"
  | "clutch"
  | "wallet"
  | "umbrella";

export type ClothingCategory = "tops" | "bottoms" | "dresses" | "outerwear" | "footwear" | "accessories" | "activewear" | "intimate" | "sleepwear" | "swimwear";

export type Occasion = "casual" | "work" | "party" | "date-night" | "gym" | "formal" | "outdoor" | "travel" | "brunch" | "concert" | "interview";
export type Season = "spring" | "summer" | "fall" | "winter" | "all-season";
export type Pattern = "solid" | "striped" | "plaid" | "checkered" | "floral" | "geometric" | "abstract" | "tie-dye" | "camo" | "animal-print" | "paisley" | "polka-dot" | "herringbone" | "color-block" | "heathered" | "textured";
export type Material = "cotton" | "linen" | "denim" | "wool" | "cashmere" | "silk" | "polyester" | "rayon" | "leather" | "faux-leather" | "nylon" | "spandex" | "blend" | "fleece" | "velvet" | "corduroy" | "chiffon" | "satin" | "jersey" | "tweed" | "canvas" | "rubber" | "synthetic";

export type Mood = "professional" | "bold" | "comfortable" | "experimental" | "classic" | "trendy" | "minimal" | "playful" | "edgy" | "romantic";

// ─── Wardrobe Item (AI-analyzed) ─────────────────────────────

export interface WardrobeItem {
  id: string;
  userId: string;

  // AI-generated
  itemType: ItemType | FootwearType | AccessoryType;
  category: ClothingCategory;
  subtype: string;
  suggestedName: string;
  primaryColor: string;
  secondaryColor: string | null;
  pattern: Pattern;
  material: Material | null;
  occasions: Occasion[];
  seasons: Season[];
  formalityLevel: number; // 1-5
  tags: string[];
  aiConfidence: number;

  // User-provided
  brand: string | null;
  size: string | null;
  purchasedFrom: string | null;
  priceUsd: number | null;
  purchaseDate: string | null;

  // Media
  imageUrl: string;
  thumbnailUrl: string;
  aiRawOutput: Record<string, unknown> | null;

  // State
  isFavorite: boolean;
  isArchived: boolean;
  isInLaundry: boolean;
  wearCount: number;
  lastWornAt: string | null;
  correctedFields: string[];

  createdAt: string;
  updatedAt: string;
}

// ─── Outfit ─────────────────────────────────────────────────

export interface Outfit {
  id: string;
  userId: string;
  name: string;
  itemIds: string[];

  // Generation context
  context: OutfitContext;
  aiReasoning: string;
  confidenceScore: number;

  // State
  plannedFor: string | null;
  wasWorn: boolean;
  wornOnDate: string | null;
  userRating: number | null; // 1-5
  isFavorite: boolean;

  items?: WardrobeItem[]; // populated on read

  createdAt: string;
}

// ─── Outfit Context ──────────────────────────────────────────

export interface OutfitContext {
  weather?: {
    tempF: number;
    condition: string;
    humidity: number;
    windMph: number;
  };
  occasion: Occasion;
  mood: Mood;
  timeAvailable: "rushed" | "normal" | "relaxed";
  locationType: "indoor" | "outdoor" | "mixed";
  excludeItemIds?: string[];
  forceIncludeItemIds?: string[];
}

// ─── Outfit Generation Result ───────────────────────────────

export interface GeneratedOutfit {
  id?: string;
  name: string;
  itemIds: string[];
  reasoning: string;
  colorTheory: string;
  confidence: number;
  swapSuggestions: SwapSuggestion[];
}

export interface SwapSuggestion {
  replaceItemId: string;
  withItemId: string;
  reason: string;
}

// ─── Gap Analysis ───────────────────────────────────────────

export interface WardrobeGap {
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  description: string;
  suggestedItems: GapSuggestion[];
  combinationsUnlocked: number;
}

export interface GapSuggestion {
  name: string;
  type: string;
  color: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  shopUrl: string | null;
  platform: string | null;
}

// ─── Pre-Purchase Scan Result ──────────────────────────────

export type ScanVerdict = "great-buy" | "decent" | "skip" | "duplicate";

export interface PrePurchaseScan {
  verdict: ScanVerdict;
  score: number; // 0-100
  reasoning: string;
  combinationsWithExisting: number;
  wardrobeItemsThatMatch: string[];
  costPerWearEstimate: string | null;
  alternativesAlreadyOwned: string[];
}

// ─── User Profile / Style ──────────────────────────────────

export interface UserProfile {
  id: string;
  clerkId: string;
  displayName: string | null;
  gender: Gender | null;
  bodyType: BodyType | null;
  skinTone: SkinTone | null;
  heightCm: number | null;
  budgetMonthly: number | null;
  locationZip: string | null;
  stylePreferences: StylePreferences;
  itemCount: number;
  outfitCount: number;
  createdAt: string;
}

export interface StylePreferences {
  favoriteColors: string[];
  avoidedColors: string[];
  preferredStyle: string; // "minimal", "streetwear", "bohemian", "classic", "trendy", "edgy", "preppy", "athleisure"
  riskTolerance: "safe" | "moderate" | "bold";
  brandAffinity: string[] | null;
  dressCodeNotes: string | null;
}

// ─── Outfit Engine Types ─────────────────────────────────────

export interface ColorHarmony {
  complementary: string[];
  analogous: string[];
  triadic: string[];
}

export interface OutfitCandidate {
  items: WardrobeItem[];
  score: number;
}

// ─── Weekly Planner ────────────────────────────────────────

export interface DayPlan {
  date: string;
  dayName: string;
  morningOutfit: Outfit | null;
  eveningOutfit: Outfit | null;
  eventOutfits: Array<{ eventName: string; outfit: Outfit }>;
  notes: string | null;
}

export interface WeekPlan {
  weekOf: string;
  days: DayPlan[];
  generatedAt: string;
}
