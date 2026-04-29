"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ── Types ──────────────────────────────────────────────────

interface StylePreferences {
  favoriteColors: string[];
  avoidedColors: string[];
  preferredStyle: string;
  riskTolerance: string;
}

interface UserProfileData {
  displayName: string | null;
  gender: string | null;
  bodyType: string | null;
  skinTone: string | null;
  heightCm: number | null;
  budgetMonthly: number | null;
  locationZip: string | null;
  stylePreferences: StylePreferences;
  itemCount: number;
  outfitCount: number;
}

const GENDER_OPTIONS = ["male", "female", "non-binary", "prefer-not"];
const BODY_TYPE_OPTIONS = ["slim", "athletic", "average", "broad", "plus-size"];
const SKIN_TONE_OPTIONS = ["fair", "light", "medium", "olive", "tan", "dark"];
const STYLE_OPTIONS = [
  { value: "minimal", label: "Minimal" },
  { value: "streetwear", label: "Streetwear" },
  { value: "bohemian", label: "Bohemian" },
  { value: "classic", label: "Classic" },
  { value: "trendy", label: "Trendy" },
  { value: "edgy", label: "Edgy" },
  { value: "preppy", label: "Preppy" },
  { value: "athleisure", label: "Athleisure" },
];
const RISK_OPTIONS = [
  { value: "safe", label: "Safe — I stick to what works" },
  { value: "moderate", label: "Moderate — Open to new ideas" },
  { value: "bold", label: "Bold — Push my boundaries" },
];
const COLOR_OPTIONS = [
  "black", "white", "navy", "gray", "beige", "burgundy",
  "forest green", "olive", "camel", "denim blue", "blush",
  "lavender", "charcoal", "rust", "teal", "mustard",
];

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<UserProfileData>({
    displayName: null,
    gender: null,
    bodyType: null,
    skinTone: null,
    heightCm: null,
    budgetMonthly: null,
    locationZip: null,
    stylePreferences: {
      favoriteColors: ["navy", "white"],
      avoidedColors: [],
      preferredStyle: "casual",
      riskTolerance: "moderate",
    },
    itemCount: 0,
    outfitCount: 0,
  });

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) setProfile(data.profile);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        router.refresh();
      }
    } finally {
      setSaving(false);
    }
  }

  function toggleColor(color: string, field: "favoriteColors" | "avoidedColors") {
    const current = [...profile.stylePreferences[field]];
    if (current.includes(color)) {
      setProfile({
        ...profile,
        stylePreferences: {
          ...profile.stylePreferences,
          [field]: current.filter((c) => c !== color),
        },
      });
    } else {
      setProfile({
        ...profile,
        stylePreferences: {
          ...profile.stylePreferences,
          [field]: [...current, color],
        },
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e879f9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">
            ⚡ <span className="text-[#e879f9]">Clad</span> — Profile
          </h1>
          <button
            onClick={() => router.push("/wardrobe")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Wardrobe
          </button>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-[#e879f9]">{profile.itemCount}</p>
            <p className="text-sm text-gray-400 mt-1">Wardrobe Items</p>
          </div>
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-4xl font-bold text-[#e879f9]">{profile.outfitCount}</p>
            <p className="text-sm text-gray-400 mt-1">Outfits Created</p>
          </div>
        </div>

        {/* Basic Info */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">👤 Basic Info</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-1">Display Name</label>
            <input
              type="text"
              value={profile.displayName || ""}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value || null })}
              placeholder="How should we call you?"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#e879f9] focus:outline-none transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Gender</label>
              <select
                value={profile.gender || ""}
                onChange={(e) => setProfile({ ...profile, gender: e.target.value || null })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#e879f9] focus:outline-none"
              >
                <option value="">Select...</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Body Type</label>
              <select
                value={profile.bodyType || ""}
                onChange={(e) => setProfile({ ...profile, bodyType: e.target.value || null })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#e879f9] focus:outline-none"
              >
                <option value="">Select...</option>
                {BODY_TYPE_OPTIONS.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Skin Tone</label>
              <select
                value={profile.skinTone || ""}
                onChange={(e) => setProfile({ ...profile, skinTone: e.target.value || null })}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-[#e879f9] focus:outline-none"
              >
                <option value="">Select...</option>
                {SKIN_TONE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Height (cm)</label>
              <input
                type="number"
                value={profile.heightCm || ""}
                onChange={(e) => setProfile({ ...profile, heightCm: e.target.value ? Number(e.target.value) : null })}
                placeholder="175"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#e879f9] focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monthly Budget ($)</label>
              <input
                type="number"
                value={profile.budgetMonthly || ""}
                onChange={(e) => setProfile({ ...profile, budgetMonthly: e.target.value ? Number(e.target.value) : null })}
                placeholder="150"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#e879f9] focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Location (ZIP)</label>
              <input
                type="text"
                value={profile.locationZip || ""}
                onChange={(e) => setProfile({ ...profile, locationZip: e.target.value || null })}
                placeholder="10001"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white placeholder-gray-500 focus:border-[#e879f9] focus:outline-none"
              />
            </div>
          </div>
        </section>

        {/* Style Preferences */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold mb-4">🎨 Style Preferences</h2>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Preferred Style</label>
            <div className="grid grid-cols-2 gap-2">
              {STYLE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  onClick={() =>
                    setProfile({
                      ...profile,
                      stylePreferences: { ...profile.stylePreferences, preferredStyle: s.value },
                    })
                  }
                  className={
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all " +
                    (profile.stylePreferences.preferredStyle === s.value
                      ? "bg-[#e879f9] text-black"
                      : "bg-white/5 text-gray-300 hover:bg-white/10")
                  }
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Risk Tolerance</label>
            <div className="space-y-2">
              {RISK_OPTIONS.map((r) => (
                <button
                  key={r.value}
                  onClick={() =>
                    setProfile({
                      ...profile,
                      stylePreferences: { ...profile.stylePreferences, riskTolerance: r.value },
                    })
                  }
                  className={
                    "w-full px-4 py-2.5 rounded-lg text-left text-sm transition-all " +
                    (profile.stylePreferences.riskTolerance === r.value
                      ? "bg-[#e879f9]/20 border border-[#e879f9] text-white"
                      : "bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10")
                  }
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Favorite Colors ({profile.stylePreferences.favoriteColors.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleColor(color, "favoriteColors")}
                  className={
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all " +
                    (profile.stylePreferences.favoriteColors.includes(color)
                      ? "bg-[#e879f9] text-black"
                      : "bg-white/5 text-gray-400 hover:bg-white/10")
                  }
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">
              Avoided Colors ({profile.stylePreferences.avoidedColors.length} selected)
            </label>
            <div className="flex flex-wrap gap-2">
              {COLOR_OPTIONS.map((color) => (
                <button
                  key={color}
                  onClick={() => toggleColor(color, "avoidedColors")}
                  className={
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all " +
                    (profile.stylePreferences.avoidedColors.includes(color)
                      ? "bg-red-500/20 border border-red-500/50 text-red-300"
                      : "bg-white/5 text-gray-400 hover:bg-white/10")
                  }
                >
                  ✗ {color}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full btn-primary py-3 rounded-xl font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? "Saving..." : "💾 Save Profile"}
        </button>
      </main>
    </div>
  );
}
