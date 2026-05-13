"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { BodyType, SkinTone } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────

const STYLE_OPTIONS = [
  { value: "minimalist", label: "Minimalist", emoji: "✨" },
  { value: "classic", label: "Classic", emoji: "🎩" },
  { value: "streetwear", label: "Streetwear", emoji: "🛹" },
  { value: "bohemian", label: "Bohemian", emoji: "🌿" },
  { value: "preppy", label: "Preppy", emoji: "🎓" },
  { value: "edgy", label: "Edgy", emoji: "⚡" },
  { value: "athletic", label: "Athletic", emoji: "🏃" },
  { value: "romantic", label: "Romantic", emoji: "🌸" },
];

const BODY_TYPE_OPTIONS: { value: BodyType | ""; label: string }[] = [
  { value: "", label: "Select body type…" },
  { value: "slim", label: "Slim" },
  { value: "athletic", label: "Athletic / Muscular" },
  { value: "average", label: "Average" },
  { value: "broad", label: "Broad / Heavyset" },
  { value: "plus-size", label: "Plus Size" },
];

const SKIN_TONE_OPTIONS: { value: SkinTone | ""; label: string }[] = [
  { value: "", label: "Select skin tone…" },
  { value: "fair", label: "Fair" },
  { value: "light", label: "Light" },
  { value: "medium", label: "Medium" },
  { value: "olive", label: "Olive" },
  { value: "tan", label: "Tan" },
  { value: "dark", label: "Dark" },
];

const BUDGET_OPTIONS = [
  { value: 50, label: "Budget 💰", desc: "Under $50/mo" },
  { value: 150, label: "Moderate 🛍️", desc: "$50–$150/mo" },
  { value: 500, label: "Flexible 👑", desc: "$150+/mo" },
];

const MAX_STYLES = 3;

// ─── Shared Styles ────────────────────────────────────────────

const cardStyle: React.CSSProperties = {
  borderRadius: "var(--radius-xl)",
  background: "var(--color-surface)",
  border: "1px solid var(--color-border)",
  padding: "32px 24px",
};

const headingStyle: React.CSSProperties = {
  fontSize: "clamp(1.5rem, 5vw, 2rem)",
  fontFamily: "var(--font-display)",
  fontWeight: 700,
  color: "var(--color-foreground)",
  letterSpacing: "-0.02em",
  marginBottom: 10,
};

const subStyle: React.CSSProperties = {
  fontSize: 15,
  color: "var(--color-muted-foreground)",
  fontFamily: "var(--font-body)",
  lineHeight: 1.6,
  maxWidth: 440,
};

const btnPrimary: React.CSSProperties = {
  padding: "14px 32px",
  borderRadius: "var(--radius-lg)",
  fontSize: 15,
  fontWeight: 600,
  fontFamily: "var(--font-body)",
  cursor: "pointer",
  border: "none",
  background: "var(--color-primary)",
  color: "white",
  transition: "all 200ms ease",
};

const btnSecondary: React.CSSProperties = {
  padding: "12px 24px",
  borderRadius: "var(--radius-lg)",
  fontSize: 14,
  fontWeight: 600,
  fontFamily: "var(--font-body)",
  cursor: "pointer",
  border: "1px solid var(--color-border)",
  background: "var(--color-muted)",
  color: "var(--color-foreground)",
  transition: "all 200ms ease",
};

// ─── Step Transition Wrapper ─────────────────────────────────

