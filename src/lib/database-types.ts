// ─── Simplified Database Types ────────────────────────────
// These are placeholder types for Supabase integration.
// In production, generate these with supabase gen types.

export type PlanTier = "free" | "pro" | "studio";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// Note: Using generic Row/Insert/Update types to avoid 'never' type errors.
// Replace with `supabase gen types` output when connected to a real instance.

export interface DatabaseRow {
  [key: string]: unknown;
}

export interface UsersRow {
  id: string;
  clerk_id: string;
  display_name: string | null;
  gender: string | null;
  body_type: string | null;
  skin_tone: string | null;
  height_cm: number | null;
  budget_monthly: number | null;
  location_zip: string | null;
  style_preferences: Json | null;
  plan: PlanTier;
  created_at: string;
}

export interface WardrobeItemRow {
  id: string;
  user_id: string;
  item_type: string;
  category: string;
  subtype: string | null;
  primary_color: string;
  secondary_color: string | null;
  pattern: string;
  material: string | null;
  occasions: string[];
  seasons: string[];
  formality_level: number;
  tags: string[] | null;
  ai_confidence: number;
  brand: string | null;
  size_text: string | null;
  purchased_from: string | null;
  price_usd: number | null;
  purchase_date: string | null;
  image_url: string;
  thumbnail_url: string;
  ai_raw_output: Json | null;
  is_favorite: boolean;
  is_archived: boolean;
  is_in_laundry: boolean;
  wear_count: number;
  last_worn_at: string | null;
  corrected_fields: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface OutfitRow {
  id: string;
  user_id: string;
  name: string;
  item_ids: string[];
  context: Json | null;
  ai_reasoning: string | null;
  confidence_score: number;
  planned_for: string | null;
  was_worn: boolean;
  worn_on_date: string | null;
  user_rating: number | null;
  is_favorite: boolean;
  created_at: string;
}
