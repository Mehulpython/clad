"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface OutfitData {
  id: string;
  name: string;
  items: { name: string; color: string; type: string }[];
  occasion: string;
  score: number;
  favorite: boolean;
  createdAt: string;
}

export default function OutfitsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [outfits, setOutfits] = useState<OutfitData[]>([]);
  const [filter, setFilter] = useState<"all" | "favorites">("all");

  useEffect(() => {
    fetch("/api/outfits")
      .then((r) => r.json())
      .then((data) => { setOutfits(data.outfits || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const displayed = filter === "favorites" ? outfits.filter((o) => o.favorite) : outfits;

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="My Outfits"
        description="Saved outfit combinations curated by AI and you."
        badge="Saved"
        action={
          <button onClick={() => router.push("/generate")} className="btn-primary" style={{ fontSize: 13 }}>
            ✨ Generate New Outfit
          </button>
        }
      />

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {(["all", "favorites"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 20px',
              borderRadius: 'var(--radius-full)',
              fontSize: 13,
              fontWeight: 600,
              fontFamily: 'var(--font-body)',
              cursor: 'pointer',
              transition: 'all 150ms ease',
              border: '1px solid',
              ...(f === filter
                ? { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }
                : { background: 'var(--color-muted)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }),
            }}
          >
            {f === "all" ? "All" : "❤️ Favorites"}
          </button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', alignSelf: 'center' }}>
          {displayed.length} outfit{displayed.length !== 1 ? "s" : ""}
        </span>
      </div>

      {loading && <LoadingSkeleton type="card" rows={3} />}

      {!loading && displayed.length === 0 && (
        <div style={{ textAlign: 'center', padding: '64px 24px' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>👗</p>
          <h3 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 8 }}>No outfits yet</h3>
          <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', marginBottom: 24 }}>Generate your first outfit to see it here.</p>
          <button onClick={() => router.push("/generate")} className="btn-primary">✨ Generate Outfit</button>
        </div>
      )}

      {!loading && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
          {displayed.map((outfit) => (
            <div key={outfit.id} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div>
                  <h4 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{outfit.name}</h4>
                  <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', marginTop: 2 }}>{outfit.occasion}</p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {outfit.favorite && <span style={{ fontSize: 16 }}>❤️</span>}
                  <span className="badge badge-primary">{outfit.score}/100</span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: `repeat(${Math.min(outfit.items.length, 4)}, 1fr)`, gap: 8 }}>
                {outfit.items.map((item, i) => (
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
                    <span style={{ fontSize: 16 }}>{typeEmoji(item.type)}</span>
                    <span style={{ fontSize: 9, fontWeight: 600, textAlign: 'center', padding: '0 4px', fontFamily: 'var(--font-body)', color: isLight(item.color) ? 'var(--color-foreground)' : 'rgba(255,255,255,0.85)' }}>
                      {item.name}
                    </span>
                  </div>
                ))}
              </div>
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
