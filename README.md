# Clad — AI Smart Wardrobe

> Your closet, but smart. Powered by GPT-4o Vision.

## What It Does

1. **Upload your wardrobe** — Camera or gallery, batch upload up to 20 photos at a time
2. **AI auto-analyzes** each item (GPT-4o Vision) → type, color, pattern, material, occasions, formality
3. **Generate outfit combinations** — Algorithmic engine + AI reasoning for styled looks
4. **Weekly planner** — Auto-generates 7-day outfit schedule with one-click regeneration

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| Auth | Clerk |
| Database | Supabase (PostgreSQL + RLS) |
| AI Vision | OpenAI GPT-4o |
| AI Reasoning | GPT-4o (outfit refinement) |
| Weather | Open-Meteo API (free) |
| Image Storage | Cloudflare R2 (planned) |
| Payments | Stripe (Phase 2) |

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase project (free tier works)
- Clerk application (free tier works)
- OpenAI API key (with GPT-4o access)

### Setup

```bash
# Clone and install
git clone <repo-url>
cd clad
npm install

# Environment variables
cp .env.example .env.local
# Edit .env.local with your keys

# Run SQL migration in Supabase dashboard:
# supabase/migrations/001_schema.sql

# Start dev server
npm run dev
```

### Environment Variables

See `.env.example` for all required variables:

- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` / `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` / `CLERK_SECRET_KEY`
- `OPENAI_API_KEY`

## Project Structure

```
src/
├── app/
│   ├── page.tsx              # Landing page
│   ├── upload/page.tsx       # Wardrobe photo upload
│   ├── wardrobe/page.tsx     # Digital wardrobe grid/list
│   ├── outfits/page.tsx      # AI outfit generator
│   ├── planner/page.tsx      # Weekly outfit planner
│   └── api/
│       ├── wardrobe/
│       │   ├── upload/route.ts    # POST: Upload + AI analyze
│       │   └── route.ts          # GET/PATCH/DELETE: CRUD
│       ├── outfits/generate/route.ts  # POST: Generate outfits
│       └── weather/route.ts     # GET: Weather data
├── lib/
│   ├── types.ts              # TypeScript type definitions
│   ├── vision.ts             # GPT-4o Vision clothing analysis
│   ├── fit-engine.ts         # Outfit generation algorithm + LLM
│   ├── supabase.ts           # Supabase client helpers
│   └── database-types.ts     # DB row types
└── globals.css               # Dark theme styles
```

## Features (Phase 1 - MVP)

### Wardrobe Upload & AI Analysis
- Drag-and-drop or click-to-upload (JPEG, PNG, WebP, GIF)
- Batch processing (up to 20 images)
- GPT-4o Vision identifies: item type, color, pattern, material, formality level, occasions, seasons
- Confidence score per analysis
- User can correct AI tags (feedback loop)

### Digital Wardrobe
- Grid view with category filters (tops, bottoms, dresses, outerwear, footwear, accessories)
- Search by color/type
- Quick actions: favorite, laundry mode, archive
- Detail modal with full AI analysis display
- Wear count tracking

### Outfit Generator
- Context controls: occasion (10 options), mood (8 options)
- Auto weather detection via Open-Meteo API
- Algorithmic candidate generation (color harmony, pattern rules, formality matching, season appropriateness)
- GPT-4o reasoning for top candidates (name, explanation, color theory, swap suggestions)
- 3-5 outfit options per generation
- Expandable cards with "Why This Works" details

### Weekly Planner
- 7-day Sunday-Saturday view
- Auto-generates on load
- Per-day regenerate button
- Today highlighting
- Past day dimming

## Database Schema

Core tables: `users`, `wardrobe_items`, `outfits`

Full schema in `supabase/migrations/001_schema.sql`

Includes Row Level Security (RLS) policies ensuring users only access their own data.

## Roadmap

- [x] Phase 1: MVP — Wardrobe upload, AI tagging, outfit generator, weekly planner
- [ ] Phase 2: Shopping & Revenue — Gap analysis, shop integrations (Amazon, Zara, etc.), pre-purchase scanner, Stripe subscriptions ($6.99/mo Pro, $14.99/mo Studio)
- [ ] Phase 3: Social — Outfit sharing, community voting, style quiz onboarding, calendar integration
- [ ] Phase 4: Advanced — Virtual try-on, sustainability scores, travel packing assistant, brand partnerships

## Pricing (Planned)

| | Free | Pro ($6.99/mo) | Studio ($14.99/mo) |
|---|------|-----------------|-------------------|
| Items | 25 | 200 | Unlimited |
| Outfits/day | 3 | Unlimited | Unlimited |
| Weekly Planner | ❌ | ✅ | ✅ |
| Gap Analysis | Basic | Full | Deep |
| Pre-Purchase Scanner | ❌ | 5/day | Unlimited |

## License

Private — All rights reserved.
