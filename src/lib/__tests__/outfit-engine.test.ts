// ─── Outfit Engine Tests ──────────────────────────────────
// Tests for generateOutfitCandidates — pure algorithm logic.

import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateOutfitCandidates } from "../outfit-engine";
import type { WardrobeItem, OutfitContext } from "../types";

// ── Mock OpenAI so refineOutfitsWithAI never calls real API ──
vi.mock("openai", () => {
  const mockCreate = vi.fn();
  class MockOpenAI {
    constructor(_opts?: unknown) { /* no-op */ }
    chat = { completions: { create: mockCreate } };
  }
  return { default: MockOpenAI };
});

// ── Test Fixtures ──────────────────────────────────────────

function makeItem(overrides: Partial<WardrobeItem> & { id: string; category: string }): WardrobeItem {
  return {
    id: overrides.id,
    userId: "test-user",
    itemType: "t-shirt",
    category: overrides.category,
    subtype: "",
    suggestedName: "",
    primaryColor: "blue",
    secondaryColor: null,
    pattern: "solid",
    material: null,
    occasions: ["casual"],
    seasons: ["spring", "summer", "fall"],
    formalityLevel: 2,
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
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-01-01T00:00:00Z",
    ...overrides,
  };
}

const baseContext: OutfitContext = {
  occasion: "casual",
  mood: "comfortable",
  timeAvailable: "normal",
  locationType: "indoor",
};

// ── Tests ──────────────────────────────────────────────────

