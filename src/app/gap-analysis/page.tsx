"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import StatCard from "@/components/ui/StatCard";

interface GapSuggestion {
  name: string;
  type: string;
  color: string;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  shopUrl: string | null;
  platform: string | null;
}

interface WardrobeGap {
  category: string;
  priority: "critical" | "high" | "medium" | "low";
  description: string;
  suggestedItems: GapSuggestion[];
  combinationsUnlocked: number;
}

const PRIORITY_STYLES: Record<string, { bg: string; border: string; color: string; emoji: string }> = {
  critical: { bg: "rgba(220,38,38,0.06)", border: "rgba(220,38,38,0.25)", color: "#DC2626", emoji: "🔴" },
  high:    { bg: "rgba(234,88,12,0.06)", border: "rgba(234,88,12,0.25)", color: "#EA580C", emoji: "🟠" },
  medium:  { bg: "rgba(202,138,4,0.06)", border: "rgba(202,138,4,0.25)", color: "#CA8A04", emoji: "🟡" },
  low:     { bg: "rgba(5,150,105,0.06)", border: "rgba(5,150,105,0.25)", color: "#059669", emoji: "🟢" },
};

export default function GapAnalysisPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [gaps, setGaps] = useState<WardrobeGap[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [aiInsights, setAiInsights] = useState<string | null>(null);

  async function loadAnalysis() {
    setLoading(true);
    try {
      const res = await fetch("/api/gap-analysis");
      const data = await res.json();
      setGaps(data.gaps || []);
      setTotalItems(data.totalItems || 0);
      setAiInsights(data.aiInsights || null);
    } catch (e) {
      console.error("Failed to load gap analysis:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadAnalysis(); }, []);

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="Wardrobe Gap Analysis"
        description="Find what's missing from your wardrobe and get smart suggestions."
        badge="AI-Powered"
        action={
          <button
            onClick={() => { setAnalyzing(true); loadAnalysis().finally(() => setAnalyzing(false)); }}
            disabled={analyzing}
            className="btn-secondary"
            style={{ fontSize: 13 }}
          >
            {analyzing ? "Analyzing..." : "🔄 Re-analyze"}
          </button>
        }
      />

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
        <StatCard label="Total Items" value={totalItems} icon="👕" color="var(--color-primary)" />
        <StatCard label="Gaps Found" value={gaps.length} icon="🔍" color="var(--color-accent)" />
        <StatCard
          label="Combos Unlocked"
          value={gaps.reduce((s, g) => s + g.combinationsUnlocked, 0)}
          icon="✨"
          color="var(--color-success)"
        />
      </div>

      {/* AI Insights */}
      {aiInsights && (
        <div style={{ background: 'linear-gradient(135deg, rgba(190,24,93,0.04), rgba(236,72,153,0.04))', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 24 }}>
          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-body)', marginBottom: 8 }}>✨ AI Insights</p>
          <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{aiInsights}</p>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton type="list" rows={3} />}

      {/* No Gaps */}
      {!loading && gaps.length === 0 && (
        <div className="card-static" style={{ padding: '64px 24px', textAlign: 'center' }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🎉</p>
          <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-primary)', marginBottom: 8 }}>No Major Gaps!</h3>
          <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>Your wardrobe is well-balanced. Keep building!</p>
        </div>
      )}

      {/* Gap Cards */}
      {!loading && gaps.map((gap, idx) => {
        const cfg = PRIORITY_STYLES[gap.priority];
        return (
          <div key={idx} style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 16, border: `1px solid ${cfg.border}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>{cfg.emoji}</span>
                <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', textTransform: 'capitalize' }}>{gap.category.replace(/-/g, " ")}</h3>
                <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: cfg.bg, color: cfg.color, fontFamily: 'var(--font-body)', letterSpacing: '0.04em' }}>
                  {gap.priority.toUpperCase()}
                </span>
              </div>
              <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
                Unlocks ~{gap.combinationsUnlocked} combos
              </span>
            </div>

            <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', lineHeight: 1.7, marginBottom: 16 }}>{gap.description}</p>

            {gap.suggestedItems.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Suggestions</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {gap.suggestedItems.map((s, sIdx) => (
                    <div key={sIdx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-muted)', borderRadius: 'var(--radius-md)', padding: '12px 16px', border: '1px solid var(--color-border)' }}>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)' }}>{s.name}</p>
                        <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>{s.type} · {s.color}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>${s.estimatedPriceMin}–${s.estimatedPriceMax}</p>
                        {s.platform && <p style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>{s.platform}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button onClick={() => router.push("/shop?category=" + encodeURIComponent(gap.category))} className="btn-secondary" style={{ width: '100%', fontSize: 13 }}>
              🛒 Shop Suggestions for {gap.category.replace(/-/g, " ")}
            </button>
          </div>
        );
      })}
    </div>
  );
}
