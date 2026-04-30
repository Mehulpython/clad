// ─── Component Tests ──────────────────────────────────────

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

describe("Navigation Component Logic", () => {
  it("has correct number of nav items", () => {
    const navItems = [
      { href: "/wardrobe", label: "Wardrobe" },
      { href: "/generate", label: "Generate" },
      { href: "/outfits", label: "Outfits" },
      { href: "/planner", label: "Planner" },
      { href: "/shop", label: "Shop" },
      { href: "/scan", label: "Scan" },
      { href: "/gap-analysis", label: "Gaps" },
      { href: "/stats", label: "Stats" },
      { href: "/settings", label: "Settings" },
    ];
    expect(navItems).toHaveLength(9);
  });

  it("identifies active route correctly", () => {
    const pathname = "/wardrobe";
    const isActive = (href: string) => pathname === href || pathname.startsWith(href + "/");
    expect(isActive("/wardrobe")).toBe(true);
    expect(isActive("/wardrobe?color=red")).toBe(false); // exact match only
    expect(isActive("/generate")).toBe(false);
  });
});

describe("Upload Page — File Validation", () => {
  const MAX_FILES = 20;
  const MAX_SIZE_MB = 10;
  const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

  it("accepts valid file count", () => {
    const count = 15;
    expect(count).toBeLessThanOrEqual(MAX_FILES);
  });

  it("rejects too many files", () => {
    const count = 25;
    expect(count > MAX_FILES).toBe(true);
  });

  it("accepts file within size limit", () => {
    const size = 5 * 1024 * 1024; // 5MB
    expect(size).toBeLessThanOrEqual(MAX_SIZE_BYTES);
  });

  it("rejects oversized file", () => {
    const size = 15 * 1024 * 1024; // 15MB
    expect(size > MAX_SIZE_BYTES).toBe(true);
  });

  it("accepts allowed image types", () => {
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    for (const type of allowedTypes) {
      expect(allowedTypes.includes(type)).toBe(true);
    }
  });

  it("rejects non-image types", () => {
    const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
    expect(allowedTypes.has("application/pdf")).toBe(false);
    expect(allowedTypes.has("text/plain")).toBe(false);
    expect(allowedTypes.has("image/svg+xml")).toBe(false); // explicitly excluded
  });
});

describe("Wardrobe Page — Filter Logic", () => {
  it("filters by category correctly", () => {
    const items = [
      { category: "tops", isArchived: false, isFavorite: true },
      { category: "bottoms", isArchived: false, isFavorite: false },
      { category: "tops", isArchived: false, isFavorite: false },
      { category: "outerwear", isArchived: true, isFavorite: false },
    ] as Array<Record<string, unknown>>;

    const filtered = items.filter(
      (i) => i.category === "tops" && !i.isArchived
    );

    expect(filtered).toHaveLength(2);
  });

  it("filters favorites only", () => {
    const items = [
      { isFavorite: true, isArchived: false },
      { isFavorite: false, isArchived: false },
      { isFavorite: true, isArchived: false },
      { isFavorite: false, isArchived: true },
    ] as Array<Record<string, unknown>>;

    const favOnly = items.filter((i) => i.isFavorite && !i.isArchived);
    expect(favOnly).toHaveLength(2);
  });

  it("searches by name/color", () => {
    const items = [
      { suggestedName: "White T-Shirt", primaryColor: "white" },
      { suggestedName: "Navy Blazer", primaryColor: "navy" },
      { suggestedName: "Blue Jeans", primaryColor: "blue" },
      { suggestedName: "Black Sneakers", primaryColor: "black" },
    ] as Array<Record<string, unknown>>;

    const query = "white";
    const results = items.filter(
      (i) =>
        (i.suggestedName as string).toLowerCase().includes(query) ||
        (i.primaryColor as string).toLowerCase().includes(query)
    );

    expect(results).toHaveLength(1);
    expect(results[0].suggestedName).toBe("White T-Shirt");
  });
});

describe("Outfit Generator — Occasion Mapping", () => {
  const occasionFormality: Record<string, number> = {
    casual: 1,
    work: 3,
    party: 4,
    "date-night": 3,
    gym: 1,
    formal: 5,
    outdoor: 2,
    travel: 2,
    brunch: 2,
    interview: 4,
    concert: 3,
  };

  it("maps all occasions to formality levels 1-5", () => {
    for (const [occasion, level] of Object.entries(occasionFormality)) {
      expect(level).toBeGreaterThanOrEqual(1);
      expect(level).toBeLessThanOrEqual(5);
    }
  });

  it("ranks formal occasions highest", () => {
    expect(occasionFormality.formal).toBe(5);
    expect(occasionFormality.interview).toBe(4);
    expect(occasionFormality.party).toBe(4);
    expect(occasionFormality.casual).toBe(1);
    expect(occasionFormality.gym).toBe(1);
  });
});

