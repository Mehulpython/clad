"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OutfitData {
  id: string;
  name: string;
  itemIds: string[];
  aiReasoning: string;
  confidenceScore: number;
  wasWorn: boolean;
  userRating: number | null;
  isFavorite: boolean;
  createdAt: string;
}

export default function OutfitsPage() {
  const router = useRouter();
  const [outfits, setOutfits] = useState<OutfitData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "favorites" | "worn">("all");

  async function loadOutfits() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter === "favorites") params.set("favorites", "true");
      if (filter === "worn") params.set("worn", "true");

      const res = await fetch("/api/outfits?" + params.toString());
      const data = await res.json();
      setOutfits(data.outfits || []);
    } catch (e) {
      console.error("Failed to load outfits:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadOutfits();
  }, [filter]);

  async function toggleFavorite(id: string) {
    // Optimistic update
    setOutfits((prev) =>
      prev.map((o) => (o.id === id ? { ...o, isFavorite: !o.isFavorite } : o))
    );
    // TODO: API call to toggle favorite
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">
            ⚡ <span className="text-[#e879f9]">Clad</span> — My Outfits
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push("/generate")}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium"
            >
              ✨ Generate New
            </button>
            <button
              onClick={() => router.push("/wardrobe")}
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              ← Wardrobe
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[{ key: "all", label: "All" }, { key: "favorites", label: "❤️ Favorites" }, { key: "worn", label: "✅ Worn" }].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as typeof filter)}
              className={
                "px-4 py-2 rounded-lg text-sm font-medium transition-all " +
                (filter === tab.key ? "bg-[#e879f9] text-black" : "bg-white/5 text-gray-400 hover:bg-white/10")
              }
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Loading */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-1/3 mb-3" />
                <div className="h-3 bg-white/10 rounded w-2/3 mb-2" />
                <div className="h-3 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        )}

        {/* Outfit Cards */}
        {!loading && outfits.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">👗</p>
            <p className="text-xl font-semibold mb-2">No Outfits Yet</p>
            <p className="text-gray-400 mb-4">Generate your first AI-powered outfit combination!</p>
            <button
              onClick={() => router.push("/generate")}
              className="btn-primary px-6 py-3 rounded-xl font-semibold"
            >
              ✨ Generate Outfits
            </button>
          </div>
        )}

        {!loading && outfits.map((outfit) => (
          <div
            key={outfit.id}
            className="glass-card rounded-xl p-6 space-y-3 hover:border-[#e879f9]/20 transition-all"
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0 mr-4">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg">{outfit.name}</h3>
                  {outfit.wasWorn && (
                    <span className="text-[10px] px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full font-medium">
                      Worn
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{outfit.aiReasoning}</p>
              </div>

              <div className="shrink-0 flex flex-col items-end gap-2">
                <span className="text-xs px-2.5 py-1 bg-[#e879f9]/10 text-[#e879f9] rounded-full font-medium">
                  {Math.round(outfit.confidenceScore * 100)}% match
                </span>
                <button
                  onClick={() => toggleFavorite(outfit.id)}
                  className="text-lg transition-transform hover:scale-110"
                >
                  {outfit.isFavorite ? "❤️" : "🤍"}
                </button>
              </div>
            </div>

            {/* Rating */}
            {outfit.userRating && (
              <div className="flex items-center gap-1 pt-2 border-t border-white/5">
                <span className="text-xs text-gray-500">Your rating:</span>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < outfit.userRating! ? "text-yellow-400" : "text-gray-600"}>
                    ★
                  </span>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs text-gray-500">
              <span>{outfit.itemIds.length} items</span>
              <span>{new Date(outfit.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}</span>
            </div>
          </div>
        ))}
      </main>
    </div>
  );
}
