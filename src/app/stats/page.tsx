"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BarChart3 } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
  BarChart, Bar,
} from "recharts";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import StatCard from "@/components/ui/StatCard";

/* ─── Types ─────────────────────────────────────────────── */
interface StatsOverview {
  totalItems: number;
  totalOutfits: number;
  totalWears: number;
  totalValue: number;
  avgCostPerWear: number;
  favoriteItems: number;
  favoriteOutfits: number;
  avgConfidence: number;
  avgRating: number | null;
  wornOutfitRate: number;
}

interface StatsData {
  overview: StatsOverview;
  categoryBreakdown: Record<string, number>;
  colorBreakdown: [string, number][];
  topWornItem: { name: string; wears: number } | null;
  formalityDistribution: Record<number, number>;
  seasonCoverage: Record<string, number>;
  generatedAt: string;
}

/* ─── Constants ─────────────────────────────────────────── */
const CATEGORY_COLORS = [
  "#FB7185", "#FBBF24", "#34D399", "#38BDF8", "#A78BFA", "#FB923C",
  "#F472B6", "#4ADE80", "#60A5FA", "#C084FC", "#FDBA74", "#F87171",
];

const COLOR_NAME_MAP: Record<string, string> = {
  black: "#1f2937", white: "#f3f4f6", gray: "#9ca3af", grey: "#9ca3af",
  navy: "#1e3a5a", blue: "#3b82f6", red: "#ef4444", green: "#22c55e",
  yellow: "#eab308", orange: "#f97316", pink: "#ec4899", purple: "#a855f7",
  brown: "#92400e", beige: "#f5f5dc", tan: "#d2b48c", cream: "#fffdd0",
  ivory: "#fffff0", charcoal: "#36454f", maroon: "#800000", teal: "#14b8a6",
  olive: "#808000", coral: "#ff7f50", lavender: "#e6e6fa", mint: "#98ff98",
  burgundy: "#800020", khaki: "#f0e68c", gold: "#ffd700", silver: "#c0c0c0",
};

const FORMALITY_LABELS: Record<number, string> = {
  1: "Casual", 2: "Smart Casual", 3: "Business", 4: "Semi-Formal", 5: "Very Formal",
};

/* ─── Helpers ───────────────────────────────────────────── */
function getLastSixMonths(): string[] {
  const months: string[] = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(d.toLocaleString("default", { month: "short" }));
  }
  return months;
}

function buildWearTimeData(stats: StatsData | null): { month: string; wears: number }[] {
  // No time-series wear tracking in API yet — show empty state placeholder
  return getLastSixMonths().map((m) => ({ month: m, wears: 0 }));
}

function buildCategoryPieData(stats: StatsData | null): { name: string; value: number }[] {
  if (!stats) return [];
  return Object.entries(stats.categoryBreakdown).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));
}

function buildColorBarData(stats: StatsData | null): { color: string; count: number; fill: string }[] {
  if (!stats) return [];
  return stats.colorBreakdown.map(([color, count]) => ({
    color: color.charAt(0).toUpperCase() + color.slice(1),
    count,
    fill: COLOR_NAME_MAP[color.toLowerCase()] || "#94a3b8",
  }));
}

function buildFormalityBarData(stats: StatsData | null): { level: string; count: number }[] {
  if (!stats) return [];
  return [1, 2, 3, 4, 5].map((lvl) => ({
    level: FORMALITY_LABELS[lvl] || `Level ${lvl}`,
    count: stats!.formalityDistribution[lvl] || 0,
  }));
}

/* ─── Custom Tooltip ────────────────────────────────────── */
function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "rgba(255,255,255,0.96)", border: "1px solid rgba(190,24,93,0.15)",
      borderRadius: 10, padding: "8px 14px", boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
      fontSize: 13, fontFamily: "var(--font-body)", color: "var(--color-foreground)",
    }}>
      <div style={{ fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: "var(--color-muted-foreground)" }}>
          {p.name}: <strong>{p.value}</strong>
        </div>
      ))}
    </div>
  );
}

