"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface ShopSuggestion {
  id: string;
  platform: string;
  productName: string;
  productUrl: string;
  priceUsd: number;
  affiliateUrl: string | null;
  reason: string;
}

const PLATFORM_COLORS: Record<string, string> = {
  Amazon: "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "H&M": "bg-red-500/20 text-red-300 border-red-500/30",
  Zara: "bg-purple-500/20 text-purple-300 border-purple-500/30",
  Nordstrom: "bg-blue-500/20 text-blue-300 border-blue-500/30",
  Target: "bg-red-600/20 text-red-400 border-red-600/30",
  ASOS: "bg-black/20 text-gray-300 border-white/10",
  Uniqlo: "bg-red-700/20 text-red-300 border-red-700/30",
  Revolve: "bg-pink-500/20 text-pink-300 border-pink-500/30",
  "Steve Madden": "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
  Nike: "bg-gray-600/20 text-gray-300 border-gray-600/30",
  "Levi's (Amazon)": "bg-orange-500/20 text-orange-300 border-orange-500/30",
};

const CATEGORIES = ["tops", "bottoms", "outerwear", "footwear", "dresses", "accessories"];

export default function ShopPage() {
  const router = useRouter();
  const [suggestions, setSuggestions] = useState<ShopSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCategory, setFilterCategory] = useState("");
  const [filterPlatform, setFilterPlatform] = useState("");
  const [filterMinPrice, setFilterMinPrice] = useState("");
  const [filterMaxPrice, setFilterMaxPrice] = useState("");
  const [platforms, setPlatforms] = useState<string[]>([]);

  async function loadShop() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory) params.set("category", filterCategory);
      if (filterPlatform) params.set("platform", filterPlatform);
      if (filterMinPrice) params.set("minPrice", filterMinPrice);
      if (filterMaxPrice) params.set("maxPrice", filterMaxPrice);

      const res = await fetch("/api/shop?" + params.toString());
      const data = await res.json();
      setSuggestions(data.suggestions || []);
      setPlatforms(data.platforms || []);
    } catch (e) {
      console.error("Failed to load shop:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadShop();
  }, [filterCategory, filterPlatform, filterMinPrice, filterMaxPrice]);

  const filtered = suggestions; // Already filtered server-side

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            ⚡ <span className="text-[#e879f9]">Clad</span> — Shop
          </h1>
          <button
            onClick={() => router.push("/wardrobe")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Wardrobe
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-6">
        {/* Filters */}
        <div className="glass-card rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filters</p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilterCategory("")}
              className={
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all " +
                (!filterCategory ? "bg-[#e879f9] text-black" : "bg-white/5 text-gray-400 hover:bg-white/10")
              }
            >
              All Items
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={
                  "px-3 py-1.5 rounded-full text-xs font-medium transition-all capitalize " +
                  (filterCategory === cat ? "bg-[#e879f9] text-black" : "bg-white/5 text-gray-400 hover:bg-white/10")
                }
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <select
              value={filterPlatform}
              onChange={(e) => setFilterPlatform(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:border-[#e879f9] focus:outline-none"
            >
              <option value="">All Platforms</option>
              {platforms.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <input
              type="number"
              value={filterMinPrice}
              onChange={(e) => setFilterMinPrice(e.target.value)}
              placeholder="Min $"
              className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-[#e879f9] focus:outline-none"
            />
            <input
              type="number"
              value={filterMaxPrice}
              onChange={(e) => setFilterMaxPrice(e.target.value)}
              placeholder="Max $"
              className="w-24 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white placeholder-gray-500 focus:border-[#e879f9] focus:outline-none"
            />

            <span className="text-xs text-gray-500 self-center ml-auto">
              {filtered.length} items
            </span>
          </div>
        </div>

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass-card rounded-xl p-4 animate-pulse">
                <div className="aspect-square bg-white/10 rounded-lg mb-3" />
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Product Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((item) => {
              const platformStyle = PLATFORM_COLORS[item.platform] || "bg-white/5 text-gray-300";
              return (
                <div key={item.id} className="glass-card rounded-xl overflow-hidden group">
                  {/* Image Placeholder */}
                  <div className="aspect-square bg-gradient-to-br from-white/5 to-white/[0.02] flex items-center justify-center relative overflow-hidden">
                    <span className="text-4xl opacity-20 group-hover:opacity-40 transition-opacity">👔</span>
                    <span className={"absolute top-2 left-2 text-[10px] px-2 py-0.5 rounded-full border font-medium " + platformStyle}>
                      {item.platform}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <p className="font-medium text-sm leading-tight line-clamp-2">{item.productName}</p>
                    <p className="text-xs text-gray-400 leading-relaxed">{item.reason}</p>

                    <div className="flex items-center justify-between pt-2">
                      <p className="text-lg font-bold text-[#e879f9]">${item.priceUsd}</p>
                      <a
                        href={item.affiliateUrl || item.productUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary px-3 py-1.5 rounded-lg text-xs font-medium no-underline"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Shop Now →
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filtered.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">🛍️</p>
            <p className="text-xl font-semibold">No items match your filters</p>
            <button
              onClick={() => { setFilterCategory(""); setFilterPlatform(""); setFilterMinPrice(""); setFilterMaxPrice(""); }}
              className="mt-4 btn-secondary px-4 py-2 rounded-lg text-sm"
            >
              Clear Filters
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
