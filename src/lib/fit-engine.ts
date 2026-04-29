// ─── Outfit Generation Engine ─────────────────────────────

import OpenAI from "openai";
import type { WardrobeItem, OutfitContext, GeneratedOutfit, UserProfile } from "./types";

function getClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ─── Color Harmony ─────────────────────────────────────────

export function colorsHarmonize(colorA: string, colorB: string): boolean {
  const a = normalizeColor(colorA);
  const b = normalizeColor(colorB);
  if (["black", "white", "gray", "beige", "cream", "tan"].includes(a)) return true;
  if (["black", "white", "gray", "beige", "cream", "tan"].includes(b)) return true;
  if (a === b || a.includes(b) || b.includes(a)) return true;
  return true; // Permissive default for now
}

function normalizeColor(color: string): string {
  const c = color.toLowerCase().trim();
  if (c.includes("navy")) return "navy";
  if (c.includes("black")) return "black";
  if (c.includes("white")) return "white";
  if (c.includes("gray") || c.includes("grey")) return "gray";
  if (c.includes("beige") || c.includes("cream")) return "beige";
  if (c.includes("brown") || c.includes("tan")) return "brown";
  if (c.includes("red") || c.includes("burgundy")) return "red";
  if (c.includes("blue")) return "blue";
  if (c.includes("green")) return "green";
  if (c.includes("yellow")) return "yellow";
  if (c.includes("orange")) return "orange";
  if (c.includes("purple")) return "purple";
  if (c.includes("pink")) return "pink";
  return c;
}

type Season = "spring" | "summer" | "fall" | "winter";

// ─── Candidate Generation ──────────────────────────────────

export function generateOutfitCandidates(
  wardrobe: WardrobeItem[],
  context: OutfitContext,
  _profile?: Partial<UserProfile>
): Array<{ items: WardrobeItem[]; context: OutfitContext }> {
  const results: Array<{ items: WardrobeItem[]; context: OutfitContext }> = [];

  const tops = wardrobe.filter((i) => i.category === "tops");
  const bottoms = wardrobe.filter((i) => i.category === "bottoms");
  const dresses = wardrobe.filter((i) => i.itemType === "dress" || i.itemType === "jumpsuit" || i.itemType === "romper");
  const outerwear = wardrobe.filter((i) => i.category === "outerwear");
  const footwear = wardrobe.filter((i) => i.category === "footwear");
  const accessories = wardrobe.filter((i) => i.category === "accessories");

  const avail = <T>(items: T[]) => (items as WardrobeItem[]).filter((i: WardrobeItem) => !i.isArchived && !i.isInLaundry);

  function needsOuter(ctx: OutfitContext): boolean {
    if (ctx.weather && ctx.weather.tempF < 50) return true;
    if (ctx.occasion === "formal" || ctx.occasion === "interview") return true;
    return false;
  }

  function tempToSeason(t: number): Season {
    if (t < 40) return "winter";
    if (t < 55) return "fall";
    if (t < 70) return "spring";
    return "summer";
  }

  function score(items: WardrobeItem[], ctx: OutfitContext): number {
    let s = 0;
    if (items.length < 2) return 0;
    const hasDress = items.some((i) => i.itemType === "dress");
    const hasTopBottom = items.some((i) => i.category === "tops") && items.some((i) => i.category === "bottoms");
    if (hasDress || hasTopBottom) s += 0.3;
    if (items.some((i) => i.category === "footwear")) s += 0.15;
    // Color harmony
    let matches = 0;
    let pairs = 0;
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        if (colorsHarmonize(items[i].primaryColor, items[j].primaryColor)) matches++;
        pairs++;
      }
    }
    s += (pairs > 0 ? matches / pairs : 0.5) * 0.2;
    // Pattern rule
    const boldPatterns = items.filter((i) => i.pattern !== "solid" && i.pattern !== "textured");
    if (boldPatterns.length <= 1) s += 0.15;
    else s -= 0.1;
    // Formality
    const levels = items.map((i) => i.formalityLevel);
    const range = Math.max(...levels) - Math.min(...levels);
    if (range <= 1) s += 0.1;
    // Occasion match
    s += (items.filter((i) => i.occasions.includes(ctx.occasion)).length / items.length) * 0.1;
    return Math.max(0, Math.min(1, s));
  }

  // Generate dress-based outfits
  for (const dress of avail(dresses).slice(0, 8)) {
    for (const shoe of avail(footwear).slice(0, 3)) {
      const items = [dress, shoe];
      if (needsOuter(context)) {
        const outer = avail(outerwear)[0];
        if (outer) items.push(outer);
      }
      const acc = avail(accessories)[0];
      if (acc) items.push(acc);
      if (score(items, context) > 0.3) {
        results.push({ items, context });
      }
    }
  }

  // Generate top+bottom outfits
  for (const top of avail(tops).slice(0, 12)) {
    for (const bottom of avail(bottoms).slice(0, 4)) {
      if (Math.abs(top.formalityLevel - bottom.formalityLevel) > 1) continue;
      const items: WardrobeItem[] = [top, bottom];
      const shoe = avail(footwear)[0];
      if (shoe) items.push(shoe);
      if (needsOuter(context)) {
        const outer = avail(outerwear)[0];
        if (outer) items.push(outer);
      }
      const acc = avail(accessories)[0];
      if (acc) items.push(acc);
      if (score(items, context) > 0.3) {
        results.push({ items, context });
      }
    }
  }

  return results.slice(0, 8);
}

