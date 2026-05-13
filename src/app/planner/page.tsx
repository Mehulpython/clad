"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Calendar } from "lucide-react";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import { toast } from "sonner";

interface DayPlan {
  day: string;
  date: string;
  outfit: { name: string; items: { name: string; color: string; type: string }[]; score: number } | null;
  weather: { temp: number; condition: string } | null;
}

interface PlannerResponse {
  plan: DayPlan[];
  locationSource?: "user" | "default";
}

export default function PlannerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState<DayPlan[]>([]);
  const [locationSource, setLocationSource] = useState<"user" | "default" | null>(null);

  useEffect(() => {
    fetch("/api/planner")
      .then((r) => r.json())
      .then((data: PlannerResponse) => {
        const planData = data.plan || [];
        setPlan(planData);
        setLocationSource(data.locationSource || null);
        setLoading(false);
        if (planData.length > 0) toast.success("Weekly plan ready!");
      })
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

      {!loading && locationSource === "default" && (
        <div style={{
          padding: '12px 16px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-muted)',
          border: '1px solid var(--color-border-strong)',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 13,
          color: 'var(--color-foreground)',
          fontFamily: 'var(--font-body)',
        }}>
          <span>📍</span>
          <span>Using default location (New York). Set your zip code in <a href="/profile" style={{ color: 'var(--color-primary)', fontWeight: 600, textDecoration: 'none' }}>Profile</a> for accurate weather.</span>
        </div>
      )}

      {!loading && plan.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '72px 24px',
          background: 'linear-gradient(135deg, #FDF2F8 0%, #FFF1F5 50%, #FDF2F8 100%)',
          borderRadius: 'var(--radius-xl)', border: '1px solid rgba(190,24,93,0.12)',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative dots pattern */}
          <div style={{ position: 'absolute', inset: 0, opacity: 0.4,
            backgroundImage: 'radial-gradient(circle, rgba(190,24,93,0.08) 1px, transparent 1px)',
            backgroundSize: '20px 20px'
          }} />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: 80, height: 80, borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(190,24,93,0.08), rgba(236,72,153,0.12))',
              marginBottom: 20,
              animation: 'gentleFloat 3s ease-in-out infinite',
            }} key="empty-icon">
              <Calendar size={40} strokeWidth={1.5} color="#BE185D" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 8, color: 'var(--color-foreground)' }}>
              No weekly plan yet
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', maxWidth: 380, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Let AI plan your week
            </p>
            <button
              onClick={async () => {
                setLoading(true);
                try {
                  const res = await fetch("/api/planner", { method: "POST" });
                  if (res.ok) { const data = await res.json(); setPlan(data.plan || []); setLocationSource(data.locationSource || null); toast.success("Weekly plan generated!"); }
                } catch { toast.error("Failed to generate plan"); }
                setLoading(false);
              }}
              className="btn-primary"
              style={{ fontSize: 14, padding: '12px 28px', borderRadius: 'var(--radius-lg)' }}
            >
              Generate Weekly Plan →
            </button>
          </div>
          <style>{`@keyframes gentleFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
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
