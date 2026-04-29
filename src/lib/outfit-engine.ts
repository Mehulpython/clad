// ─── Outfit Generation Engine ───────────────────────────────
// Algorithmic candidate generation + AI refinement.

import OpenAI from "openai";
import type {
  WardrobeItem,
  GeneratedOutfit,
  OutfitContext,
  OutfitCandidate,
  ColorHarmony,
  Occasion,
} from "./types";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Color Harmony Wheel ────────────────────────────────────

const colorWheel: Record<string, ColorHarmony> = {
  red:     { complementary: ["green"],  analogous: ["orange", "pink"],   triadic: ["blue", "yellow"] },
  blue:    { complementary: ["orange"], analogous: ["purple", "green"],  triadic: ["red", "yellow"] },
  yellow:  { complementary: ["purple"], analogous: ["green", "orange"],  triadic: ["blue", "red"] },
  green:   { complementary: ["red"],    analogous: ["yellow", "blue"],   triadic: ["orange", "purple"] },
  orange:  { complementary: ["blue"],   analogous: ["yellow", "red"],    triadic: ["green", "purple"] },
  purple:  { complementary: ["yellow"],analogous: ["blue", "pink"],      triadic: ["green", "orange"] },
  pink:    { complementary: ["green"],  analogous: ["purple", "red"],    triadic: ["blue", "orange"] },
  brown:   { complementary: ["navy"],   analogous: ["green", "burgundy"],triadic: ["cream", "olive"] },
  navy:    { complementary: ["brown"],  analogous: ["blue", "black"],     triadic: ["orange", "maroon"] },
  white:   { complementary: [],        analogous: ["cream", "gray"],     triadic: [] },
  black:   { complementary: [],        analogous: ["gray", "navy"],      triadic: [] },
  gray:    { complementary: [],        analogous: ["black", "white"],    triadic: [] },
  beige:   { complementary: [],        analogous: ["cream", "brown"],    triadic: [] },
  cream:   { complementary: [],        analogous: ["beige", "white"],    triadic: [] },
};

function getHarmonyScore(colorA: string, colorB: string): number {
  const a = colorA.toLowerCase().trim();
  const b = colorB.toLowerCase().trim();
  if (a === b) return 0.3;
  const harmony = colorWheel[a];
  if (!harmony) return 0.5;
  if (harmony.complementary.includes(b)) return 1.0;
  if (harmony.analogous.includes(b)) return 0.8;
  if (harmony.triadic.includes(b)) return 0.7;
  return 0.4;
}

// ── Pattern Compatibility ─────────────────────────────────

const patternCompatibility: Record<string, string[]> = {
  solid:      ["solid", "striped", "plaid"],
  striped:    ["solid", "plaid"],
  plaid:      ["solid", "striped"],
  checkered:  ["solid", "striped"],
  floral:     ["solid"],
  geometric:  ["solid", "plaid"],
  abstract:   ["solid"],
  paisley:    ["solid"],
  "polka-dot": ["solid"],
  "color-block": ["solid"],
};

function getPatternScore(patternA: string, patternB: string): number {
  if (!patternA || !patternB) return 0.7;
  const a = patternA.toLowerCase();
  const b = patternB.toLowerCase();
  if (a === b && a === "solid") return 1.0;
  const allowed = patternCompatibility[a] || ["solid"];
  return allowed.includes(b) ? 0.8 : 0.2;
}

// ── Candidate Generation ───────────────────────────────────

export function generateOutfitCandidates(
  wardrobe: WardrobeItem[],
  context: OutfitContext
): OutfitCandidate[] {
  const candidates: OutfitCandidate[] = [];

  const tops = wardrobe.filter(function(i) { return i.category === "tops"; });
  const bottoms = wardrobe.filter(function(i) { return i.category === "bottoms"; });
  const dresses = wardrobe.filter(function(i) { return i.category === "dresses"; });
  const outerwear = wardrobe.filter(function(i) { return i.category === "outerwear"; });
  const footwear = wardrobe.filter(function(i) { return i.category === "footwear"; });
  const accessories = wardrobe.filter(function(i) { return i.category === "accessories"; });

  // Strategy 1: Dress-based outfits
  for (let di = 0; di < dresses.length; di++) {
    const dress = dresses[di];
    const items: WardrobeItem[] = [dress];
    const layer = pickBestLayer(outerwear, dress);
    if (layer) items.push(layer);
    const shoe = pickBestShoe(footwear, items);
    if (shoe) items.push(shoe);
    const acc = pickAccessory(accessories);
    if (acc) items.push(acc);
    candidates.push({ items, score: scoreCandidate(items, context) });
  }

  // Strategy 2: Top + Bottom combinations
  let count = 0;
  const maxComb = 50;
  for (let ti = 0; ti < tops.length; ti++) {
    for (let bi = 0; bi < bottoms.length; bi++) {
      if (count >= maxComb) break;
      const items: WardrobeItem[] = [tops[ti], bottoms[bi]];
      const layer = pickBestLayer(outerwear, tops[ti]);
      if (layer) items.push(layer);
      const shoe = pickBestShoe(footwear, items);
      if (shoe) items.push(shoe);
      const acc = pickAccessory(accessories);
      if (acc) items.push(acc);
      candidates.push({ items, score: scoreCandidate(items, context) });
      count++;
    }
  }

  candidates.sort(function(a, b) { return b.score - a.score; });
  return candidates.slice(0, 20);
}

