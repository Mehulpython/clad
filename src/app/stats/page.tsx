"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface StatsData {
  overview: {
    totalItems: number;
    totalOutfits: number;
    totalWears: number;
    totalValue: number;
    avgCostPerWear: number;
    favoriteItems: number;
    favoriteOutfits: number;
    avgConfidence: number;
    avgRating: number | null;
    wornOutfitRate: number;
  };
  categoryBreakdown: Record<string, number>;
  colorBreakdown: [string, number][];
  topWornItem: { name: string; wears: number } | null;
  formalityDistribution: Record<number, number>;
  seasonCoverage: Record<string, number>;
}

export default function StatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e879f9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) return null;

  const o = stats.overview;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">
            ⚡ <span className="text-[#e879f9]">Clad</span> — Statistics
          </h1>
          <button
            onClick={() => router.push("/wardrobe")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Wardrobe
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-8">
        {/* Overview Cards */}
        <section>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">
            📊 Overview
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { label: "Total Items", value: o.totalItems, emoji: "👔", color: "text-[#e879f9]" },
              { label: "Outfits Created", value: o.totalOutfits, emoji: "✨", color: "text-blue-400" },
              { label: "Times Worn", value: o.totalWears, emoji: "🔁", color: "text-green-400" },
              { label: "Wardrobe Value", value: "$" + o.totalValue, emoji: "💰", color: "text-yellow-400" },
              { label: "Cost/Wear", value: "$" + o.avgCostPerWear, emoji: "📉", color: "text-orange-400" },
            ].map((stat) => (
              <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
                <p className="text-xl mb-1">{stat.emoji}</p>
                <p className={"text-2xl font-bold " + stat.color}>{stat.value}</p>
                <p className="text-[11px] text-gray-500 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Secondary Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Favorites", value: o.favoriteItems, subtitle: "items" },
            { label: "Avg Confidence", value: (o.avgConfidence * 100).toFixed(0) + "%", subtitle: "outfit quality" },
            { label: "Worn Rate", value: o.wornOutfitRate + "%", subtitle: "of outfits worn" },
            { label: "Avg Rating", value: o.avgRating ? o.avgRating.toFixed(1) + "/5" : "—", subtitle: "user rated" },
          ].map((stat) => (
            <div key={stat.label} className="glass-card rounded-xl p-4 text-center">
              <p className="text-lg font-bold text-white">{stat.value}</p>
              <p className="text-xs text-gray-400">{stat.label}</p>
              <p className="text-[10px] text-gray-600">{stat.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Category Breakdown */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            📦 Category Breakdown
          </h2>
          <div className="space-y-3">
            {Object.entries(stats.categoryBreakdown)
              .sort((a, b) => b[1] - a[1])
              .map(([category, count]) => {
                const maxCount = Math.max(...Object.values(stats.categoryBreakdown), 1);
                const pct = Math.round((count / maxCount) * 100);
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="capitalize font-medium">{category}</span>
                      <span className="text-gray-400">{count}</span>
                    </div>
                    <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-[#e879f9] to-purple-500 rounded-full transition-all duration-700"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </section>

        {/* Color Breakdown */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            🎨 Top Colors
          </h2>
          <div className="flex flex-wrap gap-2">
            {stats.colorBreakdown.map(([color, count]) => (
              <div
                key={color}
                className="flex items-center gap-2 bg-white/5 rounded-full px-4 py-2"
              >
                <span className="text-xs capitalize">{color}</span>
                <span className="text-xs text-gray-500">({count})</span>
              </div>
            ))}
          </div>
        </section>

        {/* Most Worn Item */}
        {stats.topWornItem && (
          <section className="glass-card rounded-xl p-6 border border-yellow-500/20">
            <h2 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider mb-2">
              👑 Most Worn Item
            </h2>
            <p className="font-medium text-lg">{stats.topWornItem.name}</p>
            <p className="text-sm text-gray-400">Worn {stats.topWornItem.wears} times</p>
          </section>
        )}

        {/* Formality Distribution */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            🎭 Formality Distribution
          </h2>
          <div className="grid grid-cols-5 gap-2">
            {[
              { level: 1, label: "Casual" },
              { level: 2, label: "Daily" },
              { level: 3, label: "Smart Casual" },
              { level: 4, label: "Business" },
              { level: 5, label: "Formal" },
            ].map((f) => {
              const count = stats.formalityDistribution[f.level] || 0;
              return (
                <div key={f.level} className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-[10px] text-gray-500 leading-tight mt-1">{f.label}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Season Coverage */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
            🌤️ Season Coverage
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(stats.seasonCoverage).map(([season, count]) => {
              const emojis: Record<string, string> = {
                spring: "🌸", summer: "☀️", fall: "🍂", winter: "❄️",
                "all-season": "🔄",
              };
              return (
                <div key={season} className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg">{emojis[season] || "📌"}</p>
                  <p className="text-sm font-bold mt-1 capitalize">{season.replace("-", " ")}</p>
                  <p className="text-xs text-gray-400">{count} items</p>
                </div>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}
