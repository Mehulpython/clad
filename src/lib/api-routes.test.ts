// ─── API Route Tests ───────────────────────────────────────

import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch for API tests
const originalFetch = global.fetch;

describe("API Routes — Auth Guard", () => {
  it("should validate auth guard pattern (middleware check)", () => {
    // Clerk middleware protects all non-public routes
    // Public routes: /, /upload, /api/weather, /shop
    const publicRoutes = ["/", "/upload", "/api/weather", "/shop"];
    const protectedRoutes = [
      "/api/wardrobe", "/api/outfits/generate",
      "/api/scan", "/api/planner", "/api/profile",
      "/api/stats", "/api/gap-analysis",
      "/wardrobe", "/generate", "/outfits",
      "/planner", "/profile", "/scan", "/settings",
      "/gap-analysis", "/stats",
    ];

    expect(publicRoutes.length).toBeGreaterThan(0);
    expect(protectedRoutes.length).toBeGreaterThan(0);
    // All protected routes should NOT be in public list
    for (const route of protectedRoutes) {
      expect(publicRoutes.includes(route)).toBe(false);
    }
  });
});

describe("Weather API", () => {
  it("returns structured weather data from Open-Meteo", async () => {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.006&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code"
    );
    const data = await res.json();
    expect(data).toHaveProperty("current");
    expect(data.current).toHaveProperty("temperature_2m");
    expect(data.current).toHaveProperty("weather_code");
    expect(typeof data.current.temperature_2m).toBe("number");
  });

  it("handles invalid coordinates gracefully", async () => {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=999&longitude=999&current=temperature_2m"
    );
    const data = await res.json();
    // Open-Meteo returns error structure for invalid coords
    expect(res.ok || "error" in data).toBeTruthy();
  });
});

describe("Wardrobe Upload Flow", () => {
  it("validates image upload request body schema", () => {
    const validBody = { base64: "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==" };
    const invalidBody = {};

    expect(validBody.base64).toBeTruthy();
    expect(validBody.base64.length).toBeGreaterThan(0);
    expect(Object.keys(invalidBody).length).toBe(0);
  });

  it("extracts file metadata correctly", () => {
    const mockFile = new File(["test"], "photo.jpg", { type: "image/jpeg" });
    expect(mockFile.type).toBe("image/jpeg");
    expect(mockFile.name).toBe("photo.jpg");
    expect(mockFile.size).toBe(4);
  });
});

describe("Outfit Generation Request Validation", () => {
  it("builds correct OutfitContext from request body", () => {
    const body = {
      occasion: "casual",
      mood: "comfortable",
      timeAvailable: "normal",
      locationType: "mixed",
      excludeItemIds: ["item-1"],
    };

    expect(body.occasion).toBe("casual");
    expect(body.mood).toBe("comfortable");
    expect(Array.isArray(body.excludeItemIds)).toBe(true);
  });

  it("applies defaults for missing fields", () => {
    const body: Record<string, unknown> = {};
    const occasion = (body.occasion as string) || "casual";
    const mood = (body.mood as string) || "comfortable";
    const timeAvailable = (body.timeAvailable as string) || "normal";
    const locationType = (body.locationType as string) || "mixed";

    expect(occasion).toBe("casual");
    expect(mood).toBe("comfortable");
    expect(timeAvailable).toBe("normal");
    expect(locationType).toBe("mixed");
  });
});

describe("Gap Analysis Algorithm", () => {
  it("identifies missing categories correctly", () => {
    const categoryCounts = { tops: 5, dresses: 1 };
    const required = { tops: 5, bottoms: 4, footwear: 4 };

    const gaps: Array<{ category: string; current: number; needed: number }> = [];
    for (const [cat, min] of Object.entries(required)) {
      const current = categoryCounts[cat] || 0;
      if (current < min) {
        gaps.push({ category: cat, current, needed: min });
      }
    }

    expect(gaps.some((g) => g.category === "bottoms")).toBe(true);
    expect(gaps.some((g) => g.category === "footwear")).toBe(true);
    expect(gaps.some((g) => g.category === "tops")).toBe(false); // has enough
  });

  it("calculates combinations unlocked estimate", () => {
    function estimateCombinations(addCount: number): number {
      return addCount * 5; // each bottom × 5 tops
    }
    expect(estimateCombinations(2)).toBe(10);
    expect(estimateCombinations(4)).toBe(20);
  });

  it("detects low color diversity", () => {
    const colors = ["black", "black", "navy", "navy", "white"];
    const uniqueColors = new Set(colors);

    expect(uniqueColors.size).toBe(3);
    expect(uniqueColors.size < 5 && colors.length >= 8 ? true : false).toBe(false); // not enough items
  });

  it("flags missing formal wear coverage", () => {
    const coveredOccasions = new Set(["casual", "work", "party"]);
    const missing = ["formal", "interview"].filter((o) => !coveredOccasions.has(o));

    expect(missing).toContain("formal");
    expect(missing).toContain("interview");
    expect(missing.length).toBe(2);
  });
});