// ── Item Pickers (greedy best-match) ───────────────────────

function pickBestLayer(available: WardrobeItem[], baseItem: WardrobeItem): WardrobeItem | null {
  if (available.length === 0) return null;
  let best: WardrobeItem | null = null;
  let bestScore = -1;
  for (let i = 0; i < available.length; i++) {
    const item = available[i];
    const colorS = getHarmonyScore(baseItem.primaryColor || "", item.primaryColor || "");
    const patternS = getPatternScore(baseItem.pattern || "solid", item.pattern || "solid");
    const score = colorS * 0.6 + patternS * 0.4;
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return best;
}

function pickBestShoe(available: WardrobeItem[], outfitItems: WardrobeItem[]): WardrobeItem | null {
  if (available.length === 0) return null;
  let best: WardrobeItem | null = null;
  let bestScore = -1;
  for (let i = 0; i < available.length; i++) {
    const item = available[i];
    let score = 0;
    for (let j = 0; j < outfitItems.length; j++) {
      score += getHarmonyScore(outfitItems[j].primaryColor || "", item.primaryColor || "");
    }
    score /= outfitItems.length;
    if (score > bestScore) { bestScore = score; best = item; }
  }
  return best;
}

function pickAccessory(available: WardrobeItem[]): WardrobeItem | null {
  if (available.length === 0) return null;
  return available[Math.floor(Math.random() * available.length)];
}

// ── Candidate Scoring ──────────────────────────────────────

function scoreCandidate(items: WardrobeItem[], context: OutfitContext): number {
  if (items.length === 0) return 0;

  let total = 0;
  const colorWeight = 0.3;
  const patternWeight = 0.15;
  const formalityWeight = 0.2;
  const occasionWeight = 0.2;
  const weatherWeight = 0.15;

  const formalityMap: Record<string, number> = {
    formal: 5, work: 5, "date-night": 3, casual: 2,
    gym: 1, travel: 2, party: 4, outdoor: 2,
    brunch: 3, concert: 3, interview: 5,
  };
  const targetFormality = formalityMap[context.occasion] || 3;

  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];

    // Pairwise color harmony
    let colorScore = 0;
    let pairCount = 0;
    for (let j = 0; j < items.length; j++) {
      if (items[j].id !== item.id) {
        colorScore += getHarmonyScore(item.primaryColor || "", items[j].primaryColor || "");
        pairCount++;
      }
    }
    colorScore = pairCount > 0 ? colorScore / pairCount : 0.5;

    // Pattern compatibility (multiplicative)
    let patternScore: number = 1;
    for (let j = 0; j < items.length; j++) {
      if (items[j].id !== item.id) {
        patternScore = patternScore * getPatternScore(item.pattern || "solid", items[j].pattern || "solid");
      }
    }

    const formalityScore = scoreFormality(item, targetFormality);
    const occasionScore = scoreOccasion(item, context.occasion);
    const weatherScore = scoreWeather(item, context.weather);

    total = total + (colorWeight * colorScore)
           + (patternWeight * patternScore)
           + (formalityWeight * formalityScore)
           + (occasionWeight * occasionScore)
           + (weatherWeight * weatherScore);
  }

  total = total / items.length;

  // Completion bonuses
  const hasTop = items.some(function(i) { return i.category === "tops"; });
  const hasBottom = items.some(function(i) { return i.category === "bottoms"; });
  const hasLayer = items.some(function(i) { return i.category === "outerwear"; });
  const hasShoes = items.some(function(i) { return i.category === "footwear"; });
  if (hasTop && hasBottom) total = total + 0.15;
  if (hasLayer) total = total + 0.1;
  if (hasShoes) total = total + 0.1;

  return Math.min(total, 1.0);
}

// ── Scoring Helpers ────────────────────────────────────────

function scoreFormality(item: WardrobeItem, targetFormality: number): number {
  const itemFormal = item.formalityLevel || 3;
  const diff = Math.abs(itemFormal - targetFormality);
  return Math.max(0, 1 - diff / 5);
}

function scoreOccasion(item: WardrobeItem, occasion: string): number {
  if (!item.occasions || item.occasions.length === 0) return 0.5;
  return item.occasions.includes(occasion as Occasion) ? 1.0 : 0.2;
}

