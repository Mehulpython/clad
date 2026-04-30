"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface UserProfileData {
  displayName: string | null;
  stylePreferences: {
    favoriteColors: string[];
    preferredStyle: string;
    riskTolerance: string;
  };
  itemCount: number;
  createdAt: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [preferredStyle, setPreferredStyle] = useState("casual");
  const [riskTolerance, setRiskTolerance] = useState("moderate");
  const [favoriteColors, setFavoriteColors] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        if (data.profile) {
          setProfile(data.profile);
          setDisplayName(data.profile.displayName || "");
          setPreferredStyle(data.profile.stylePreferences?.preferredStyle || "casual");
          setRiskTolerance(data.profile.stylePreferences?.riskTolerance || "moderate");
          setFavoriteColors(data.profile.stylePreferences?.favoriteColors || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          stylePreferences: { preferredStyle, riskTolerance, favoriteColors },
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  const colorOptions = ["#1e293b", "#dc2626", "#ea580c", "#ca8a04", "#16a34a", "#2563eb", "#7c3aed", "#db2777", "#f8fafc", "#78716c"];
  const styleOptions = ["casual", "formal", "streetwear", "minimalist", "bohemian", "preppy", "athletic", "vintage"];
  const riskOptions = [
    { value: "conservative", label: "Conservative — classic, safe combos" },
    { value: "moderate", label: "Moderate — balanced with some flair" },
    { value: "adventurous", label: "Adventurous — bold patterns & colors" },
  ];

  if (loading) return <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}><LoadingSkeleton type="list" rows={5} /></div>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="Your Profile"
        description="Customize your style preferences so AI generates better outfits."
        badge="Style"
      />

      {/* Avatar + Name */}
      <div className="card-static" style={{ padding: 24, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)', flexShrink: 0 }}>
          {(displayName || "C").charAt(0).toUpperCase()}
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', marginBottom: 4, display: 'block' }}>Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="input"
            placeholder="Your name"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* Style */}
      <div className="card-static" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>🎨 Style Preference</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {styleOptions.map((style) => (
            <button
              key={style}
              onClick={() => setPreferredStyle(style)}
              style={{
                padding: '8px 18px',
                borderRadius: 'var(--radius-full)',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                border: '1px solid',
                textTransform: 'capitalize',
                ...(preferredStyle === style
                  ? { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }
                  : { background: 'var(--color-muted)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }),
              }}
            >
              {style}
            </button>
          ))}
        </div>
      </div>

      {/* Risk Tolerance */}
      <div className="card-static" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>🎲 Style Risk Level</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {riskOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setRiskTolerance(opt.value)}
              style={{
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-body)',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                border: '1px solid',
                textAlign: 'left',
                ...(riskTolerance === opt.value
                  ? { background: 'rgba(190,24,93,0.06)', color: 'var(--color-primary)', borderColor: 'var(--color-primary)' }
                  : { background: 'var(--color-muted)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }),
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Favorite Colors */}
      <div className="card-static" style={{ padding: 24, marginBottom: 16 }}>
        <h3 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>💜 Favorite Colors</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
          {colorOptions.map((color) => {
            const selected = favoriteColors.includes(color);
            return (
              <button
                key={color}
                onClick={() => setFavoriteColors(selected ? favoriteColors.filter((c) => c !== color) : [...favoriteColors, color])}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: color,
                  border: selected ? '3px solid var(--color-primary)' : '2px solid var(--color-border)',
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                  position: 'relative',
                }}
              >
                {selected && (
                  <span style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>
                    {isLight(color) ? "✓" : "✓"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Save */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-primary"
        style={{ width: '100%', fontSize: 15, padding: '14px' }}
      >
        {saving ? "Saving..." : "Save Profile"}
      </button>
    </div>
  );
}

function isLight(hex: string): boolean {
  const c = hex.replace('#', '');
  if (c.length !== 6) return true;
  return (parseInt(c.substring(0,2),16)*299 + parseInt(c.substring(2,4),16)*587 + parseInt(c.substring(4,6),16)*114) / 1000 > 150;
}
