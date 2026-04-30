"use client";

import { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";

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
  const [generating, setGenerating] = useState(false);
  const [outfits, setOutfits] = useState<GeneratedOutfit[]>([]);
  const [selectedOccasion, setSelectedOccasion] = useState("casual");
  const [selectedMood, setSelectedMood] = useState("comfortable");
  const [weather, setWeather] = useState<{ tempF: number; condition: string } | null>(null);

  useEffect(() => {
    fetch("/api/weather").then((r) => r.json()).then((d) => { if (d.weather) setWeather(d.weather); }).catch(() => {});
  }, []);

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/outfits/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ occasion: selectedOccasion, mood: selectedMood }),
      });
      const data = await res.json();
      setOutfits(data.outfits || []);
    } catch (e) {
      console.error("Generation failed:", e);
    } finally {
      setGenerating(false);
    }
  }

  function pill(isActive: boolean) {
    return {
      padding: '8px 16px',
      borderRadius: 'var(--radius-full)',
      fontSize: 12,
      fontWeight: 600,
      fontFamily: 'var(--font-body)',
      cursor: 'pointer',
      transition: 'all 150ms ease',
      border: '1px solid',
      ...(isActive
        ? { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }
        : { background: 'var(--color-muted)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }),
    };
  }

  return (
    <div style={{ maxWidth: 700, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="Outfit Generator"
        description="AI-powered outfit combinations from your wardrobe."
        badge="AI"
      />

      {/* Weather */}
      {weather && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 24, padding: '12px 20px', borderRadius: 'var(--radius-lg)', background: 'var(--color-muted)', border: '1px solid var(--color-border)' }}>
          <span style={{ fontSize: 18 }}>🌤️</span>
          <span style={{ fontSize: 14, fontFamily: 'var(--font-body)' }}><strong>{weather.tempF}°F</strong> · <span style={{ color: 'var(--color-muted-foreground)' }}>{weather.condition}</span></span>
        </div>
      )}

      {/* Occasion */}
      <div style={{ marginBottom: 20 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Occasion</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {OCCASIONS.map((o) => (
            <button key={o.value} onClick={() => setSelectedOccasion(o.value)} style={pill(selectedOccasion === o.value)}>
              {o.emoji} {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div style={{ marginBottom: 24 }}>
        <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8, display: 'block' }}>Mood</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {MOODS.map((m) => (
            <button key={m.value} onClick={() => setSelectedMood(m.value)} style={pill(selectedMood === m.value)}>
              {m.emoji} {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Generate */}
      <button
        onClick={handleGenerate}
        disabled={generating}
        className="btn-primary"
        style={{ width: '100%', fontSize: 15, padding: '14px' }}
      >
        {generating ? "⏳ Generating..." : "✨ Generate My Outfits"}
      </button>

      {/* Loading */}
      {generating && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 24 }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ height: 120, borderRadius: 'var(--radius-lg)', background: 'linear-gradient(110deg, var(--color-muted) 30%, var(--color-border) 50%, var(--color-muted) 70%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      )}

      {/* Results */}
      {!generating && outfits.length > 0 && (
        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', textAlign: 'center' }}>
            Generated {outfits.length} outfit{outfits.length !== 1 ? "s" : ""} for you
          </p>
          {outfits.map((outfit, idx) => (
            <div key={idx} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div>
                  <h4 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{outfit.name}</h4>
                  <p style={{ fontSize: 12, color: 'var(--color-primary)', fontFamily: 'var(--font-body)', marginTop: 2 }}>{outfit.colorTheory}</p>
                </div>
                <span className="badge badge-primary">{Math.round(outfit.confidence * 100)}%</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(60px, 1fr))', gap: 8, marginBottom: 14 }}>
                {outfit.itemIds.map((_, i) => (
                  <div key={i} style={{ aspectRatio: '1', borderRadius: 'var(--radius-md)', background: 'var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, border: '1px solid var(--color-border)' }}>
                    👔
                  </div>
                ))}
              </div>

              <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{outfit.reasoning}</p>
            </div>
          ))}
        </div>
      )}

      {/* Empty */}
      {!generating && outfits.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px', marginTop: 16 }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>✨</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Ready to generate</h3>
          <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
            Pick an occasion and mood, then tap generate.
          </p>
        </div>
      )}
    </div>
  );
}
