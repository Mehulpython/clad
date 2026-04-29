-- ─── Clad Database Schema ──────────────────────────────────
-- Phase 1: Core wardrobe + outfits

-- ─── Users ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_id TEXT UNIQUE NOT NULL,
  display_name TEXT,
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer-not')),
  body_type TEXT CHECK (body_type IN ('slim', 'athletic', 'average', 'broad', 'plus-size')),
  skin_tone TEXT CHECK (skin_tone IN ('fair', 'light', 'medium', 'olive', 'tan', 'dark')),
  height_cm INT CHECK (height_cm BETWEEN 100 AND 250),
  budget_monthly INT DEFAULT NULL CHECK (budget_monthly >= 0),
  location_zip TEXT,
  style_preferences JSONB DEFAULT '{}'::jsonb,
  plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro', 'studio')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Wardrobe Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.wardrobe_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,

  -- AI-generated attributes
  item_type TEXT NOT NULL,
  category TEXT NOT NULL,
  subtype TEXT,
  primary_color TEXT NOT NULL,
  secondary_color TEXT,
  pattern TEXT NOT NULL DEFAULT 'solid',
  material TEXT,
  occasions TEXT[] NOT NULL DEFAULT '{}',
  seasons TEXT[] NOT NULL DEFAULT '{}',
  formality_level INT NOT NULL DEFAULT 3 CHECK (formality_level BETWEEN 1 AND 5),
  tags TEXT[] DEFAULT NULL,
  ai_confidence REAL NOT NULL DEFAULT 0.5 CHECK (ai_confidence BETWEEN 0 AND 1),

  -- User-provided data
  brand TEXT,
  size_text TEXT,
  purchased_from TEXT,
  price_usd INT CHECK (price_usd >= 0),
  purchase_date DATE,

  -- Media
  image_url TEXT NOT NULL,
  thumbnail_url TEXT NOT NULL,
  ai_raw_output JSONB,

  -- State
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  is_in_laundry BOOLEAN NOT NULL DEFAULT false,
  wear_count INT NOT NULL DEFAULT 0,
  last_worn_at TIMESTAMPTZ,
  corrected_fields TEXT[] DEFAULT '{}',

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Outfits ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.outfits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  item_ids UUID[] NOT NULL,
  context JSONB,
  ai_reasoning TEXT,
  confidence_score REAL NOT NULL DEFAULT 0 CHECK (confidence_score BETWEEN 0 AND 1),

  -- Planning state
  planned_for DATE,
  was_worn BOOLEAN NOT NULL DEFAULT false,
  worn_on_date DATE,
  user_rating INT CHECK (user_rating BETWEEN 1 AND 5),
  is_favorite BOOLEAN NOT NULL DEFAULT false,

  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ─── Indexes ────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_wardrobe_user ON public.wardrobe_items(user_id, is_archived);
CREATE INDEX IF NOT EXISTS idx_wardrobe_type ON public.wardrobe_items(user_id, category, item_type);
CREATE INDEX IF NOT EXISTS idx_wardrobe_color ON public.wardrobe_items(user_id, primary_color);
CREATE INDEX IF NOT EXISTS idx_outfits_user ON public.outfits(user_id, created_at DESC);

-- ─── Row Level Security ─────────────────────────────────────
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wardrobe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outfits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.users FOR SELECT USING (auth.uid()::text = clerk_id);
CREATE POLICY "Users can update own profile" ON public.users FOR UPDATE USING (auth.uid()::text = clerk_id);

CREATE POLICY "Users can manage own wardrobe" ON public.wardrobe_items FOR ALL USING (user_id = auth.uid());
CREATE POLICY "Users can manage own outfits" ON public.outfits FOR ALL USING (user_id = auth.uid());

-- ─── Functions ──────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_wardrobe_items_updated_at ON public.wardrobe_items;
CREATE TRIGGER update_wardrobe_items_updated_at
  BEFORE UPDATE ON public.wardrobe_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
