-- ─── Phase 2 Migration: Gap Analysis, Shop, Planner ──────

-- Gap Analyses table
CREATE TABLE IF NOT EXISTS gap_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  gaps JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Shop Suggestions table
CREATE TABLE IF NOT EXISTS shop_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  wardrobe_item_id UUID REFERENCES wardrobe_items(id) ON DELETE SET NULL,
  platform TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_url TEXT,
  product_image_url TEXT,
  price_usd INT,
  affiliate_url TEXT,
  reason TEXT,
  clicked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Week Plans table
CREATE TABLE IF NOT EXISTS week_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  week_of DATE NOT NULL,
  days JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gap_analyses_user ON gap_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_shop_suggestions_user ON shop_suggestions(user_id);
CREATE INDEX IF NOT EXISTS idx_week_plans_user ON week_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_week_plans_week ON week_plans(user_id, week_of);

-- RLS Policies
ALTER TABLE gap_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE week_plans ENABLE ROW LEVEL SECURITY;

-- Gap analyses: users can see their own
CREATE POLICY "Users can view own gap analyses" ON gap_analyses
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own gap analyses" ON gap_analyses
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Shop suggestions: users can see their own
CREATE POLICY "Users can view own shop suggestions" ON shop_suggestions
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own shop suggestions" ON shop_suggestions
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Week plans: users can see their own
CREATE POLICY "Users can view own week plans" ON week_plans
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own week plans" ON week_plans
  FOR INSERT WITH CHECK (user_id = auth.uid());