// ─── LLM Refinement ────────────────────────────────────────

const SYSTEM_PROMPT =
  "You are an elite personal stylist. For each outfit provide: name, reasoning (1-2 sentences, reference color theory), colorTheory scheme, confidence (0-1), and optional swapSuggestions.";

export async function refineOutfitsWithAI(
  candidates: Array<{ items: WardrobeItem[]; context: OutfitContext }>,
  _profile?: Partial<UserProfile>
): Promise<GeneratedOutfit[]> {
  if (candidates.length === 0) return [];

  const client = getClient();

  const list = candidates
    .map((c, i) =>
      "Outfit #" + (i + 1) + ": [" +
      c.items.map((it) => it.suggestedName || it.primaryColor + " " + it.itemType).join(", ") +
      "]"
    )
    .join("\n");

  const prompt =
    "Create refined outfit recommendations for these " + candidates.length + " combinations.\n\n" +
    list + "\n\n" +
    'Return JSON with "outfits" array. Each needs: name, itemIndices (array), reasoning, colorTheory, confidence, swapSuggestions (optional array).';

  try {
    const res = await client.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      max_tokens: 2000,
    });

    const raw = JSON.parse(res.choices[0].message.content || '{"outfits":[]}');
    const list = raw.outfits || [];
    const output: GeneratedOutfit[] = [];

    for (const item of list) {
      const idx = typeof item.itemIndices?.[0] === "number" ? item.itemIndices[0] : output.length;
      const src = candidates[idx];
      if (!src) continue;

      output.push({
        id: crypto.randomUUID(),
        name: item.name || "Outfit #" + (output.length + 1),
        itemIds: src.items.map((it) => it.id),
        reasoning: item.reasoning || "",
        colorTheory: item.colorTheory || "complementary",
        confidence: Math.min(1, Math.max(0, item.confidence || 0.7)),
        swapSuggestions: (item.swapSuggestions || []).map((s: Record<string, unknown>) => ({
          replaceItemId: "",
          withItemId: "",
          reason: (s.why as string) || "",
        })),
      });
    }

    return output;
  } catch (err) {
    console.error("AI refinement failed:", err);
    return candidates.map((c, i) => ({
      id: crypto.randomUUID(),
      name: "Outfit #" + (i + 1),
      itemIds: c.items.map((it) => it.id),
      reasoning: "A well-coordinated " + c.context.occasion + " outfit.",
      colorTheory: "mixed",
      confidence: 0.7,
      swapSuggestions: [],
    }));
  }
}
