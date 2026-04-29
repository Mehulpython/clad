"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface GapSuggestion {
  name: string;
  type: string;
  color: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  shopUrl: string | null;
  platform: string | null;
}

interface WardrobeGap {
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  description: string;
  suggestedItems: GapSuggestion[];
  combinationsUnlocked: number;
}

const PRIORITY_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", emoji: "🔴" },
  high:    { color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", emoji: "🟠" },
  medium:  { color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", emoji: "🟡" },
  low:     { color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30", emoji: "🟢" },
};

export default function GapAnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [gaps, setGaps] = useState<WardrobeGap[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  async function loadAnalysis() {
    setLoading(true);
    try {
      const res = await fetch("/api/gap-analysis");
      const data = await res.json();
      setGaps(data.gaps || []);
      setTotalItems(data.totalItems || 0);
      setAiInsights(data.aiInsights || null);
    } catch (e) {
      console.error("Failed to load gap analysis:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAnalysis();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            ⚡ <span className="text-[#e879f9]">Clad</span> — Wardrobe Gaps
          </h1>
          <button
            onClick={() => router.push("/wardrobe")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Wardrobe
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Summary Bar */}
        <div className="glass-card rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📊</span>
            <div>
              <p className="font-semibold">{totalItems} items in wardrobe</p>
              <p className="text-sm text-gray-400">
                {gaps.length === 0 ? "Looking good!" : gaps.length + " gap(s) identified"}
              </p>
            </div>
          </div>
          <button
            onClick={() => { setAnalyzing(true); loadAnalysis().finally(() => setAnalyzing(false)); }}
            disabled={analyzing}
            className="btn-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
          >
            {analyzing ? "Analyzing..." : "🔄 Re-analyze"}
          </button>
        </div>

        {/* AI Insights */}
        {aiInsights && (
          <div className="glass-card rounded-xl p-5 border border-[#e879f9]/20">
            <p className="text-sm font-semibold text-[#e879f9] mb-2">✨ AI Insights</p>
            <p className="text-sm text-gray-300 leading-relaxed">{aiInsights}</p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-6 animate-pulse">
                <div className="h-4 bg-white/10 rounded w-1/3 mb-3" />
                <div className="h-3 bg-white/10 rounded w-2/3" />
              </div>
            ))}
          </div>
        )}

        {/* Gap Cards */}
        {!loading && gaps.length === 0 && (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">🎉</p>
            <p className="text-xl font-semibold text-[#e879f9]">No Major Gaps!</p>
            <p className="text-gray-400 mt-2">Your wardrobe is well-balanced. Keep building!</p>
          </div>
        )}

        {!loading && gaps.map((gap, idx) => {
          const cfg = PRIORITY_CONFIG[gap.priority];
          return (
            <div
              key={idx}
              className={"glass-card rounded-xl p-6 border " + cfg.border}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{cfg.emoji}</span>
                  <h3 className="font-semibold capitalize">{gap.category.replace(/-/g, " ")}</h3>
                  <span className={"text-xs px-2 py-0.5 rounded-full font-medium " + cfg.bg + " " + cfg.color}>
                    {gap.priority.toUpperCase()}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  Unlocks ~{gap.combinationsUnlocked} combos
                </span>
              </div>

              <p className="text-sm text-gray-300 mb-4 leading-relaxed">{gap.description}</p>

              {gap.suggestedItems.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Suggestions</p>
                  {gap.suggestedItems.map((suggestion, sIdx) => (
                    <div
                      key={sIdx}
                      className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3"
                    >
                      <div>
                        <p className="text-sm font-medium">{suggestion.name}</p>
                        <p className="text-xs text-gray-400">
                          {suggestion.type} · {suggestion.color}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#e879f9]">
                          ${suggestion.estimatedPriceMin}-${suggestion.estimatedPriceMax}
                        </p>
                        {suggestion.platform && (
                          <p className="text-xs text-gray-500">{suggestion.platform}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Shop Button */}
              <button
                onClick={() => router.push("/shop?category=" + encodeURIComponent(gap.category))}
                className="mt-4 w-full btn-secondary py-2 rounded-lg text-sm font-medium"
              >
                🛒 Shop Suggestions for {gap.category.replace(/-/g, " ")}
              </button>
            </div>
          );
        })}
      </main>
    </div>
  );
}