function scoreWeather(item: WardrobeItem, weather?: OutfitContext["weather"]): number {
  if (!weather) return 0.7;
  const tempF = weather.tempF;
  const tempC = (tempF - 32) * 5 / 9;
  const itemSeasons = item.seasons || ["fall"];
  var seasonForTemp = "spring";
  if (tempC < 5) seasonForTemp = "winter";
  else if (tempC < 18) seasonForTemp = "fall";
  else if (tempC >= 28) seasonForTemp = "summer";
  if (itemSeasons.indexOf(seasonForTemp as any) >= 0) return 1.0;
  return 0.4;
}

// ── AI Refinement via GPT-4o ───────────────────────────────

export async function refineOutfitsWithAI(
  candidates: OutfitCandidate[],
  context: OutfitContext,
  profile?: { stylePreferences?: Record<string, unknown>; favoriteColors?: string[] }
): Promise<GeneratedOutfit[]> {
  if (candidates.length === 0) return [];

  // Build candidate descriptions
  var lines: string[] = [];
  for (let idx = 0; idx < candidates.length; idx++) {
    const c = candidates[idx];
    var parts: string[] = [];
    for (let pi = 0; pi < c.items.length; pi++) {
      const it = c.items[pi];
      parts.push(it.itemType + " (" + it.primaryColor + " " + it.subtype + ")");
    }
    lines.push("Outfit " + (idx + 1) + ": " + parts.join(" + ") + " [score: " + c.score.toFixed(2) + "]");
  }
  const candidatesDesc = lines.join("\n");

  var stylePref = "casual";
  if (profile != null && profile.stylePreferences != null) {
    const sp = profile.stylePreferences as unknown as Record<string, unknown>;
    if (typeof sp.preferredStyle === "string") stylePref = sp.preferredStyle;
  }

  var favColors = "neutral";
  if (profile && Array.isArray(profile.favoriteColors) && profile.favoriteColors.length > 0) {
    favColors = profile.favoriteColors.join(", ");
  }

  // Build prompt using array join to avoid parser issues with complex strings
  var promptLines: string[] = [];
  promptLines.push("You are a professional fashion stylist. Review these algorithmically-generated outfit suggestions and refine them.");
  promptLines.push("");
  promptLines.push("USER CONTEXT:");
  promptLines.push("- Occasion: " + context.occasion);
  var wstr = "unknown";
  if (context.weather != null) {
    wstr = String(context.weather.tempF) + "\u00B0F, " + String(context.weather.condition);
  }
  promptLines.push("- Weather: " + wstr);
  promptLines.push("- Mood: " + (context.mood || "neutral"));
  promptLines.push("- Preferred style: " + stylePref);
  promptLines.push("- Favorite colors: " + favColors);
  promptLines.push("");
  promptLines.push("CANDIDATE OUTFITS:");
  promptLines.push(candidatesDesc);
  promptLines.push("");
  promptLines.push("Respond with a JSON object containing an \"outfits\" array of the top 5 refined outfits.");
  promptLines.push("Each outfit needs: name (creative), items (array of descriptions), reasoning (1-2 sentences), colorTheory, confidence (0-1).");
  promptLines.push("Return ONLY raw JSON, no markdown fences.");

  const prompt = promptLines.join("\n");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content || "{}";
    var parsed: any;
    try { parsed = JSON.parse(content); } catch { parsed = {}; }
    var outfits = parsed.outfits || parsed;
    if (!Array.isArray(outfits)) return [];

    var results: GeneratedOutfit[] = [];
    for (let oi = 0; oi < Math.min(outfits.length, 5); oi++) {
      const o = outfits[oi] as any;
      const src = candidates[oi] || candidates[0];
      results.push({
        name: (o && typeof o.name === "string") ? o.name : "Untitled Outfit",
        itemIds: src.items.map(function(i: WardrobeItem) { return i.id; }),
        reasoning: (o && typeof o.reasoning === "string") ? o.reasoning : "AI-curated outfit.",
        colorTheory: (o && typeof o.colorTheory === "string") ? o.colorTheory : "complementary",
        confidence: (o && typeof o.confidence === "number") ? o.confidence : 0.7,
        swapSuggestions: [],
      } as GeneratedOutfit);
    }
    return results;
  } catch (error) {
    console.error("[outfit-engine] AI refinement failed:", error);
    // Fallback: convert candidates directly
    var fallback: GeneratedOutfit[] = [];
    for (let fi = 0; fi < Math.min(candidates.length, 5); fi++) {
      const fc = candidates[fi];
      var fnames: string[] = [];
      for (let ni = 0; ni < fc.items.length; ni++) {
        fnames.push(fc.items[ni].itemType);
      }
      fallback.push({
        name: fc.items[0]?.suggestedName || fnames.join(" + "),
        itemIds: fc.items.map(function(i: WardrobeItem) { return i.id; }),
        reasoning: "Algorithmically generated based on color harmony and occasion matching.",
        colorTheory: "complementary",
        confidence: fc.score,
        swapSuggestions: [],
      } as GeneratedOutfit);
    }
    return fallback;
  }
}
