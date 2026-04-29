"use client";

import { useState, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, Sparkles, RefreshCw, Loader2, Shirt, Clock } from "lucide-react";

interface DayPlan {
  date: string;
  dayName: string;
  morningOutfit: { id: string; name: string; itemIds: string[]; reasoning: string } | null;
}

export default function PlannerPage() {
  const [weekPlan, setWeekPlan] = useState<DayPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  function getWeekStart(offset: number): Date {
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - now.getDay() + offset * 7);
    return start;
  }

  const weekStart = getWeekStart(weekOffset);

  const generateWeek = async () => {
    setLoading(true);
    try {
      const days: DayPlan[] = [];
      const names = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

      for (let idx = 0; idx < 7; idx++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + idx);
        days.push({ date: d.toISOString().split("T")[0], dayName: names[d.getDay()], morningOutfit: null });
      }

      for (let idx = 0; idx < days.length; idx++) {
        try {
          const isWeekend = idx === 0 || idx === 6;
          const res = await fetch("/api/outfits/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ occasion: isWeekend ? "casual" : "work", mood: "comfortable" }),
          });
          if (res.ok) {
            const data = await res.json();
            if (data.outfits?.[0]) {
              days[idx].morningOutfit = { id: data.outfits[0].id, name: data.outfits[0].name, itemIds: data.outfits[0].itemIds, reasoning: data.outfits[0].reasoning };
            }
          }
        } catch { /* skip */ }
        if (idx < days.length - 1) await new Promise((r) => setTimeout(r, 500));
      }

      setWeekPlan(days);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  useEffect(() => { if (weekPlan.length === 0 && !loading) generateWeek(); }, []);

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2"><Calendar className="w-8 h-8 text-purple-400" /> Weekly Planner</h1>
            <p className="text-gray-400 text-sm mt-1">Your AI-styled week, planned in advance.</p>
          </div>
          <button onClick={generateWeek} disabled={loading} className="btn-primary text-sm px-6 py-2.5 flex items-center gap-2">
            {loading ? (<><Loader2 className="w-4 h-4 animate-spin" /> Planning...</>) : (<><Sparkles className="w-4 h-4" /> Regenerate Week</>)}
          </button>
        </div>

        <div className="flex items-center justify-between mb-6">
          <button onClick={() => { setWeekOffset((o) => o - 1); setWeekPlan([]); }} className="p-2 rounded-lg hover:bg-white/[0.04] text-gray-400 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
          <h2 className="text-lg font-semibold">Week of {weekStart.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</h2>
          <button onClick={() => { setWeekOffset((o) => o + 1); setWeekPlan([]); }} className={"p-2 rounded-lg transition-colors " + (weekOffset >= 0 ? "text-gray-600 cursor-not-allowed" : "text-gray-400 hover:text-white")} disabled={weekOffset >= 0}><ChevronRight className="w-5 h-5" /></button>
        </div>

        {!loading && weekPlan.length === 0 && (
          <div className="text-center py-16">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">No plan yet</h2>
            <p className="text-gray-400 mb-6">Generate your weekly outfit schedule.</p>
            <button onClick={generateWeek} className="btn-primary">Generate Weekly Plan &rarr;</button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center py-20">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
            <p className="mt-4 text-gray-400">Planning your week...</p>
          </div>
        )}

        {weekPlan.length > 0 && !loading && (
          <div className="space-y-3">
            {weekPlan.map((day, idx) => {
              const todayStr = new Date().toISOString().split("T")[0];
              const isToday = day.date === todayStr;
              const isPast = day.date < todayStr;

              return (
                <div key={day.date} className={"glass-card p-4 transition-all " + (isToday ? "border-purple-500/30 bg-purple-500/5" : "") + (isPast ? " opacity-50" : "")}>
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-20">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">{day.dayName}</p>
                      <p className={"text-lg font-semibold " + (isToday ? "text-purple-400" : "")}>{new Date(day.date + "T00:00:00").getDate()}</p>
                      {isToday && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300">Today</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      {day.morningOutfit ? (
                        <div className="space-y-2">
                          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-green-400" /><span className="font-medium text-sm">{day.morningOutfit.name}</span></div>
                          <p className="text-xs text-gray-500 italic line-clamp-1">&ldquo;{day.morningOutfit.reasoning}&rdquo;</p>
                          <div className="flex gap-1.5 mt-2">
                            {day.morningOutfit.itemIds.map((id, i) => (<div key={id} className="w-8 h-8 rounded bg-white/[0.04] border border-white/5 flex items-center justify-center text-[10px] text-gray-500">{i + 1}</div>))}
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm text-gray-500"><Shirt className="w-4 h-4" /> No outfit planned</div>
                      )}
                    </div>
                    {!isPast && (
                      <button
                        onClick={async () => {
                          try {
                            const isWknd = idx === 0 || idx === 6;
                            const res = await fetch("/api/outfits/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ occasion: isWknd ? "casual" : "work", mood: "comfortable" }) });
                            if (res.ok) {
                              const data = await res.json();
                              if (data.outfits?.[0]) setWeekPlan((prev) => prev.map((d) => d.date === day.date ? ({ ...d, morningOutfit: { id: data.outfits[0].id, name: data.outfits[0].name, itemIds: data.outfits[0].itemIds, reasoning: data.outfits[0].reasoning } }) : d));
                            }
                          } catch {}
                        }}
                        className="shrink-0 p-2 rounded-lg text-gray-400 hover:text-purple-400 hover:bg-white/[0.04]"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {weekPlan.length > 0 && <p className="mt-6 text-center text-xs text-gray-600">Tap any day&apos;s refresh icon to regenerate that outfit.</p>}
      </div>
    </main>
  );
}
