"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

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

const VERDICT_CONFIG = {
  "great-buy": { emoji: "✅", color: "text-green-400", bg: "bg-green-500/20", border: "border-green-500/30", label: "Great Buy!" },
  "decent":    { emoji: "🤔", color: "text-yellow-400", bg: "bg-yellow-500/20", border: "border-yellow-500/30", label: "Decent Choice" },
  "skip":      { emoji: "❌", color: "text-red-400", bg: "bg-red-500/20", border: "border-red-500/30", label: "Skip It" },
  "duplicate": { emoji: "📋", color: "text-orange-400", bg: "bg-orange-500/20", border: "border-orange-500/30", label: "Duplicate" },
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
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onload = () => {
            const dataUrl = reader.result as string;
            resolve(dataUrl.split(",")[1]);
          };
          reader.readAsDataURL(file);
        });
        body.base64 = base64;
        body.estimatedPrice = 50;
      } else if (imageUrl) {
        body.imageUrl = imageUrl;
        body.estimatedPrice = 50;
      }

      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      setResult(data.scan);
      setAnalyzedItem(data.analyzedItem);
    } catch (e) {
      console.error("Scan failed:", e);
    } finally {
      setScanning(false);
    }
  }

  function getScoreColor(score: number): string {
    if (score >= 80) return "text-green-400";
    if (score >= 50) return "text-yellow-400";
    return "text-red-400";
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">
            ⚡ <span className="text-[#e879f9]">Clad</span> — Pre-Purchase Scanner
          </h1>
          <button
            onClick={() => router.push("/wardrobe")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Wardrobe
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-8 space-y-6">
        {/* Subtitle */}
        <div className="text-center mb-8">
          <p className="text-gray-400 text-sm">
            Snap a photo or paste a URL of an item you&apos;re thinking about buying.
            <br />
            We&apos;ll check if it works with your wardrobe.
          </p>
        </div>

        {/* Upload Zone */}
        <div
          className={
            "glass-card rounded-xl p-8 border-2 border-dashed transition-all cursor-pointer " +
            (dragOver ? "border-[#e879f9] bg-[#e879f9]/5" : "border-white/10 hover:border-white/20")
          }
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files[0];
            if (file && fileInputRef.current) {
              const dt = new DataTransfer();
              dt.items.add(file);
              fileInputRef.current.files = dt.files;
            }
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={() => {}}
          />
          <div className="text-center">
            <p className="text-3xl mb-3">📸</p>
            <p className="font-medium">Drop an image here or click to upload</p>
            <p className="text-xs text-gray-500 mt-1">JPG, PNG, WebP — max 10MB</p>
          </div>
        </div>

        {/* URL Input */}
        <div className="flex gap-3">
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Or paste image URL..."
            className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#e879f9] focus:outline-none text-sm"
          />
          <button
            onClick={handleScan}
            disabled={scanning || (!imageUrl && !fileInputRef.current?.files?.length)}
            className="btn-primary px-6 py-2.5 rounded-lg font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {scanning ? "Scanning..." : "🔍 Scan"}
          </button>
        </div>

        {/* Scanning State */}
        {scanning && (
          <div className="glass-card rounded-xl p-8 text-center animate-pulse">
            <p className="text-2xl mb-2">🔬</p>
            <p className="font-medium">Analyzing item against your wardrobe...</p>
            <p className="text-xs text-gray-500 mt-1">Comparing colors, patterns, style compatibility</p>
          </div>
        )}

        {/* Result */}
        {result && analyzedItem && !scanning && (() => {
          const cfg = VERDICT_CONFIG[result.verdict];
          return (
            <div className={"glass-card rounded-xl p-6 border " + cfg.border}>
              {/* Verdict Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{cfg.emoji}</span>
                  <div>
                    <p className={"text-lg font-bold " + cfg.color}>{cfg.label}</p>
                    <p className="text-xs text-gray-400">{analyzedItem.suggestedName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={"text-3xl font-bold " + getScoreColor(result.score)}>
                    {result.score}/100
                  </p>
                  <p className="text-xs text-gray-500">Score</p>
                </div>
              </div>

              {/* Score Bar */}
              <div className="w-full h-2 bg-white/10 rounded-full mb-5 overflow-hidden">
                <div
                  className={
                    "h-full rounded-full transition-all duration-700 " +
                    (result.score >= 80 ? "bg-green-500" : result.score >= 50 ? "bg-yellow-500" : "bg-red-500")
                  }
                  style={{ width: result.score + "%" }}
                />
              </div>

              {/* AI Reasoning */}
              <div className="bg-white/5 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-300 leading-relaxed">{result.reasoning}</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-[#e879f9]">{result.combinationsWithExisting}</p>
                  <p className="text-xs text-gray-400">Items it pairs with</p>
                </div>
                <div className="bg-white/5 rounded-lg p-3 text-center">
                  <p className="text-lg font-bold text-blue-400">{result.costPerWearEstimate}</p>
                  <p className="text-xs text-gray-400">Est. cost per wear</p>
                </div>
              </div>

              {/* Matching Items */}
              {result.wardrobeItemsThatMatch.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Pairs With Your Items:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.wardrobeItemsThatMatch.slice(0, 8).map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-[#e879f9]/10 border border-[#e879f9]/20 rounded-full text-xs text-[#e879f9]"
                      >
                        {item}
                      </span>
                    ))}
                    {result.wardrobeItemsThatMatch.length > 8 && (
                      <span className="px-3 py-1 bg-white/5 rounded-full text-xs text-gray-400">
                        +{result.wardrobeItemsThatMatch.length - 8} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Alternatives Owned */}
              {result.alternativesAlreadyOwned.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider mb-2">
                    Similar Items You Already Own:
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {result.alternativesAlreadyOwned.map((item, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-xs text-orange-300"
                      >
                        📋 {item}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {(result.verdict === "great-buy" || result.verdict === "decent") && (
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push("/upload")}
                    className="flex-1 btn-primary py-2.5 rounded-lg text-sm font-medium"
                  >
                    ➕ Add to Wardrobe
                  </button>
                  <button
                    onClick={() => router.push("/shop?category=" + encodeURIComponent(analyzedItem.itemType))}
                    className="flex-1 btn-secondary py-2.5 rounded-lg text-sm font-medium"
                  >
                    🛒 Shop Similar
                  </button>
                </div>
              )}
            </div>
          );
        })()}

        {/* Tips */}
        {!result && (
          <div className="glass-card rounded-xl p-5 mt-8">
            <p className="text-sm font-semibold text-gray-400 mb-3">💡 How it works</p>
            <ul className="space-y-2 text-xs text-gray-500">
              <li>• We analyze the item with AI to identify type, color, and style</li>
              <li>• Cross-reference against every piece in your wardrobe</li>
              <li>• Calculate how many outfit combinations it unlocks</li>
              <li>• Flag duplicates so you don&apos;t buy the same thing twice</li>
              <li>• Estimate cost-per-wear based on versatility score</li>
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}