/* ─── Donut Center Label ────────────────────────────────── */
function DonutCenterLabel({ total }: { total: number }) {
  return (
    <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle"
      style={{ fontSize: 28, fontWeight: 700, fill: "var(--color-foreground)", fontFamily: "var(--font-display)" }}>
      {total}
    </text>
  );
}

/* ─── Empty Chart State ─────────────────────────────────── */
function EmptyChartState({ message = "No data available" }: { message?: string }) {
  return (
    <div style={{
      position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center",
      flexDirection: "column", gap: 8,
    }}>
      <BarChart3 size={28} strokeWidth={1.5} color="#d1d5db" />
      <span style={{ fontSize: 13, color: "#9ca3af", fontFamily: "var(--font-body)" }}>{message}</span>
    </div>
  );
}

/* ─── Main Component ────────────────────────────────────── */
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

  const categoryPieData = buildCategoryPieData(stats);
  const colorBarData = buildColorBarData(stats);
  const formalityBarData = buildFormalityBarData(stats);
  const wearTimeData = buildWearTimeData(stats);
  const hasAnyWearData = stats != null && stats.overview.totalWears > 0;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="Wardrobe Stats"
        description="Insights into your wardrobe composition and usage patterns."
        badge="Analytics"
      />

      {loading && <LoadingSkeleton type="card" rows={2} />}

      {/* Empty State */}
      {!loading && (!stats || stats.overview.totalItems === 0) && (
        <div style={{
          textAlign: 'center', padding: '72px 24px',
          background: 'linear-gradient(135deg, #FDF2F8 0%, #FFF1F5 50%, #FDF2F8 100%)',
          borderRadius: 'var(--radius-xl)', border: '1px solid rgba(190,24,93,0.12)',
          position: 'relative', overflow: 'hidden',
        }}>
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
              <BarChart3 size={40} strokeWidth={1.5} color="#BE185D" />
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 8, color: 'var(--color-foreground)' }}>
              No data to show yet
            </h3>
            <p style={{ fontSize: 14.5, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', maxWidth: 380, margin: '0 auto 28px', lineHeight: 1.6 }}>
              Add some clothes to see your wardrobe insights
            </p>
            <button
              onClick={() => router.push("/wardrobe")}
              className="btn-primary"
              style={{ fontSize: 14, padding: '12px 28px', borderRadius: 'var(--radius-lg)' }}
            >
              Go to Wardrobe →
            </button>
          </div>
          <style>{`@keyframes gentleFloat { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-8px); } }`}</style>
        </div>
      )}

      {!loading && stats && stats.overview.totalItems > 0 && (
        <>
          {/* Top Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 32 }}>
            <StatCard label="Total Items" value={stats.overview.totalItems} icon="👕" />
            <StatCard label="Outfits Created" value={stats.overview.totalOutfits} icon="✨" />
            <StatCard label="Favorites" value={stats.overview.favoriteItems} icon="❤️" color="var(--color-secondary)" />
            <StatCard label="Total Wears" value={stats.overview.totalWears} icon="👟" color="var(--color-accent)" />
          </div>

          {/* Category Breakdown (kept original) */}
          <div className="card-static" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Category Breakdown</h3>
            {Object.keys(stats.categoryBreakdown).length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>No data yet. Upload items to see breakdown.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {Object.entries(stats.categoryBreakdown).map(([cat, count]) => {
                  const pct = stats.overview.totalItems > 0 ? (count / stats.overview.totalItems) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>{cat}</span>
                        <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>{count} items ({Math.round(pct)}%)</span>
                      </div>
                      <div style={{ height: 8, borderRadius: 4, background: 'var(--color-muted)', overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 4, background: 'var(--color-primary)', width: `${pct}%`, transition: 'width 500ms ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Color Distribution (kept original) */}
          <div className="card-static" style={{ padding: 24, marginBottom: 16 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Color Distribution</h3>
            {stats.colorBreakdown.length === 0 ? (
              <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>No data yet.</p>
            ) : (
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                {stats.colorBreakdown.map(([color, count], i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: COLOR_NAME_MAP[color.toLowerCase()] || "#94a3b8", border: '2px solid var(--color-border)' }} />
                    <span style={{ fontSize: 12, fontFamily: 'var(--font-body)', color: 'var(--color-muted-foreground)' }}>{count}× {color}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ═══════════════ INSIGHTS SECTION (Charts) ═══════════════ */}
          <h2 style={{
            fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)',
            margin: '32px 0 20px', color: 'var(--color-foreground)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <span style={{ fontSize: 22 }}>📊</span> Insights
          </h2>

          {/* Row 1: Wear Over Time + Category Donut */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16, marginBottom: 16 }}>

            {/* A. Wear Over Time — Area Chart */}
            <div className="card-static" style={{ padding: 24, position: 'relative' }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Wear Over Time</h3>
              <div style={{ width: '100%', height: 240, position: 'relative' }}>
                {hasAnyWearData ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={wearTimeData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={32} />
                      <Tooltip content={<ChartTooltip />} />
                      <Area type="monotone" dataKey="wears" name="Wears" stroke="#FB7185" fill="#FB7185" fillOpacity={0.2} strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={wearTimeData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" />
                        <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#d1d5db' }} axisLine={false} tickLine={false} />
                        <YAxis hide />
                        <Area type="monotone" dataKey="wears" stroke="#fde4e8" fill="#fef2f4" strokeWidth={1} />
                      </AreaChart>
                    </ResponsiveContainer>
                    <EmptyChartState message="Start logging wears to see trends" />
                  </>
                )}
              </div>
            </div>

            {/* B. Category Distribution — Donut */}
            <div className="card-static" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Category Distribution</h3>
              {categoryPieData.length === 0 ? (
                <div style={{ height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmptyChartState message="No categories yet" />
                </div>
              ) : (
                <div style={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryPieData}
                        cx="35%"
                        cy="50%"
                        innerRadius={58}
                        outerRadius={90}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="none"
                      >
                        {categoryPieData.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[index % CATEGORY_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip content={<ChartTooltip />} />
                      <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        iconType="circle"
                        iconSize={8}
                        wrapperStyle={{ fontSize: 12, fontFamily: "var(--font-body)", paddingLeft: 20 }}
                      />
                      {/* Center label rendered via custom component approach — use Label instead */}
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Overlay center text */}
                  <div style={{
                    position: 'absolute', pointerEvents: 'none',
                    left: 'calc(35% - 30px)', top: '50%', transform: 'translateY(-50%)',
                    textAlign: 'center',
                  }}>
                    <div style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-foreground)', lineHeight: 1 }}>
                      {stats.overview.totalItems}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>items</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Color Bar + Formality Bar */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 16, marginBottom: 16 }}>

            {/* C. Color Distribution — Horizontal Bar Chart */}
            <div className="card-static" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Color Frequency</h3>
              {colorBarData.length === 0 ? (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmptyChartState message="No color data" />
                </div>
              ) : (
                <div style={{ width: '100%', height: Math.max(200, colorBarData.length * 34) }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={colorBarData} layout="vertical" margin={{ top: 0, right: 24, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis type="category" dataKey="color" tick={{ fontSize: 12, fill: '#6b7280' }} axisLine={false} tickLine={false} width={72} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                      <Bar dataKey="count" name="Items" radius={[4, 4, 0, 0]} barSize={20}>
                        {colorBarData.map((entry, index) => (
                          <Cell key={`bar-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* D. Formality Level — Bar Chart */}
            <div className="card-static" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>Formality Level</h3>
              {formalityBarData.every((d) => d.count === 0) ? (
                <div style={{ height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <EmptyChartState message="No formality data" />
                </div>
              ) : (
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={formalityBarData} margin={{ top: 8, right: 16, left: -12, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.04)" vertical={false} />
                      <XAxis dataKey="level" tick={{ fontSize: 11, fill: '#6b7280' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} allowDecimals={false} />
                      <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(251,113,133,0.06)' }} />
                      <Bar dataKey="count" name="Items" radius={[6, 6, 0, 0]} barSize={40} fill="#FB7185" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
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
