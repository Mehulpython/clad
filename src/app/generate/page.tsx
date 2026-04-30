"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, RefreshCw, ThermometerSun, Calendar, Palette } from "lucide-react";

interface GeneratedOutfit {
  id?: string;
  name: string;
  itemIds: string[];
  reasoning: string;
  colorTheory: string;
  confidence: number;
}

const OCCASIONS = [
  { value: "casual", label: "Casual", emoji: "☕" },
  { value: "work", label: "Work", emoji: "💼" },
  { value: "date-night", label: "Date Night", emoji: "🌹" },
  { value: "party", label: "Party", emoji: "🎉" },
  { value: "formal", label: "Formal", emoji: "🎩" },
  { value: "outdoor", label: "Outdoor", emoji: "🌲" },
  { value: "brunch", label: "Brunch", emoji: "🥞" },
  { value: "gym", label: "Gym", emoji: "💪" },
];

const MOODS = [
  { value: "comfortable", label: "Comfortable", emoji: "😌" },
  { value: "bold", label: "Bold", emoji: "🔥" },
  { value: "classic", label: "Classic", emoji: "👔" },
  { value: "trendy", label: "Trendy", emoji: "✨" },
  { value: "minimal", label: "Minimal", emoji: "⬜" },
  { value: "playful", label: "Playful", emoji: "🎨" },
  { value: "romantic", label: "Romantic", emoji: "💕" },
  { value: "professional", label: "Professional", emoji: "📋" },
];

export default function GeneratePage() {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState("casual");
  const [selectedMood, setSelectedMood] = useState("comfortable");
  const [weather, setWeather] = useState<{ tempF: number; condition: string } | null>(null);

  // Fetch weather on mount
  useEffect(() => {
    fetch("/api/weather")
      .then((r) => r.json())
      .then((data) => {
        if (data.weather) setWeather(data.weather);
      })
      .catch(() => {});
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/outfits/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          occasion: selectedOccasion,
          mood: selectedMood,
        }),
      });
      const data = await res.json();
      setOutfits(data.outfits || []);
    } catch (e) {
      console.error("Generation failed:", e);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <main className="min-h-screen px-3 sm:px-4 py-6 sm:py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">✨ Outfit Generator</h1>
          <p className="text-sm sm:text-base text-gray-400">
            AI-powered outfit combinations from your wardrobe
          </p>
        </div>

        {/* Weather Badge */}
        {weather && (
          <div className="glass-card rounded-xl p-3 sm:p-4 flex items-center justify-center gap-3 mb-6">
            <ThermometerSun className="w-5 h-5 text-yellow-400" />
            <span className="text-sm">
              <span className="font-semibold">{weather.tempF}°F</span>
              {" · "}
              <span className="text-gray-400">{weather.condition}</span>
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="space-y-4 mb-6 sm:mb-8">
          {/* Occasion Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <Calendar className="w-3 h-3 inline mr-1" />Occasion
            </label>
            <div className="flex flex-wrap gap-1.5">
              {OCCASIONS.map((o) => (
                <button
                  key={o.value}
                  onClick={() => setSelectedOccasion(o.value)}
                  className={
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all " +
                    (selectedOccasion === o.value
                      ? "bg-[#e879f9] text-black"
                      : "bg-white/5 text-gray-400 hover:bg-white/10")
                  }
                >
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mood Selector */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              <Palette className="w-3 h-3 inline mr-1" />Mood
            </label>
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map((m) => (
                <button
                  key={m.value}
                  onClick={() => setSelectedMood(m.value)}
                  className={
                    "px-3 py-1.5 rounded-lg text-xs font-medium transition-all " +
                    (selectedMood === m.value
                      ? "bg-purple-500/20 border border-purple-500/30 text-purple-300"
                      : "bg-white/5 text-gray-400 hover:bg-white/10")
                  }
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
          </div>

          {/* Generate Button */}
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full btn-primary py-3.5 rounded-xl font-semibold text-base disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {generating ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate My Outfits
              </>
            )}
          </button>
        </div>

        {/* Loading Skeleton */}
        {generating && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass-card rounded-xl p-5 sm:p-6 animate-pulse">
                <div className="h-5 bg-white/10 rounded w-1/3 mb-3" />
                <div className="h-3 bg-white/10 rounded w-2/3 mb-4" />
                <div className="grid grid-cols-4 gap-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div key={j} className="aspect-square bg-white/10 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Results */}
        {!generating && outfits.length > 0 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-400 text-center">
              Generated {outfits.length} outfit{outfits.length !== 1 ? "s" : ""} for you
            </p>
            {outfits.map((outfit, idx) => (
              <div
                key={idx}
                className="glass-card rounded-xl p-4 sm:p-6 hover:border-[#e879f9]/20 transition-all"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-base sm:text-lg">{outfit.name}</h3>
                    <p className="text-xs text-[#e879f9] mt-0.5">{outfit.colorTheory}</p>
                  </div>
                  <span className="text-xs px-2.5 py-1 bg-[#e879f9]/10 text-[#e879f9] rounded-full font-medium whitespace-nowrap">
                    {Math.round(outfit.confidence * 100)}%
                  </span>
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 sm:gap-2 mb-3">
                  {outfit.itemIds.map((_, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg bg-gradient-to-br from-white/[0.08] to-white/[0.02] flex items-center justify-center text-lg"
                    >
                      👔
                    </div>
                  ))}
                </div>

                {/* Reasoning */}
                <p className="text-xs sm:text-sm text-gray-400 leading-relaxed">{outfit.reasoning}</p>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!generating && outfits.length === 0 && (
          <div className="glass-card rounded-xl p-10 sm:p-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-600" />
            <p className="text-lg font-semibold mb-2">Ready to generate</p>
            <p className="text-sm text-gray-400">
              Pick an occasion and mood, then tap generate to get AI-powered outfit suggestions.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
