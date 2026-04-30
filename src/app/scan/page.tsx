"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";

interface PrePurchaseScan {
  verdict: "great-buy" | "decent" | "skip" | "duplicate";
  score: number;
  reasoning: string;
  combinationsWithExisting: number;
  wardrobeItemsThatMatch: string[];
  costPerWearEstimate: string;
  alternativesAlreadyOwned: string[];
}

interface AnalyzedItem {
  itemType: string;
  subtype: string;
  primaryColor: string;
  confidence: number;
  suggestedName: string;
}

const VERDICT_STYLES = {
  "great-buy": { emoji: "✅", color: "#059669", bg: "rgba(5,150,105,0.06)", border: "rgba(5,150,105,0.25)", label: "Great Buy!" },
  "decent":    { emoji: "🤔", color: "#CA8A04", bg: "rgba(202,138,4,0.06)", border: "rgba(202,138,4,0.25)", label: "Decent Choice" },
  "skip":      { emoji: "❌", color: "#DC2626", bg: "rgba(220,38,38,0.06)", border: "rgba(220,38,38,0.25)", label: "Skip It" },
  "duplicate": { emoji: "📋", color: "#EA580C", bg: "rgba(234,88,12,0.06)", border: "rgba(234,88,12,0.25)", label: "Duplicate" },
};

