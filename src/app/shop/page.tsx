"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface ShopSuggestion {
  id: string;
  name: string;
  type: string;
  color: string;
  priceMin: number;
  priceMax: number;
  platform: string;
  url: string;
  reason: string;
}

export default function ShopPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [suggestions, setSuggestions] = useState<ShopSuggestion[]>([]);
  const [category, setCategory] = useState("all");

  useEffect(() => {
    fetch("/api/shop")
      .then((r) => r.json())
      .then((data) => { setSuggestions(data.suggestions || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const categories = ["all", ...new Set(suggestions.map((s) => s.type))];
  const filtered = category === "all" ? suggestions : suggestions.filter((s) => s.type === category);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="Shop Smart"
        description="AI-curated suggestions to fill gaps and expand your style."
        badge="Shop"
      />

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            style={{
              padding: '6px 16px',
              borderRadius: 'var(--radius-full)',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              border: '1px solid',
              textTransform: 'capitalize',
              ...(cat === category
                ? { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }
                : { background: 'var(--color-muted)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }),
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading && <LoadingSkeleton type="card" rows={4} />}

      {!loading && filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🛍️</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 8 }}>No suggestions yet</h3>
          <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', marginBottom: 24 }}>Upload more items to your wardrobe to get personalized shopping suggestions.</p>
          <button onClick={() => router.push("/upload")} className="btn-primary">📸 Upload Items</button>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {filtered.map((item) => (
            <div key={item.id} className="card" style={{ padding: 20 }}>
              {/* Color preview */}
              <div style={{
                height: 100,
                borderRadius: 'var(--radius-md)',
                background: item.color,
                marginBottom: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid var(--color-border)',
              }}>
                <span style={{ fontSize: 28 }}>{typeEmoji(item.type)}</span>
              </div>

              <h4 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 4 }}>{item.name}</h4>
              <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', textTransform: 'capitalize', marginBottom: 8 }}>{item.type} · {item.color}</p>

              <p style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>${item.priceMin}–${item.priceMax}</p>
              <p style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', marginBottom: 12 }}>via {item.platform}</p>

              {/* AI Reason */}
              <div style={{ background: 'var(--color-muted)', borderRadius: 'var(--radius-md)', padding: '10px 12px', border: '1px solid var(--color-border)', marginBottom: 14 }}>
                <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-body)', marginBottom: 4 }}>Why this item?</p>
                <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{item.reason}</p>
              </div>

              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{ display: 'block', textAlign: 'center', fontSize: 13, textDecoration: 'none' }}
              >
                Shop on {item.platform} →
              </a>
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
