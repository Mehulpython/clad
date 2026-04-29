// ─── OpenAI / Vision Integration ────────────────────────────
// Handles: clothing photo analysis, outfit generation,
// pre-purchase scanning, gap analysis.

import OpenAI from "openai";

// ─── Client ────────────────────────────────────────────────

function getOpenAIClient() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

// ─── Clothing Analysis (Vision) ────────────────────────────

const CLOTHING_ANALYSIS_SYSTEM = `You are an expert fashion stylist and wardrobe analyst. Analyze the clothing item in this image with extreme precision.

IDENTIFICATION RULES:
- Identify the EXACT item type from the allowed list
- Be specific about color — use precise names (not just "blue" → "navy blue", "teal", "powder blue", "burgundy", "forest green")
- Detect pattern accurately (solid, striped, plaid, floral, geometric, etc.)
- Estimate material from visual texture cues
- Assign formality: 1=home/athleisure, 2=casual daily, 3=smart casual, 4=business/formal, 5=black-tie
- Assign ALL applicable occasions
- Note specific style details visible (neckline, sleeve length, fit type, hemline, closures)

ALLOWED ITEM TYPES:
Tops: t-shirt, polo, button-up, hoodie, sweater, cardigan, sweatshirt, tank-top, blouse, bodysuit
Outerwear: jacket, blazer, coat, denim-jacket, leather-jacket, bomber, puffer, trench
Bottoms: jeans, trousers, chinos, shorts, leggings, skirt, mini-skirt, midi-skirt, maxi-skirt
Dresses: dress, mini-dress, midi-dress, maxi-dress, jumpsuit, romper, suit, suit-separates
Activewear: activewear-top, activewear-bottom, sports-bra
Footwear: sneakers, running-shoes, high-tops, loafers, oxfords, boots, ankle-boots, knee-high-boots, heels, pumps, flats, sandals, flip-flops, slides, crocs, dress-shoes
Accessories: belt, hat, cap, beanie, scarf, gloves, watch, bracelet, necklace, earrings, ring, sunglasses, eyeglasses, tie, bow-tie, pocket-square, bag, backpack, tote, crossbody, clutch, wallet, umbrella
Intimate/Sleep: pajamas, robe, undergarment
Swimwear: swimwear-top, swimwear-bottom

Return ONLY valid JSON. No markdown, no explanation.`;

export interface AnalyzedItem {
  itemType: string;
  subtype: string;
  primaryColor: string;
  secondaryColor: string | null;
  pattern: string;
  material: string | null;
  occasions: string[];
  seasons: string[];
  formalityLevel: number;
  tags: string[];
  confidence: number;
  suggestedName: string;
}

/**
 * Analyze a clothing item photo using GPT-4o Vision.
 * Returns structured data about the item.
 */
export async function analyzeClothingPhoto(
  imageUrl: string,
  base64Data?: string
): Promise<AnalyzedItem> {
  const client = getOpenAIClient();

  const imageContent = base64Data
    ? ({
        type: "image_url" as const,
        image_url: {
          url: ("data:image/jpeg;base64," + base64Data) as string,
          detail: "high" as const,
        },
      } as const)
    : ({
        type: "image_url" as const,
        image_url: {
          url: imageUrl,
          detail: "high" as const,
        },
      } as const);

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: CLOTHING_ANALYSIS_SYSTEM },
      {
        role: "user",
        content: [
          imageContent,
          {
            type: "text" as const,
            text: "Analyze this clothing/fashion item and return structured JSON.",
          },
        ] as any,
      },
    ],
    response_format: { type: "json_object" as const },
    max_tokens: 500,
  });

  const raw = JSON.parse(response.choices[0].message.content || "{}");

  // Normalize and validate
  return {
    itemType: raw.itemType || "unknown",
    subtype: raw.subtype || "",
    primaryColor: raw.primaryColor || "unknown",
    secondaryColor: raw.secondaryColor || null,
    pattern: raw.pattern || "solid",
    material: raw.material || null,
    occasions: Array.isArray(raw.occasions) ? raw.occasions : ["casual"],
    seasons: Array.isArray(raw.seasons) ? raw.seasons : ["all-season"],
    formalityLevel: Math.min(5, Math.max(1, raw.formalityLevel || 3)),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
    confidence: Math.min(1, Math.max(0, raw.confidence || 0.5)),
    suggestedName: raw.suggestedName || "Untitled Item",
  };
}

// ─── Batch Analysis ────────────────────────────────────────

/**
 * Analyze multiple photos in parallel (with concurrency limit).
 */
export async function analyzeBatchPhotos(
  photos: Array<{ url?: string; base64?: string }>
): Promise<AnalyzedItem[]> {
  const BATCH_SIZE = 5; // OpenAI rate limit friendly

  const results: AnalyzedItem[] = [];

  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE);
    const batchResults = await Promise.all(
      batch.map((photo) =>
        analyzeClothingPhoto(photo.url!, photo.base64).catch((err) => ({
          itemType: "error",
          subtype: "",
          primaryColor: "unknown",
          secondaryColor: null,
          pattern: "solid",
          material: null,
          occasions: ["casual"] as string[],
          seasons: ["all-season"] as string[],
          formalityLevel: 3,
          tags: [] as string[],
          confidence: 0,
          suggestedName: "Analysis Failed",
          _error: err instanceof Error ? err.message : "Unknown error",
        }))
      )
    );

    results.push(...batchResults as unknown as AnalyzedItem[]);

    // Rate limit pause between batches
    if (i + BATCH_SIZE < photos.length) {
      await new Promise((r) => setTimeout(r, 1000));
    }
  }

  return results;
}