function StepContainer({
  step,
  children,
}: {
  step: number;
  children: React.ReactNode;
}) {
  return (
    <div
      key={step}
      style={{
        animation: "slideIn 350ms ease-out forwards",
        opacity: 0,
        transform: "translateX(20px)",
      }}
    >
      {children}
      <style>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form state
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [bodyType, setBodyType] = useState<BodyType | "">("");
  const [skinTone, setSkinTone] = useState<SkinTone | "">("");
  const [heightCm, setHeightCm] = useState("");
  const [budgetMonthly, setBudgetMonthly] = useState<number | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if user already completed onboarding
  useEffect(() => {
    fetch("/api/profile")
      .then((r) => r.json())
      .then((data) => {
        const profile = data.profile;
        // Skip onboarding if user has items OR has set style prefs + body info
        const hasItems = (profile?.itemCount || 0) > 0;
        const hasStylePrefs =
          profile?.stylePreferences?.preferredStyle &&
          profile.stylePreferences.preferredStyle !== "casual";
        const hasBodyInfo = profile?.bodyType || profile?.skinTone || profile?.heightCm;
        if (hasItems || (hasStylePrefs && hasBodyInfo)) {
          router.replace("/wardrobe");
          return;
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  // Save progress to API after each step
  const saveProgress = useCallback(
    async (stepData: Record<string, unknown>) => {
      setSaving(true);
      try {
        const res = await fetch("/api/profile", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(stepData),
        });
        if (!res.ok) throw new Error("Save failed");
      } catch {
        toast.error("Failed to save progress");
      } finally {
        setSaving(false);
      }
    },
    []
  );

  // ─── Navigation ─────────────────────────────────────────────

  const goNext = async () => {
    switch (currentStep) {
      case 1:
        await saveProgress({
          preferredStyle: selectedStyles[0] || "casual",
          favoriteColors: [],
        });
        break;
      case 2:
        await saveProgress({
          bodyType: bodyType || null,
          skinTone: skinTone || null,
          heightCm: heightCm ? parseInt(heightCm, 10) : null,
          budgetMonthly: budgetMonthly,
        });
        break;
      case 3:
        // Upload handled separately below
        break;
    }

    if (currentStep === 3 && uploadedFile) {
      // Upload the file before proceeding
      setSaving(true);
      try {
        const formData = new FormData();
        formData.append("file", uploadedFile);
        const res = await fetch("/api/wardrobe/upload", { method: "POST", body: formData });
        if (!res.ok) throw new Error("Upload failed");
        toast.success("Photo added to your wardrobe!");
      } catch {
        toast.error("Upload failed — you can add photos later");
      } finally {
        setSaving(false);
      }
    }

    setCurrentStep((prev) => prev + 1);
  };

  const goBack = () => setCurrentStep((prev) => Math.max(0, prev - 1));

  // ─── Style Toggle ───────────────────────────────────────────

  const toggleStyle = (value: string) => {
    setSelectedStyles((prev) => {
      if (prev.includes(value)) return prev.filter((s) => s !== value);
      if (prev.length >= MAX_STYLES) {
        toast.error(`Pick up to ${MAX_STYLES} styles`);
        return prev;
      }
      return [...prev, value];
    });
  };

  // ─── File Handling ──────────────────────────────────────────

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const clearFile = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setUploadedFile(null);
    setPreviewUrl(null);
  };

  // ─── Loading State ──────────────────────────────────────────

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#FDF2F8" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 36, height: 36, border: "3px solid rgba(190,24,93,0.2)", borderTopColor: "var(--color-primary)", borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ fontSize: 14, color: "var(--color-muted-foreground)", fontFamily: "var(--font-body)" }}>Setting things up…</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ─── Progress Bar ───────────────────────────────────────────

  const totalSteps = 5;
  const progressPct = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div style={{ minHeight: "100vh", background: "#FDF2F8", display: "flex", flexDirection: "column" }}>
      {/* Progress Bar */}
      <div style={{ height: 3, background: "rgba(190,24,93,0.1)" }}>
        <div
          style={{ height: "100%", background: "var(--color-primary)", transition: "width 400ms ease", width: `${progressPct}%`, borderRadius: "0 2px 2px 0" }}
        />
      </div>

      {/* Content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
        <div style={{ width: "100%", maxWidth: 520 }}>

          {/* ═══ STEP 1: Welcome ═══ */}
          {currentStep === 0 && (
            <StepContainer step={0}>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                <div style={{ fontSize: 56, marginBottom: 20 }}>👗</div>
                <h1 style={{ ...headingStyle, textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
                  Welcome to Clad! 👋
                </h1>
                <p style={{ ...subStyle, margin: "0 auto 32px", textAlign: "center" }}>
                  Your AI-powered wardrobe stylist. We'll learn your style, catalog your clothes, and help you look great every day.
                </p>

                {/* Feature highlights */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32, textAlign: "left" }}>
                  {[
                    { icon: "📸", text: "Snap or upload photos of your clothes" },
                    { icon: "🤖", text: "AI identifies & categorizes every piece" },
                    { icon: "👔", text: "Get daily outfit suggestions tailored to you" },
                  ].map((f) => (
                    <div key={f.text} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "rgba(190,24,93,0.04)", borderRadius: "var(--radius-md)" }}>
                      <span style={{ fontSize: 20 }}>{f.icon}</span>
                      <span style={{ fontSize: 14, color: "var(--color-foreground)", fontFamily: "var(--font-body)", fontWeight: 500 }}>{f.text}</span>
                    </div>
                  ))}
                </div>

                <button onClick={goNext} className="btn-primary" style={{ ...btnPrimary, width: "100%" }}>
                  Let&apos;s get started →
                </button>
              </div>
            </StepContainer>
          )}

          {/* ═══ STEP 2: Style Quiz ═══ */}
          {currentStep === 1 && (
            <StepContainer step={1}>
              <div style={cardStyle}>
                <h1 style={headingStyle}>What&apos;s your style? ✨</h1>
                <p style={{ ...subStyle, marginBottom: 24 }}>
                  Pick up to {MAX_STYLES} that resonate with you. This helps us suggest outfits you&apos;ll love.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 28 }}>
                  {STYLE_OPTIONS.map((opt) => {
                    const selected = selectedStyles.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        onClick={() => toggleStyle(opt.value)}
                        style={{
                          padding: "16px 14px",
                          borderRadius: "var(--radius-lg)",
                          fontSize: 14,
                          fontWeight: 600,
                          fontFamily: "var(--font-body)",
                          cursor: "pointer",
                          transition: "all 180ms ease",
                          border: "2px solid",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          ...(selected
                            ? {
                                background: "rgba(190,24,93,0.08)",
                                borderColor: "var(--color-primary)",
                                color: "var(--color-primary)",
                              }
                            : {
                                background: "var(--color-muted)",
                                borderColor: "transparent",
                                color: "var(--color-foreground)",
                              }),
                        }}
                      >
                        <span style={{ fontSize: 22 }}>{opt.emoji}</span>
                        <span>{opt.label}</span>
                        {selected && <span style={{ marginLeft: "auto", fontSize: 16 }}>✓</span>}
                      </button>
                    );
                  })}
                </div>

                <p style={{ fontSize: 12, color: "var(--color-muted-foreground)", fontFamily: "var(--font-body)", marginBottom: 24, textAlign: "center" }}>
                  {selectedStyles.length}/{MAX_STYLES} selected{selectedStyles.length === 0 ? " — pick at least one!" : ""}
                </p>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={goBack} style={{ ...btnSecondary, flex: 1 }}>Back</button>
                  <button
                    onClick={goNext}
                    disabled={selectedStyles.length === 0 || saving}
                    className="btn-primary"
                    style={{ ...btnPrimary, flex: 1, opacity: selectedStyles.length === 0 ? 0.5 : 1 }}
                  >
                    {saving ? "Saving…" : "Continue →"}
                  </button>
                </div>
              </div>
            </StepContainer>
          )}

          {/* ═══ STEP 3: Basic Info ═══ */}
          {currentStep === 2 && (
            <StepContainer step={2}>
              <div style={cardStyle}>
                <h1 style={headingStyle}>About You 📏</h1>
                <p style={{ ...subStyle, marginBottom: 24 }}>
                  A few details so we can recommend fits that flatter your unique shape.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 18, marginBottom: 28 }}>
                  {/* Body Type */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-foreground)", fontFamily: "var(--font-body)", marginBottom: 6, display: "block" }}>
                      Body Type
                    </label>
                    <select
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value as BodyType | "")}
                      className="input"
                      style={{ width: "100%" }}
                    >
                      {BODY_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Skin Tone */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-foreground)", fontFamily: "var(--font-body)", marginBottom: 6, display: "block" }}>
                      Skin Tone
                    </label>
                    <select
                      value={skinTone}
                      onChange={(e) => setSkinTone(e.target.value as SkinTone | "")}
                      className="input"
                      style={{ width: "100%" }}
                    >
                      {SKIN_TONE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Height */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-foreground)", fontFamily: "var(--font-body)", marginBottom: 6, display: "block" }}>
                      Height (cm)
                    </label>
                    <input
                      type="number"
                      placeholder="e.g. 170"
                      value={heightCm}
                      onChange={(e) => setHeightCm(e.target.value)}
                      className="input"
                      style={{ width: "100%" }}
                      min={100}
                      max={250}
                    />
                  </div>

                  {/* Budget Range */}
                  <div>
                    <label style={{ fontSize: 13, fontWeight: 600, color: "var(--color-foreground)", fontFamily: "var(--font-body)", marginBottom: 10, display: "block" }}>
                      Monthly Clothing Budget
                    </label>
                    <div style={{ display: "flex", gap: 8 }}>
                      {BUDGET_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          onClick={() => setBudgetMonthly(opt.value)}
                          style={{
                            flex: 1,
                            padding: "12px 10px",
                            borderRadius: "var(--radius-md)",
                            fontSize: 13,
                            fontWeight: 600,
                            fontFamily: "var(--font-body)",
                            cursor: "pointer",
                            transition: "all 180ms ease",
                            border: "2px solid",
                            textAlign: "center",
                            ...(budgetMonthly === opt.value
                              ? {
                                  background: "rgba(190,24,93,0.08)",
                                  borderColor: "var(--color-primary)",
                                  color: "var(--color-primary)",
                                }
                              : {
                                  background: "var(--color-muted)",
                                  borderColor: "transparent",
                                  color: "var(--color-foreground)",
                                }),
                          }}
                        >
                          <div>{opt.label}</div>
                          <div style={{ fontSize: 11, fontWeight: 400, marginTop: 2, opacity: 0.75 }}>{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={goBack} style={{ ...btnSecondary, flex: 1 }}>Back</button>
                  <button
                    onClick={goNext}
                    disabled={saving}
                    className="btn-primary"
                    style={{ ...btnPrimary, flex: 1 }}
                  >
                    {saving ? "Saving…" : "Continue →"}
                  </button>
                </div>
              </div>
            </StepContainer>
          )}

          {/* ═══ STEP 4: First Upload ═══ */}
          {currentStep === 3 && (
            <StepContainer step={3}>
              <div style={cardStyle}>
                <h1 style={headingStyle}>Add Your First Piece 📸</h1>
                <p style={{ ...subStyle, marginBottom: 24 }}>
                  Upload a photo of any clothing item. AI will analyze it and add it to your wardrobe.
                </p>

                {!previewUrl ? (
                  /* Drop Zone */
                  <div
                    onDragOver={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      handleFiles(e.dataTransfer.files);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      borderRadius: "var(--radius-xl)",
                      padding: "48px 24px",
                      border: `2px dashed ${isDragging ? "var(--color-primary)" : "var(--color-border-strong)"}`,
                      background: isDragging ? "rgba(190,24,93,0.04)" : "var(--color-muted)",
                      textAlign: "center",
                      cursor: "pointer",
                      transition: "all 200ms ease",
                      marginBottom: 20,
                    }}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      style={{ display: "none" }}
                      onChange={(e) => handleFiles(e.target.files)}
                    />
                    <p style={{ fontSize: 40, marginBottom: 12 }}>📷</p>
                    <p style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-body)", marginBottom: 6 }}>
                      Tap to take a photo or drop an image here
                    </p>
                    <p style={{ fontSize: 13, color: "var(--color-muted-foreground)", fontFamily: "var(--font-body)" }}>
                      JPEG, PNG, WebP · Max 10MB
                    </p>
                  </div>
                ) : (
                  /* Preview */
                  <div style={{ marginBottom: 20 }}>
                    <div
                      style={{
                        position: "relative",
                        borderRadius: "var(--radius-xl)",
                        overflow: "hidden",
                        border: "1px solid var(--color-border)",
                        aspectRatio: "3/4",
                        maxWidth: 280,
                        margin: "0 auto",
                      }}
                    >
                      <img src={previewUrl} alt="Upload preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button
                        onClick={clearFile}
                        style={{
                          position: "absolute",
                          top: 10,
                          right: 10,
                          width: 32,
                          height: 32,
                          borderRadius: "50%",
                          background: "rgba(0,0,0,0.55)",
                          border: "none",
                          cursor: "pointer",
                          fontSize: 16,
                          color: "white",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        ×
                      </button>
                    </div>
                    <p style={{ fontSize: 13, color: "var(--color-success)", fontFamily: "var(--font-body)", textAlign: "center", marginTop: 10, fontWeight: 600 }}>
                      ✓ Photo ready to upload
                    </p>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={goBack} style={{ ...btnSecondary, flex: 1 }}>Back</button>
                    <button
                      onClick={goNext}
                      disabled={saving}
                      className="btn-primary"
                      style={{ ...btnPrimary, flex: 1 }}
                    >
                      {saving ? "Uploading…" : uploadedFile ? "Upload & Continue →" : "Skip for now →"}
                    </button>
                  </div>
                  <button
                    onClick={goNext}
                    disabled={saving}
                    style={{
                      ...btnSecondary,
                      width: "100%",
                      background: "transparent",
                      fontSize: 13,
                      color: "var(--color-muted-foreground)",
                    }}
                  >
                    I&apos;ll do this later
                  </button>
                </div>
              </div>
            </StepContainer>
          )}

          {/* ═══ STEP 5: Complete ═══ */}
          {currentStep === 4 && (
            <StepContainer step={4}>
              <div style={{ ...cardStyle, textAlign: "center" }}>
                {/* Celebration animation */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 96,
                    height: 96,
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, rgba(190,24,93,0.1), rgba(236,72,153,0.15))",
                    marginBottom: 24,
                    animation: "popIn 500ms ease-out",
                  }}
                >
                  <span style={{ fontSize: 48 }}>🎉</span>
                </div>

                <h1 style={{ ...headingStyle, textAlign: "center", marginLeft: "auto", marginRight: "auto" }}>
                  You&apos;re all set! 🎉
                </h1>
                <p style={{ ...subStyle, margin: "0 auto 32px", textAlign: "center" }}>
                  Your Clad wardrobe is ready. Here are a few things you can do next:
                </p>

                {/* Action Cards */}
                <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
                  {/* Upload Card */}
                  <button
                    onClick={() => router.push("/upload")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "18px 20px",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--color-muted)",
                      border: "1px solid var(--color-border)",
                      cursor: "pointer",
                      transition: "all 180ms ease",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(190,24,93,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      📸
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-body)", color: "var(--color-foreground)", margin: 0 }}>Upload More Items</p>
                      <p style={{ fontSize: 12.5, color: "var(--color-muted-foreground)", fontFamily: "var(--font-body)", margin: "4px 0 0" }}>Add more clothes to your wardrobe</p>
                    </div>
                    <span style={{ fontSize: 18, color: "var(--color-muted-foreground)" }}>→</span>
                  </button>

                  {/* Generate Card */}
                  <button
                    onClick={() => router.push("/generate")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "18px 20px",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--color-muted)",
                      border: "1px solid var(--color-border)",
                      cursor: "pointer",
                      transition: "all 180ms ease",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(5,150,105,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      ✨
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-body)", color: "var(--color-foreground)", margin: 0 }}>Generate Outfit</p>
                      <p style={{ fontSize: 12.5, color: "var(--color-muted-foreground)", fontFamily: "var(--font-body)", margin: "4px 0 0" }}>Let AI create a perfect outfit for today</p>
                    </div>
                    <span style={{ fontSize: 18, color: "var(--color-muted-foreground)" }}>→</span>
                  </button>

                  {/* Wardrobe Card */}
                  <button
                    onClick={() => router.push("/wardrobe")}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      padding: "18px 20px",
                      borderRadius: "var(--radius-lg)",
                      background: "var(--color-muted)",
                      border: "1px solid var(--color-border)",
                      cursor: "pointer",
                      transition: "all 180ms ease",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <div style={{ width: 44, height: 44, borderRadius: "var(--radius-md)", background: "rgba(217,119,6,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                      👔
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 15, fontWeight: 600, fontFamily: "var(--font-body)", color: "var(--color-foreground)", margin: 0 }}>View Wardrobe</p>
                      <p style={{ fontSize: 12.5, color: "var(--color-muted-foreground)", fontFamily: "var(--font-body)", margin: "4px 0 0" }}>Browse and manage your clothing collection</p>
                    </div>
                    <span style={{ fontSize: 18, color: "var(--color-muted-foreground)" }}>→</span>
                  </button>
                </div>

                <button
                  onClick={() => router.push("/wardrobe")}
                  className="btn-primary"
                  style={{ ...btnPrimary, width: "100%" }}
                >
                  Go to My Wardrobe →
                </button>

                <style>{`
                  @keyframes popIn {
                    0%   { transform: scale(0.5); opacity: 0; }
                    60%  { transform: scale(1.1); }
                    100% { transform: scale(1); opacity: 1; }
                  }
                `}</style>
              </div>
            </StepContainer>
          )}
        </div>
      </div>
    </div>
  );
}
