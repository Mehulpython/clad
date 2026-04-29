"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface OutfitBasic {
  id: string;
  name: string;
  itemIds: string[];
  aiReasoning: string;
  confidenceScore: number;
}

interface DayPlan {
  date: string;
  dayName: string;
  morningOutfit: OutfitBasic | null;
  eveningOutfit: OutfitBasic | null;
  eventOutfits: Array<{ eventName: string; outfit: OutfitBasic }>;
  notes: string | null;
}

interface WeekPlan {
  weekOf: string;
  days: DayPlan[];
  generatedAt: string;
}

export default function PlannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [plan, setPlan] = useState<WeekPlan | null>(null);

  async function loadPlan() {
    try {
      const res = await fetch("/api/planner");
      const data = await res.json();
      if (data.plan) setPlan(data.plan);
    } catch (e) {
      console.error("Failed to load plan:", e);
    } finally {
      setLoading(false);
    }
  }

  async function generatePlan() {
    setGenerating(true);
    try {
      const res = await fetch("/api/planner", { method: "POST" });
      const data = await res.json();
      if (data.plan) setPlan(data.plan);
    } catch (e) {
      console.error("Failed to generate plan:", e);
    } finally {
      setGenerating(false);
    }
  }

  useEffect(() => {
    loadPlan();
  }, []);

  function isToday(dateStr: string): boolean {
    return dateStr === new Date().toISOString().split("T")[0];
  }

  function isPast(dateStr: string): boolean {
    return dateStr < new Date().toISOString().split("T")[0];
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4 sticky top-0 bg-[#0a0a0f]/80 backdrop-blur-md z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            ⚡ <span className="text-[#e879f9]">Clad</span> — Weekly Planner
          </h1>
          <div className="flex items-center gap-3">
            <button
              onClick={generatePlan}
              disabled={generating}
              className="btn-primary px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
            >
              {generating ? "Generating..." : "✨ Generate Week"}
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

      <main className="max-w-5xl mx-auto px-6 py-8 space-y-4">
        {/* Week Info */}
        {plan && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">
              Week of {new Date(plan.weekOf + "T00:00:00").toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
            </h2>
            <span className="text-xs text-gray-500">
              Generated {new Date(plan.generatedAt).toLocaleDateString()}
            </span>
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5, 6, 7].map((i) => (
              <div key={i} className="glass-card rounded-xl p-5 animate-pulse">
                <div className="flex gap-4">
                  <div className="w-16 h-10 bg-white/10 rounded-lg" />
                  <div className="flex-1">
                    <div className="h-4 bg-white/10 rounded w-24 mb-2" />
                    <div className="h-3 bg-white/10 rounded w-48" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Day Cards */}
        {!loading && plan && plan.days.map((day, idx) => (
          <div
            key={idx}
            className={
              "glass-card rounded-xl p-5 transition-all " +
              (isToday(day.date) ? "border border-[#e879f9]/30 shadow-[0_0_20px_rgba(232,121,249,0.08)]" : "") +
              (isPast(day.date) ? "opacity-50" : "")
            }
          >
            <div className="flex items-start gap-4">
              {/* Day Badge */}
              <div className={
                "w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0 " +
                (isToday(day.date) ? "bg-[#e879f9] text-black" : "bg-white/5")
              }>
                <span className="text-xs font-medium uppercase">{day.dayName.slice(0, 3)}</span>
                <span className="text-lg font-bold leading-none">
                  {new Date(day.date + "T00:00:00").getDate()}
                </span>
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 space-y-3">
                {/* Morning Outfit */}
                {day.morningOutfit ? (
                  <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Morning</p>
                      <p className="font-medium truncate">{day.morningOutfit.name}</p>
                      <p className="text-xs text-gray-400 truncate">{day.morningOutfit.aiReasoning}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs px-2 py-0.5 bg-[#e879f9]/10 text-[#e879f9] rounded-full font-medium">
                        {Math.round(day.morningOutfit.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-lg px-4 py-3 text-center text-sm text-gray-500">
                    No morning outfit — generate a plan!
                  </div>
                )}

                {/* Evening Outfit */}
                {day.eveningOutfit && (
                  <div className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Evening</p>
                      <p className="font-medium truncate">{day.eveningOutfit.name}</p>
                      <p className="text-xs text-gray-400 truncate">{day.eveningOutfit.aiReasoning}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-xs px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full font-medium">
                        {Math.round(day.eveningOutfit.confidenceScore * 100)}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Notes */}
                {day.notes && (
                  <p className="text-xs text-gray-500 italic">📝 {day.notes}</p>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Empty State */}
        {!loading && !plan && (
          <div className="glass-card rounded-xl p-12 text-center">
            <p className="text-4xl mb-4">📅</p>
            <p className="text-xl font-semibold mb-2">No Weekly Plan Yet</p>
            <p className="text-gray-400 mb-6">
              Generate a 7-day outfit plan based on your wardrobe, weather, and style preferences.
            </p>
            <button
              onClick={generatePlan}
              disabled={generating}
              className="btn-primary px-6 py-3 rounded-xl font-semibold disabled:opacity-50"
            >
              {generating ? "Generating..." : "✨ Generate My Week Plan"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
