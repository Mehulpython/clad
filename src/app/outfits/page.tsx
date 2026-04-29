"use client";

import { useState, useEffect } from "react";
import {
  Sparkles, RefreshCw, Heart, Info,
  Loader2, Shirt, Sun, Snowflake, Thermometer,
} from "lucide-react";
import type { GeneratedOutfit } from "@/lib/types";

const OCCASIONS = [
  { value: "casual", label: "Casual" },
  { value: "work", label: "Work" },
  { value: "date-night", label: "Date Night" },
  { value: "party", label: "Party" },
  { value: "gym", label: "Gym" },
  { value: "formal", label: "Formal" },
  { value: "outdoor", label: "Outdoor" },
  { value: "interview", label: "Interview" },
];

const MOODS = [
  { value: "comfortable", label: "Comfortable" },
  { value: "professional", label: "Professional" },
  { value: "bold", label: "Bold" },
  { value: "classic", label: "Classic" },
  { value: "trendy", label: "Trendy" },
  { value: "minimal", label: "Minimal" },
  { value: "romantic", label: "Romantic" },
  { value: "edgy", label: "Edgy" },
];

export default function OutfitsPage() {
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [loading, setLoading] = useState(false);
  const [occasion, setOccasion] = useState("casual");
  const [mood, setMood] = useState("comfortable");
  const [weather, setWeather] = useState<{ tempF: number; condition: string } | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(true);

  useEffect(() => {
    async function loadWeather() {
      try {
        const res = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=40.7128&longitude=-74.0060&current=temperature_2m,weather_code&temperature_unit=fahrenheit"
        );
        if (res.ok) {
          const data = await res.json();
          const map: Record<number, string> = {
            0: "Clear", 1: "Mainly clear", 2: "Partly cloudy", 3: "Overcast",
            45: "Foggy", 51: "Light drizzle", 61: "Rain", 63: "Moderate rain",
            71: "Light snow", 73: "Snow", 80: "Showers", 95: "Thunderstorm",
          };
          setWeather({ tempF: Math.round(data.current.temperature_2m), condition: map[data.current.weather_code] || "Cloudy" });
        }
      } catch {
        setWeather({ tempF: 65, condition: "Partly cloudy" });
      }
      setLoadingWeather(false);
    }
    loadWeather();
  }, []);

  useEffect(() => {
    if (weather && !loading && outfits.length === 0) handleGenerate();
  }, [weather]);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/outfits/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion, mood, timeAvailable: "normal", locationType: "mixed", weather: weather || undefined }),
      });
      const data = await res.json();
      setOutfits(data.outfits || []);
    } catch (err) {
      console.error("Generation failed:", err);
    }
    setLoading(false);
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">What Should I Wear Today?</h1>
          <p className="text-gray-400">AI-powered outfit suggestions from your wardrobe</p>
          {!loadingWeather && weather && (
            <div className="inline-flex items-center gap-3 mt-4 px-5 py-3 rounded-xl bg-white/[0.04] border border-white/8">
              {weather.tempF < 40 ? <Snowflake className="w-5 h-5 text-blue-400" /> : weather.tempF > 75 ? <Sun className="w-5 h-5 text-yellow-400" /> : <Thermometer className="w-5 h-5 text-green-400" />}
              <span className="font-semibold text-lg">{weather.tempF}&deg;F</span>
              <span className="text-gray-400 text-sm">{weather.condition}</span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="glass-card p-5 mb-8 space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Occasion</label>
            <div className="flex flex-wrap gap-2">
              {OCCASIONS.map((occ) => (
                <button key={occ.value} onClick={() => setOccasion(occ.value)} className={"px-3 py-1.5 rounded-lg text-sm transition-all " + (occasion === occ.value ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]")}>
                  {occ.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Mood</label>
            <div className="flex flex-wrap gap-2">
              {MOODS.map((m) => (
                <button key={m.value} onClick={() => setMood(m.value)} className={"px-3 py-1.5 rounded-lg text-sm transition-all " + (mood === m.value ? "bg-pink-500/20 text-pink-300 border border-pink-500/30" : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]")}>
                  {m.label}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <button onClick={handleGenerate} disabled={loading} className="btn-primary px-8 py-3 flex items-center gap-2 disabled:opacity-50">
              {loading ? (<><Loader2 className="w-5 h-5 animate-spin" /><span>Generating...</span></>) : (<><Sparkles className="w-5 h-5" /><span>Generate Outfits</span></>)}
            </button>
          </div>
        </div>

        {/* Empty state */}
        {!loading && outfits.length === 0 && (
          <div className="text-center py-16">
            <Shirt className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">No outfits yet</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">Upload some clothing items first.</p>
            <a href="/upload" className="btn-primary">Upload Clothes &rarr;</a>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20">
            <Sparkles className="w-16 h-16 text-purple-400 animate-pulse" />
            <p className="mt-4 text-gray-400 animate-pulse">Styling your perfect look...</p>
          </div>
        )}

        {/* Outfit cards */}
        {outfits.length > 0 && !loading && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{outfits.length} outfit{outfits.length !== 1 ? "s" : ""} for you</h2>
              <button onClick={handleGenerate} disabled={loading} className="btn-secondary text-sm flex items-center gap-1.5">
                <RefreshCw className={"w-3.5 h-3.5 " + (loading ? "animate-spin" : "")} /> Regenerate
              </button>
            </div>
            {outfits.map((outfit, idx) => (
              <OutfitCard key={outfit.id || String(idx)} outfit={outfit} index={idx} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

function OutfitCard({ outfit, index }: { outfit: GeneratedOutfit; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [fav, setFav] = useState(false);

  return (
    <div className="glass-card overflow-hidden hover:border-purple-500/30 transition-all duration-300 animate-in">
      <div className="flex items-center justify-between p-4 pb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-bold text-purple-400/30">#{index + 1}</span>
          <div>
            <h3 className="font-semibold text-lg">{outfit.name}</h3>
            <p className="text-xs text-gray-500">{outfit.colorTheory} &middot; {Math.round(outfit.confidence * 100)}% match</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setFav(!fav)} className={"p-2 rounded-lg transition-colors " + (fav ? "text-pink-400" : "text-gray-500 hover:text-gray-300")}>
            <Heart className={"w-5 h-5 " + (fav ? "fill-current" : "")} />
          </button>
          <button onClick={() => setExpanded(!expanded)} className="p-2 rounded-lg text-gray-500 hover:text-gray-300 transition-colors">
            <Info className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-4 pb-4">
        <div className="grid grid-cols-6 gap-2">
          {outfit.itemIds.map((itemId, i) => (
            <div key={itemId} className="aspect-square rounded-lg bg-white/[0.04] border border-white/5 flex items-center justify-center text-gray-600 text-xs">
              Item {i + 1}
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 pb-3">
        <p className="text-sm text-gray-400 italic leading-relaxed">&ldquo;{outfit.reasoning}&rdquo;</p>
      </div>

      {expanded && (
        <div className="border-t border-white/5 p-4 space-y-4">
          <div className="bg-purple-500/5 rounded-lg p-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-300 mb-1">Color Theory</h4>
            <p className="text-sm text-gray-300">{outfit.colorTheory}</p>
          </div>
          {outfit.swapSuggestions?.length > 0 && (
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Try Swapping</h4>
              <div className="space-y-2">
                {outfit.swapSuggestions.map((swap, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-gray-300 bg-white/[0.03] rounded-lg p-2">
                    <span className="text-purple-400">&rarr;</span>
                    <span>{swap.reason || "Try this alternative"}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-3 pt-2">
            <button className="btn-primary flex-1 text-sm py-2.5">Wear This Outfit &check;</button>
            <button className="btn-secondary text-sm py-2.5">Save for Later</button>
          </div>
        </div>
      )}

      <button onClick={() => setExpanded(!expanded)} className="w-full py-2.5 text-xs text-gray-500 hover:text-gray-300 transition-colors border-t border-white/5">
        {expanded ? "Show Less &uarr;" : "Why This Works &darr;"}
      </button>
    </div>
  );
}