describe("generateOutfitCandidates", () => {
  it("returns empty array for empty wardrobe", () => {
    const result = generateOutfitCandidates([], baseContext);
    expect(result).toEqual([]);
  });

  it("returns outfits with at least top + bottom items", () => {
    const top = makeItem({ id: "t1", category: "tops", primaryColor: "blue" });
    const bottom = makeItem({ id: "b1", category: "bottoms", primaryColor: "navy" });
    const result = generateOutfitCandidates([top, bottom], baseContext);

    expect(result.length).toBeGreaterThan(0);
    // Every candidate should have at least the top and bottom
    for (const c of result) {
      const ids = c.items.map((i) => i.id);
      expect(ids).toContain("t1");
      expect(ids).toContain("b1");
    }
  });

  it("respects occasion parameter — formal occasions favor higher formality items", () => {
    const casualTop = makeItem({
      id: "ct",
      category: "tops",
      primaryColor: "blue",
      formalityLevel: 2,
      occasions: ["casual"],
    });
    const formalTop = makeItem({
      id: "ft",
      category: "tops",
      primaryColor: "navy",
      formalityLevel: 5,
      occasions: ["formal", "work", "interview"],
    });
    const bottom = makeItem({ id: "b1", category: "bottoms", primaryColor: "black" });

    const casualResult = generateOutfitCandidates(
      [casualTop, formalTop, bottom],
      { ...baseContext, occasion: "casual" }
    );
    const formalResult = generateOutfitCandidates(
      [casualTop, formalTop, bottom],
      { ...baseContext, occasion: "formal" }
    );

    // The best-scoring outfit for formal should include the formal top
    const bestFormal = formalResult[0];
    expect(bestFormal.items.map((i) => i.id)).toContain("ft");

    // For casual, the casual top should be competitive (may or may not win depending on other factors)
    const bestCasual = casualResult[0];
    expect(bestCasual.items.length).toBeGreaterThanOrEqual(2);
  });

  it("weather awareness — hot weather favors summer items over winter items", () => {
    const lightTop = makeItem({
      id: "lt",
      category: "tops",
      primaryColor: "white",
      seasons: ["summer", "spring"],
    });
    const heavyTop = makeItem({
      id: "ht",
      category: "tops",
      primaryColor: "gray",
      seasons: ["winter", "fall"],
    });
    const bottom = makeItem({ id: "b1", category: "bottoms", primaryColor: "blue" });

    const hotResult = generateOutfitCandidates(
      [lightTop, heavyTop, bottom],
      {
        ...baseContext,
        weather: { tempF: 95, condition: "sunny", humidity: 40, windMph: 5 },
      }
    );
    const coldResult = generateOutfitCandidates(
      [lightTop, heavyTop, bottom],
      {
        ...baseContext,
        weather: { tempF: 20, condition: "snowy", humidity: 60, windMph: 10 },
      }
    );

    // Hot: outfit with light top should score higher than one with heavy top
    const hotBest = hotResult[0];
    expect(hotBest.items.map((i) => i.id)).toContain("lt");

    // Cold: outfit with heavy top should score higher
    const coldBest = coldResult[0];
    expect(coldBest.items.map((i) => i.id)).toContain("ht");
  });

  it("color harmony — complementary colors produce higher scores than clashing ones", () => {
    // Blue top + orange bottom = complementary (score 1.0)
    const blueTop = makeItem({ id: "bt", category: "tops", primaryColor: "blue" });
    const orangeBottom = makeItem({ id: "ob", category: "bottoms", primaryColor: "orange" });

    // Blue top + green bottom = analogous (score 0.8) — still good but less than complementary
    const greenBottom = makeItem({ id: "gb", category: "bottoms", primaryColor: "green" });

    const result = generateOutfitCandidates(
      [blueTop, orangeBottom, greenBottom],
      baseContext
    );

    expect(result.length).toBeGreaterThan(0);

    // Find which combo includes orange (complementary) vs green (analogous)
    const compOutfit = result.find((c) =>
      c.items.some((i) => i.id === "ob")
    );
    const analOutfit = result.find((c) =>
      c.items.some((i) => i.id === "gb")
    );

    expect(compOutfit).toBeDefined();
    expect(analOutfit).toBeDefined();
    // Complementary should score >= analogous
    expect(compOutfit!.score).toBeGreaterThanOrEqual(analOutfit!.score);
  });

  it("style preference matching — items whose occasions match score higher", () => {
    const partyTop = makeItem({
      id: "pt",
      category: "tops",
      primaryColor: "purple",
      occasions: ["party", "date-night", "concert"],
    });
    const gymTop = makeItem({
      id: "gt",
      category: "tops",
      primaryColor: "gray",
      occasions: ["gym", "outdoor", "travel"],
    });
    // Navy bottom gives equal color harmony (~0.4) with both purple and gray,
    // so occasion matching becomes the differentiator
    const bottom = makeItem({ id: "b1", category: "bottoms", primaryColor: "navy" });

    const partyResult = generateOutfitCandidates(
      [partyTop, gymTop, bottom],
      { ...baseContext, occasion: "party" }
    );
    const gymResult = generateOutfitCandidates(
      [partyTop, gymTop, bottom],
      { ...baseContext, occasion: "gym" }
    );

    // Party context should prefer the party top (occasion match bonus)
    const partyBest = partyResult[0];
    expect(partyBest.items.map((i) => i.id)).toContain("pt");

    // Gym context should prefer the gym top (occasion match bonus)
    const gymBest = gymResult[0];
    expect(gymBest.items.map((i) => i.id)).toContain("gt");
  });

  it("edge case: single item wardrobe produces no outfits (needs top+bottom or dress)", () => {
    const singleItem = makeItem({ id: "s1", category: "tops", primaryColor: "red" });
    const result = generateOutfitCandidates([singleItem], baseContext);
    expect(result).toEqual([]);
  });

  it("edge case: all same-category items (only tops) produces no outfits", () => {
    const items = [
      makeItem({ id: "t1", category: "tops", primaryColor: "red" }),
      makeItem({ id: "t2", category: "tops", primaryColor: "blue" }),
      makeItem({ id: "t3", category: "tops", primaryColor: "green" }),
    ];
    const result = generateOutfitCandidates(items, baseContext);
    expect(result).toEqual([]);
  });

  it("dress-based outfit generates correctly from a single dress item", () => {
    const dress = makeItem({
      id: "d1",
      category: "dresses",
      itemType: "dress",
      primaryColor: "black",
      formalityLevel: 4,
      occasions: ["formal", "party", "date-night"],
    });
    const result = generateOutfitCandidates([dress], baseContext);

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].items.some((i) => i.id === "d1")).toBe(true);
  });

  it("outerwear is added as a layer when available", () => {
    const top = makeItem({ id: "t1", category: "tops", primaryColor: "blue" });
    const bottom = makeItem({ id: "b1", category: "bottoms", primaryColor: "navy" });
    const jacket = makeItem({
      id: "j1",
      category: "outerwear",
      itemType: "jacket",
      primaryColor: "gray",
    });

    const withoutLayer = generateOutfitCandidates([top, bottom], baseContext);
    const withLayer = generateOutfitCandidates([top, bottom, jacket], baseContext);

    // With outerwear available, candidates should have more items (layer included)
    expect(withLayer[0].items.length).toBeGreaterThan(withoutLayer[0]?.items.length || 0);
    // At least one candidate should include the jacket
    const hasJacket = withLayer.some((c) => c.items.some((i) => i.id === "j1"));
    expect(hasJacket).toBe(true);
  });

  it("results are sorted by score descending", () => {
    const tops = [
      makeItem({ id: "t1", category: "tops", primaryColor: "red" }),
      makeItem({ id: "t2", category: "tops", primaryColor: "blue" }),
    ];
    const bottoms = [
      makeItem({ id: "b1", category: "bottoms", primaryColor: "green" }),
      makeItem({ id: "b2", category: "bottoms", primaryColor: "orange" }),
    ];

    const result = generateOutfitCandidates(tops.concat(bottoms), baseContext);

    if (result.length >= 2) {
      for (let i = 0; i < result.length - 1; i++) {
        expect(result[i].score).toBeGreaterThanOrEqual(result[i + 1].score);
      }
    }
  });

  it("caps results at 20 candidates", () => {
    const tops: WardrobeItem[] = [];
    const bottoms: WardrobeItem[] = [];
    for (let i = 0; i < 10; i++) {
      tops.push(makeItem({ id: `t${i}`, category: "tops", primaryColor: "blue" }));
      bottoms.push(makeItem({ id: `b${i}`, category: "bottoms", primaryColor: "navy" }));
    }

    const result = generateOutfitCandidates(tops.concat(bottoms), baseContext);
    expect(result.length).toBeLessThanOrEqual(20);
  });
});