export default function ScanPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<PrePurchaseScan | null>(null);
  const [analyzedItem, setAnalyzedItem] = useState<AnalyzedItem | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function handleScan() {
    if (!imageUrl && !fileInputRef.current?.files?.length) return;
    setScanning(true);
    setResult(null);
    setAnalyzedItem(null);

    try {
      let body: Record<string, unknown> = {};
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        const base64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve((reader.result as string).split(",")[1]);
          reader.readAsDataURL(file);
        });
        body.base64 = base64;
        body.estimatedPrice = 50;
      } else if (imageUrl) {
        body.imageUrl = imageUrl;
        body.estimatedPrice = 50;
      }

      const res = await fetch("/api/scan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const data = await res.json();
      setResult(data.scan);
      setAnalyzedItem(data.analyzedItem);
    } catch (e) {
      console.error("Scan failed:", e);
    } finally {
      setScanning(false);
    }
  }

  function scoreColor(score: number) {
    if (score >= 80) return "#059669";
    if (score >= 50) return "#CA8A04";
    return "#DC2626";
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="Pre-Purchase Scanner"
        description="Snap a photo or paste a URL — we'll check if it works with your wardrobe."
        badge="Scan"
      />

      {/* Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault(); setDragOver(false);
          const file = e.dataTransfer.files[0];
          if (file && fileInputRef.current) {
            const dt = new DataTransfer(); dt.items.add(file); fileInputRef.current.files = dt.files;
          }
        }}
        style={{
          borderRadius: 'var(--radius-lg)',
          padding: '48px 24px',
          border: `2px dashed ${dragOver ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
          background: dragOver ? 'rgba(190,24,93,0.04)' : 'var(--color-muted)',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 150ms ease',
          marginBottom: 16,
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={() => {}} />
        <p style={{ fontSize: 36, marginBottom: 12 }}>📸</p>
        <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 4 }}>Drop an image here or click to upload</p>
        <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>JPG, PNG, WebP — max 10MB</p>
      </div>

      {/* URL Input */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 24 }}>
        <input
          type="url"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="Or paste image URL..."
          className="input"
          style={{ flex: 1 }}
        />
        <button
          onClick={handleScan}
          disabled={scanning || (!imageUrl && !fileInputRef.current?.files?.length)}
          className="btn-primary"
          style={{ fontSize: 13, padding: '10px 20px', whiteSpace: 'nowrap' }}
        >
          {scanning ? "Scanning..." : "🔍 Scan"}
        </button>
      </div>

      {/* Scanning */}
      {scanning && (
        <div style={{ textAlign: 'center', padding: '48px 24px', marginBottom: 16 }}>
          <p style={{ fontSize: 28, marginBottom: 8 }}>🔬</p>
          <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 4 }}>Analyzing item against your wardrobe...</p>
          <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>Comparing colors, patterns, style compatibility</p>
        </div>
      )}

      {/* Result */}
      {result && analyzedItem && !scanning && (() => {
        const cfg = VERDICT_STYLES[result.verdict];
        return (
          <div style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 24, border: `1px solid ${cfg.border}`, marginBottom: 16 }}>
            {/* Verdict */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: 28 }}>{cfg.emoji}</span>
                <div>
                  <p style={{ fontSize: 18, fontWeight: 700, color: cfg.color, fontFamily: 'var(--font-display)' }}>{cfg.label}</p>
                  <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>{analyzedItem.suggestedName}</p>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: 28, fontWeight: 800, color: scoreColor(result.score), fontFamily: 'var(--font-display)' }}>{result.score}</p>
                <p style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>Score</p>
              </div>
            </div>

            {/* Score Bar */}
            <div style={{ height: 6, borderRadius: 3, background: 'var(--color-muted)', overflow: 'hidden', marginBottom: 20 }}>
              <div style={{ height: '100%', borderRadius: 3, background: cfg.color, width: `${result.score}%`, transition: 'width 700ms ease' }} />
            </div>

            {/* Reasoning */}
            <div style={{ background: 'var(--color-muted)', borderRadius: 'var(--radius-md)', padding: 14, border: '1px solid var(--color-border)', marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', lineHeight: 1.7 }}>{result.reasoning}</p>
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
              <div style={{ background: 'var(--color-muted)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-display)' }}>{result.combinationsWithExisting}</p>
                <p style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>Items it pairs with</p>
              </div>
              <div style={{ background: 'var(--color-muted)', borderRadius: 'var(--radius-md)', padding: 14, textAlign: 'center', border: '1px solid var(--color-border)' }}>
                <p style={{ fontSize: 20, fontWeight: 700, color: '#2563EB', fontFamily: 'var(--font-display)' }}>{result.costPerWearEstimate}</p>
                <p style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>Est. cost per wear</p>
              </div>
            </div>

            {/* Matching Items */}
            {result.wardrobeItemsThatMatch.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Pairs With Your Items</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.wardrobeItemsThatMatch.slice(0, 8).map((item, idx) => (
                    <span key={idx} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(190,24,93,0.06)', border: '1px solid var(--color-border-strong)', fontSize: 11, fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>{item}</span>
                  ))}
                  {result.wardrobeItemsThatMatch.length > 8 && (
                    <span style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'var(--color-muted)', fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>+{result.wardrobeItemsThatMatch.length - 8} more</span>
                  )}
                </div>
              </div>
            )}

            {/* Alternatives */}
            {result.alternativesAlreadyOwned.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: '#EA580C', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Similar Items You Already Own</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {result.alternativesAlreadyOwned.map((item, idx) => (
                    <span key={idx} style={{ padding: '4px 12px', borderRadius: 'var(--radius-full)', background: 'rgba(234,88,12,0.06)', border: '1px solid rgba(234,88,12,0.2)', fontSize: 11, fontWeight: 600, color: '#EA580C', fontFamily: 'var(--font-body)' }}>📋 {item}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {(result.verdict === "great-buy" || result.verdict === "decent") && (
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={() => router.push("/upload")} className="btn-primary" style={{ flex: 1, fontSize: 13 }}>➕ Add to Wardrobe</button>
                <button onClick={() => router.push("/shop?category=" + encodeURIComponent(analyzedItem.itemType))} className="btn-secondary" style={{ flex: 1, fontSize: 13 }}>🛒 Shop Similar</button>
              </div>
            )}
          </div>
        );
      })()}

      {/* Tips */}
      {!result && (
        <div style={{ background: 'var(--color-muted)', borderRadius: 'var(--radius-lg)', padding: 20, border: '1px solid var(--color-border)' }}>
          <p style={{ fontSize: 13, fontWeight: 700, fontFamily: 'var(--font-body)', marginBottom: 12 }}>💡 How it works</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[
              "AI analyzes the item to identify type, color, and style",
              "Cross-references against every piece in your wardrobe",
              "Calculates how many outfit combinations it unlocks",
              "Flags duplicates so you don't buy the same thing twice",
              "Estimates cost-per-wear based on versatility score",
            ].map((tip) => (
              <div key={tip} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                  <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
                <span style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', lineHeight: 1.5 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