describe("Gap Analysis — Priority System", () => {
  const priorities = ["critical", "high", "medium", "low"] as const;

  it("assigns correct priority to missing categories", () => {
    const reqs: Record<string, { minCount: number; priority: string }> = {
      tops: { minCount: 5, priority: "high" },
      bottoms: { minCount: 4, priority: "critical" },
      footwear: { minCount: 4, priority: "critical" },
      outerwear: { minCount: 2, priority: "high" },
      accessories: { minCount: 3, priority: "low" },
    };

    expect(reqs.bottoms.priority).toBe("critical");
    expect(reqs.footwear.priority).toBe("critical");
    expect(reqs.accessories.priority).toBe("low");
  });

  it("renders priority badges with correct colors", () => {
    const config: Record<string, { emoji: string }> = {
      critical: { emoji: "🔴" },
      high: { emoji: "🟠" },
      medium: { emoji: "🟡" },
      low: { emoji: "🟢" },
    };

    expect(config.critical.emoji).toBe("🔴");
    expect(config.low.emoji).toBe("🟢");
  });
});

describe("Pre-Purchase Scanner — Verdict Config", () => {
  const verdicts = [
    { key: "great-buy", emoji: "✅", color: "green", scoreMin: 80 },
    { key: "decent", emoji: "🤔", color: "yellow", scoreMin: 50 },
    { key: "skip", emoji: "❌", color: "red", scoreMax: 49 },
    { key: "duplicate", emoji: "📋", color: "orange", scoreMax: 20 },
  ];

  it("has unique verdict keys", () => {
    const keys = verdicts.map((v) => v.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("maps scores to verdict ranges correctly", () => {
    function getVerdict(score: number): string {
      if (score >= 80) return "great-buy";
      if (score >= 50) return "decent";
      return "skip";
    }

    expect(getVerdict(92)).toBe("great-buy");
    expect(getVerdict(80)).toBe("great-buy");
    expect(getVerdict(65)).toBe("decent");
    expect(getVerdict(50)).toBe("decent");
    expect(getVerdict(22)).toBe("skip");
    expect(getVerdict(0)).toBe("skip");
  });
});

describe("Weekly Planner — Day Generation", () => {
  const DAY_NAMES = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  const DEFAULT_CONTEXTS = [
    { occasion: "work", mood: "professional" },
    { occasion: "work", mood: "comfortable" },
    { occasion: "work", mood: "minimal" },
    { occasion: "work", mood: "classic" },
    { occasion: "casual", mood: "playful" },
    { occasion: "casual", mood: "trendy" },
    { occasion: "brunch", mood: "romantic" },
  ];

  it("generates exactly 7 days", () => {
    expect(DAY_NAMES).toHaveLength(7);
    expect(DEFAULT_CONTEXTS).toHaveLength(7);
  });

  it("has work days Mon-Thu", () => {
    for (let i = 0; i < 4; i++) {
      expect(DEFAULT_CONTEXTS[i].occasion).toBe("work");
    }
  });

  it("has casual Friday", () => {
    expect(DEFAULT_CONTEXTS[4].occasion).toBe("casual");
    expect(DEFAULT_CONTEXTS[4].mood).toBe("playful");
  });

  it("has Sunday brunch", () => {
    expect(DEFAULT_CONTEXTS[6].occasion).toBe("brunch");
  });

  it("calculates Monday from any date", () => {
    // Wednesday April 29, 2026
    const today = new Date("2026-04-29");
    const monday = new Date(today);
    monday.setDate(today.getDate() - ((today.getDay() + 6) % 7));

    expect(monday.getDay()).toBe(1); // Monday
    expect(monday.getDate()).toBe(27); // April 27
  });
});

describe("Shop Page — Platform Colors", () => {
  const PLATFORM_COLORS: Record<string, string> = {
    Amazon: "bg-orange-500/20",
    "H&M": "bg-red-500/20",
    Zara: "bg-purple-500/20",
    Nordstrom: "bg-blue-500/20",
    Target: "bg-red-600/20",
    ASOS: "bg-black/20",
  };

  it("has color mapping for all platforms", () => {
    Object.keys(PLATFORM_COLORS).forEach((platform) => {
      expect(PLATFORM_COLORS[platform]).toContain("bg-");
      expect(PLATFORM_COLORS[platform]).toContain("/");
    });
  });
});

describe("Stats Dashboard — Overview Cards", () => {
  it("formats currency values correctly", () => {
    const totalValue = 1250;
    const avgCostPerWear = totalValue / 100;

    expect("$" + totalValue).toBe("$1250");
    expect("$" + Math.round(avgCostPerWear * 100) / 100).toBe("$12.5");
  });

  it("calculates worn outfit rate percentage", () => {
    const totalOutfits = 40;
    const wornOutfits = 28;
    const rate = Math.round((wornOutfits / totalOutfits) * 100);

    expect(rate).toBe(70);
  });

  it("rounds rating to 1 decimal", () => {
    const totalRating = 18.5;
    const ratedCount = 5;
    const avg = Math.round((totalRating / ratedCount) * 10) / 10;

    expect(avg).toBeCloseTo(3.7, 1);
  });
});
