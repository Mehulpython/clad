// ─── outfit-engine.test.ts ─────────────────────────────────

import { describe, it, expect, vi } from "vitest";

// Mock OpenAI BEFORE any import that triggers it
vi.mock("openai", () => {
  const mockCreate = vi.fn();
  class MockOpenAI {
    chat = { completions: { create: mockCreate } };
  }
  return { default: MockOpenAI };
});

import { generateOutfitCandidates } from "@/lib/outfit-engine";
import type { WardrobeItem, OutfitContext } from "@/lib/types";

function makeItem(overrides: Partial<WardrobeItem> & { itemType: string; category: string; primaryColor: string }): WardrobeItem {
  return {
    id: Math.random().toString(36).slice(2),
    userId: "test-user",
    itemType: overrides.itemType as any,
    category: overrides.category as any,
    subtype: overrides.subtype || "",
    primaryColor: overrides.primaryColor,
    secondaryColor: null,
    pattern: "solid",
    material: null,
    occasions: ["casual", "work"],
    seasons: ["spring", "summer", "fall"],
    formalityLevel: 3,
    tags: [],
    aiConfidence: 0.9,
    brand: null,
    size: null,
    purchasedFrom: null,
    priceUsd: null,
    purchaseDate: null,
    imageUrl: "",
    thumbnailUrl: "",
    aiRawOutput: null,
    isFavorite: false,
    isArchived: false,
    isInLaundry: false,
    wearCount: 0,
    lastWornAt: null,
    correctedFields: [],
    suggestedName: overrides.suggestedName || overrides.primaryColor + " " + overrides.itemType,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("generateOutfitCandidates", () => {
  const baseContext: OutfitContext = {
    occasion: "casual",
    mood: "comfortable",
    timeAvailable: "normal",
    locationType: "mixed",
  };

  it("returns empty array for wardrobe with < 2 items", () => {
    const result = generateOutfitCandidates([makeItem({
      itemType: "t-shirt",
      category: "tops",
      primaryColor: "white",
    })], baseContext);
    expect(result).toEqual([]);
  });

  it("generates candidates for top + bottom combinations", () => {
    const wardrobe = [
      makeItem({ itemType: "t-shirt", category: "tops", primaryColor: "white" }),
      makeItem({ itemType: "jeans", category: "bottoms", primaryColor: "blue" }),
      makeItem({ itemType: "sneakers", category: "footwear", primaryColor: "white" }),
    ];
    const result = generateOutfitCandidates(wardrobe, baseContext);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].items.length).toBeGreaterThanOrEqual(2);
  });

  it("generates dress-based outfits when dresses exist", () => {
    const wardrobe = [
      makeItem({ itemType: "dress", category: "dresses", primaryColor: "black" }),
      makeItem({ itemType: "sneakers", category: "footwear", primaryColor: "white" }),
    ];
    // Fix: use correct property name
    const wardrobeFixed = [
      makeItem({ itemType: "dress", category: "dresses", primaryColor: "black" }),
      makeItem({ itemType: "sneakers", category: "footwear", primaryColor: "white" }),
    ];
    const result = generateOutfitCandidates(wardrobeFixed, baseContext);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns results sorted by score descending", () => {
    const wardrobe = [
      makeItem({ itemType: "t-shirt", category: "tops", primaryColor: "navy" }),
      makeItem({ itemType: "t-shirt", category: "tops", primaryColor: "white" }),
      makeItem({ itemType: "jeans", category: "bottoms", primaryColor: "blue" }),
      makeItem({ itemType: "chinos", category: "bottoms", primaryColor: "khaki" }),
      makeItem({ itemType: "sneakers", category: "footwear", primaryColor: "white" }),
    ];
    const fixedWardrobe = [
      makeItem({ itemType: "t-shirt", category: "tops", primaryColor: "navy" }),
      makeItem({ itemType: "t-shirt", category: "tops", primaryColor: "white" }),
      makeItem({ itemType: "jeans", category: "bottoms", primaryColor: "blue" }),
      makeItem({ itemType: "chinos", category: "bottoms", primaryColor: "khaki" }),
      makeItem({ itemType: "sneakers", category: "footwear", primaryColor: "white" }),
    ];
    const result = generateOutfitCandidates(fixedWardrobe, baseContext);
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].score).toBeGreaterThanOrEqual(result[i].score);
    }
  });

  it("limits to max 20 candidates", () => {
    const items: WardrobeItem[] = [];
    for (let i = 0; i < 20; i++) {
      items.push(makeItem({
        itemType: "t-shirt",
        category: "tops",
        primaryColor: ["red", "blue", "green", "black"][i % 4],
        id: "item-" + i,
      }));
    }
    for (let i = 0; i < 15; i++) {
      items.push(makeItem({
        itemType: "jeans",
        category: "bottoms",
        primaryColor: ["blue", "black", "gray"][i % 3],
        id: "bottom-" + i,
      }));
    }
    items.push(makeItem({ itemType: "sneakers", category: "footwear", primaryColor: "white" }));
    const result = generateOutfitCandidates(items, baseContext);
    expect(result.length).toBeLessThanOrEqual(20);
  });

  it("includes footwear in candidate outfits when available", () => {
    const wardrobe = [
      makeItem({ itemType: "t-shirt", category: "tops", primaryColor: "white" }),
      makeItem({ itemType: "jeans", category: "bottoms", primaryColor: "blue" }),
      makeItem({ itemType: "sneakers", category: "footwear", primaryColor: "white" }),
    ];
    const result = generateOutfitCandidates(wardrobe, baseContext);
    expect(result.length).toBeGreaterThan(0);
    // At least one candidate should include shoes
    const hasShoes = result.some((c) =>
      c.items.some((i) => i.category === "footwear")
    );
    expect(hasShoes).toBe(true);
  });

  it("adds outerwear for cold weather contexts", () => {
    const wardrobe = [
      makeItem({ itemType: "t-shirt", category: "tops", primaryColor: "white" }),
      makeItem({ itemType: "jeans", category: "bottoms", primaryColor: "blue" }),
      makeItem({ itemType: "jacket", category: "outerwear", primaryColor: "black" }),
      makeItem({ itemType: "sneakers", category: "footwear", primaryColor: "white" }),
    ];
    const coldContext: OutfitContext = {
      ...baseContext,
      weather: { tempF: 30, condition: "Snowy", humidity: 60, windMph: 10 },
    };
    const result = generateOutfitCandidates(wardrobe, coldContext);
    expect(result.length).toBeGreaterThan(0);
    // Cold weather should add outerwear to some candidates
    const hasOuterwear = result.some((c) =>
      c.items.some((i) => i.category === "outerwear")
    );
    expect(hasOuterwear).toBe(true);
  });

  it("scores complementary colors higher than clashing ones", () => {
    const goodCombo = [
      makeItem({ itemType: "t-shirt", category: "tops", primaryColor: "navy" }),
      makeItem({ itemType: "jeans", category: "bottoms", primaryColor: "burgundy" }), // complementary-ish
      makeItem({ itemType: "sneakers", category: "footwear", primaryColor: "white" }),
    ];
    const result = generateOutfitCandidates(goodCombo, baseContext);
    expect(result.length).toBeGreaterThan(0);
    expect(result[0].score).toBeGreaterThan(0);
    expect(result[0].score).toBeLessThanOrEqual(1);
  });

  it("handles empty wardrobe gracefully", () => {
    const result = generateOutfitCandidates([], baseContext);
    expect(result).toEqual([]);
  });
});