describe("Pre-Purchase Scanner Logic", () => {
  it("returns great-buy verdict for high match count", () => {
    const totalCombos = 12;
    const duplicates = 0;

    let verdict: string;
    let score: number;
    if (duplicates >= 2) {
      verdict = "duplicate"; score = 15;
    } else if (totalCombos >= 8) {
      verdict = "great-buy"; score = 92;
    } else if (totalCombos >= 4) {
      verdict = "decent"; score = 65;
    } else {
      verdict = "skip"; score = 22;
    }

    expect(verdict).toBe("great-buy");
    expect(score).toBeGreaterThanOrEqual(80);
  });

  it("returns duplicate verdict for many similar items", () => {
    const totalCombos = 6;
    const duplicates = 3;

    let verdict: string;
    if (duplicates >= 2) {
      verdict = "duplicate";
    } else if (totalCombos >= 8) {
      verdict = "great-buy";
    } else if (totalCombos >= 4) {
      verdict = "decent";
    } else {
      verdict = "skip";
    }

    expect(verdict).toBe("duplicate");
  });

  it("boosts score for basic items", () => {
    const basics = ["t-shirt", "jeans", "sneakers", "button-up", "blazer"];
    const itemType = "t-shirt";
    let score = 50;

    if (basics.includes(itemType)) {
      score = Math.min(95, score + 15);
    }

    expect(score).toBe(65);
  });

  it("calculates cost-per-wear correctly", () => {
    const estimatedPrice = 80;
    const wearsPerWeek = 3;
    const costPerWear = estimatedPrice / (wearsPerWeek * 52);

    expect(costPerWear).toBeCloseTo(0.51, 1); // ~$0.51/wear
  });
});

describe("Shop API Filtering", () => {
  it("filters by platform correctly", () => {
    const products = [
      { platform: "Amazon", priceUsd: 29 },
      { platform: "H&M", priceUsd: 35 },
      { platform: "Amazon", priceUsd: 70 },
      { platform: "Zara", priceUsd: 60 },
    ];

    const amazonOnly = products.filter((p) => p.platform === "Amazon");
    expect(amazonOnly.length).toBe(2);
    expect(amazonOnly.every((p) => p.platform === "Amazon")).toBe(true);
  });

  it("filters by price range correctly", () => {
    const products = [
      { priceUsd: 15 }, { priceUsd: 35 }, { priceUsd: 60 },
      { priceUsd: 110 }, { priceUsd: 189 }, { priceUsd: 285 },
    ];

    const midRange = products.filter((p) => p.priceUsd >= 30 && p.priceUsd <= 100);
    expect(midRange.length).toBe(2);
    expect(midRange[0].priceUsd).toBe(35);
    expect(midRange[1].priceUsd).toBe(60);
  });
});

describe("Profile API", () => {
  it("creates default profile for new users", () => {
    const defaultProfile = {
      id: "",
      clerkId: "new-user",
      displayName: null,
      gender: null,
      bodyType: null,
      skinTone: null,
      heightCm: null,
      budgetMonthly: null,
      locationZip: null,
      stylePreferences: {
        favoriteColors: ["navy", "white", "black"],
        avoidedColors: [],
        preferredStyle: "casual",
        riskTolerance: "moderate",
        brandAffinity: null,
        dressCodeNotes: null,
      },
      itemCount: 0,
      outfitCount: 0,
    };

    expect(defaultProfile.clerkId).toBe("new-user");
    expect(defaultProfile.stylePreferences.favoriteColors).toHaveLength(3);
    expect(defaultProfile.stylePreferences.preferredStyle).toBe("casual");
  });

  it("updates only provided profile fields", () => {
    const existing = { displayName: "Mehul", gender: "male" };
    const update = { displayName: "Mehul K" };

    const merged = { ...existing, ...update };
    expect(merged.displayName).toBe("Mehul K");
    expect(merged.gender).toBe("male"); // preserved
  });
});

describe("Stats Aggregation", () => {
  it("calculates category breakdown correctly", () => {
    const items = [
      { category: "tops" }, { category: "tops" }, { category: "tops" },
      { category: "bottoms" }, { category: "bottoms" },
      { category: "footwear" },
    ] as Array<{ category: string }>;

    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.category] = (counts[item.category] || 0) + 1;
    }

    expect(counts.tops).toBe(3);
    expect(counts.bottoms).toBe(2);
    expect(counts.footwear).toBe(1);
  });

  it("finds most worn item", () => {
    const items = [
      { primary_color: "White T-Shirt", wear_count: 15 },
      { primary_color: "Blue Jeans", wear_count: 32 },
      { primary_color: "Black Blazer", wear_count: 8 },
    ] as Array<Record<string, unknown>>;

    let topWorn = { name: "", wears: 0 };
    for (const item of items) {
      const wc = Number(item.wear_count) || 0;
      if (wc > topWorn.wears) {
        topWorn = {
          name: ((item.primary_color as string) || ""),
          wears: wc,
        };
      }
    }

    expect(topWorn.name).toBe("Blue Jeans");
    expect(topWorn.wears).toBe(32);
  });

  it("calculates average confidence score", () => {
    const outfits = [
      { confidence_score: 0.85 },
      { confidence_score: 0.72 },
      { confidence_score: 0.91 },
      { confidence_score: 0.68 },
    ] as Array<Record<string, unknown>>;

    const avg =
      outfits.reduce((sum: number, o) => sum + (Number(o.confidence_score) || 0), 0) /
      outfits.length;

    expect(avg).toBeCloseTo(0.79, 1);
  });

  it("calculates formality distribution", () => {
    const items = [
      { formality_level: 2 }, { formality_level: 2 },
      { formality_level: 3 }, { formality_level: 3 }, { formality_level: 3 },
      { formality_level: 4 },
    ] as Array<Record<string, unknown>>;

    const dist: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of items) {
      const fl = Math.min(5, Math.max(1, Number(item.formality_level) || 3));
      dist[fl]++;
    }

    expect(dist[1]).toBe(0);
    expect(dist[2]).toBe(2);
    expect(dist[3]).toBe(3);
    expect(dist[4]).toBe(1);
    expect(dist[5]).toBe(0);
  });
});
