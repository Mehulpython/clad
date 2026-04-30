"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import StatCard from "@/components/ui/StatCard";

interface StatsData {
  totalItems: number;
  totalOutfits: number;
  favoriteCount: number;
  categoriesBreakdown: { category: string; count: number; color: string }[];
  colorDistribution: { color: string; count: number }[];
  mostWornType: string;
  averageOutfitScore: number;
  weeklyGenerations: number;
}

export default function StatsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsData | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="Wardrobe Stats"
        description="Insights into your wardrobe composition and usage patterns."
        badge="Analytics"
      />

      {loading && <LoadingSkeleton type="card" rows={2} />}

      {!loading && stats && (
        <>
          {/* Top Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
            <StatCard label="Total Items" value={stats.totalItems} icon="👕" />
            <StatCard label="Outfits Created" value={stats.totalOutfits} icon="✨" />
            <StatCard label="Favorites" value={stats.favoriteCount} icon="❤️" color="var(--color-secondary)" />
            <StatCard label="Avg Score" value={stats.averageOutfitScore || 0} icon="⭐" color="var(--color-accent)" />
          </div>

          {/* Category Breakdown */}
          <div className="card-static" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Category Breakdown</h3>
            {stats.categoriesBreakdown.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>No data yet. Upload items to see breakdown.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {stats.categoriesBreakdown.map((cat) => {
                  const pct = stats.totalItems > 0 ? (cat.count / stats.totalItems) * 100 : 0;
                  return (
                    <div key={cat.category}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>{cat.category}</span>
                        <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>{cat.count} items ({Math.round(pct)}%)</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'var(--color-muted)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 4, background: cat.color || 'var(--color-primary)', width: `${pct}%`, transition: 'width 500ms ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Color Distribution */}
          <div className="card-static" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Color Distribution</h3>
            {stats.colorDistribution.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>No data yet.</p>
            ) : (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {stats.colorDistribution.map((c, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: c.color, border: '2px solid var(--color-border)' }} />
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-muted-foreground)' }}>{c.count}×</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card-static" style={{ padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
              {[
                { label: "Gap Analysis", icon: "🔍", action: () => router.push("/gap-analysis") },
                { label: "Generate Outfit", icon: "✨", action: () => router.push("/generate") },
                { label: "Weekly Planner", icon: "📅", action: () => router.push("/planner") },
                { label: "Shop Suggestions", icon: "🛍️", action: () => router.push("/shop") },
              ].map((item) => (
                <button key={item.label} onClick={item.action} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '14px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--color-muted)', border: '1px solid var(--color-border)',
                  cursor: 'pointer', fontSize: 14, fontFamily: 'var(--font-body)', fontWeight: 600, color: 'var(--color-foreground)',
                  transition: 'all 150ms ease',
                }}>
                  <span>{item.icon}</span> {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
