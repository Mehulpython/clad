"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface DayPlan {
  day: string;
  date: string;
  outfit: { name: string; items: { name: string; color: string; type: string }[]; score: number } | null;
  weather: { temp: number; condition: string } | null;
}

export default function PlannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<DayPlan[]>([]);

  useEffect(() => {
    fetch("/api/planner")
      .then((r) => r.json())
      .then((data) => { setPlan(data.plan || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="Weekly Planner"
        description="AI-generated outfit plan for your week, synced with weather."
        badge="Weekly"
        action={
          <button className="btn-primary" style={{ fontSize: 13 }}>🔄 Generate New Week</button>
        }
      />

      {loading && <LoadingSkeleton type="list" rows={5} />}

      {!loading && plan.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>📅</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 8 }}>No plan yet</h3>
          <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', marginBottom: 24 }}>Generate a weekly outfit plan based on your wardrobe and weather.</p>
          <button className="btn-primary">📅 Create Weekly Plan</button>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {plan.map((day, idx) => (
            <div key={idx} className="card-static" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: day.outfit ? 16 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 'var(--radius-md)',
                    background: idx === new Date().getDay() - 1 ? 'var(--color-primary)' : 'var(--color-muted)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    border: '1px solid var(--color-border)',
                  }}>
                    <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-display)', color: idx === new Date().getDay() - 1 ? 'white' : 'var(--color-foreground)' }}>{days[idx]}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-display)', color: idx === new Date().getDay() - 1 ? 'white' : 'var(--color-foreground)' }}>{new Date(day.date).getDate()}</span>
                  </div>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{day.outfit?.name || "No outfit planned"}</p>
                    {day.weather && (
                      <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
                        {day.weather.temp}°F · {day.weather.condition}
                      </p>
                    )}
                  </div>
                </div>
                {day.outfit && (
                  <span className="badge badge-primary">{day.outfit.score}/100</span>
                )}
              </div>

              {day.outfit && (
                <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(day.outfit.items.length, 5)}, 1fr)`, gap: 8 }}>
                  {day.outfit.items.map((item, i) => (
                    <div key={i} style={{
                      aspectRatio: '1',
                      borderRadius: 'var(--radius-md)',
                      background: item.color,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid var(--color-border)',
                      gap: 4,
                    }}>
                      <span style={{ fontSize: 14 }}>{typeEmoji(item.type)}</span>
                      <span style={{ fontSize: 8, fontWeight: 600, textAlign: 'center', padding: '0 2px', fontFamily: 'var(--font-body)', color: isLight(item.color) ? 'var(--color-foreground)' : 'rgba(255,255,255,0.85)' }}>
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {!day.outfit && (
                <button onClick={() => router.push("/generate")} style={{
                  width: '100%', marginTop: 8, padding: '10px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-muted)', border: '1px dashed var(--color-border-strong)',
                  cursor: 'pointer', fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', fontWeight: 500,
                }}>
                  + Add Outfit
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function typeEmoji(type: string): string {
  const map: Record<string, string> = { shirt: "👔", pants: "👖", jacket: "🧥", shoes: "👞", dress: "👗", skirt: "🩳", accessory: "🎀", hat: "🎩" };
  return map[type] || "👕";
}

function isLight(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return true;
  return (parseInt(c.substring(0,2),16)*299 + parseInt(c.substring(2,4),16)*587 + parseInt(c.substring(4,6),16)*114) / 1000 > 150;
}
