"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AccountSummary {
  exists: boolean;
  summary?: {
    displayName: string | null;
    createdAt: string;
    plan: string;
    itemCount: number;
    outfitCount: number;
    memberSince: string;
  };
}

type Step = "start" | "understand" | "confirm" | "processing" | "done" | "error";

export default function DeleteAccountPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("start");
  const [summary, setSummary] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [exportRequested, setExportRequested] = useState(false);
  const [confirmedTyping, setConfirmedTyping] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [exportData, setExportData] = useState<Record<string, unknown> | null>(null);

  const DELETE_CONFIRM_PHRASE = "DELETE MY ACCOUNT";

  useEffect(() => {
    fetch("/api/delete-account")
      .then((r) => r.json())
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load account information");
        setLoading(false);
      });
  }, []);

  async function handleDelete() {
    setStep("processing");
    setError(null);

    try {
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmed: true,
          exportData: exportRequested,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Deletion failed");
        setStep("error");
        return;
      }

      if (data.exportData) {
        setExportData(data.exportData);
      }

      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Network error");
      setStep("error");
    }
  }

  function downloadExport() {
    if (!exportData) return;
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `clad-account-export-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const canConfirm =
    confirmedTyping.trim().toUpperCase() === DELETE_CONFIRM_PHRASE;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">
            ⚡ <span className="text-[#e879f9]">Clad</span> — Delete Account
          </h1>
          <button
            onClick={() => router.push("/settings")}
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Settings
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-10">
        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-10">
          {(["start", "understand", "confirm"] as Step[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div
                className={
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all " +
                  (["processing", "done", "error"].includes(step) ||
                  ["processing", "done", "error"].includes(s) ||
                  (i <
                    [
                      "start",
                      "understand",
                      "confirm",
                    ].indexOf(step))
                    ? "bg-red-500 text-white"
                    : "bg-white/10 text-gray-500")
                }
              >
                {step === "processing" && s === step
                  ? "⏳"
                  : step === "done"
                  ? "✓"
                  : step === "error" && s === step
                  ? "✗"
                  : i + 1}
              </div>
              {i < 2 && (
                <div className="flex-1 h-[2px] bg-white/10" />
              )}
            </div>
          ))}
        </div>

        {/* ─── STEP 1: Start ─────────────────────────────── */}
        {step === "start" && (
          <div className="space-y-6">
            <div className="glass-card p-6 border border-red-500/20 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <h2 className="text-xl font-bold text-red-400 mb-2">
                Delete Your Account?
              </h2>
              <p className="text-gray-400 text-sm">
                This is a permanent action that cannot be undone.
              </p>
            </div>

            {summary?.exists && summary.summary && (
              <div className="glass-card p-5 space-y-3">
                <h3 className="font-semibold text-sm text-gray-300">
                  Current Account Summary
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Name</p>
                    <p className="text-sm font-medium">
                      {summary.summary.displayName || "Not set"}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Plan</p>
                    <p className="text-sm font-medium capitalize">
                      {summary.summary.plan}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Wardrobe Items</p>
                    <p className="text-sm font-medium">{summary.summary.itemCount}</p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-3">
                    <p className="text-xs text-gray-500">Outfits Created</p>
                    <p className="text-sm font-medium">{summary.summary.outfitCount}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Member since{" "}
                  {new Date(summary.summary.memberSince).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
            )}

            <button
              onClick={() => setStep("understand")}
              className="w-full bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl px-6 py-4 font-semibold hover:bg-red-500/25 transition-all"
            >
              Continue to Deletion →
            </button>

            <button
              onClick={() => router.push("/settings")}
              className="w-full btn-secondary py-3 rounded-xl"
            >
              Cancel, Keep My Account
            </button>
          </div>
        )}

        {/* ─── STEP 2: Understand Consequences ───────────── */}
        {step === "understand" && (
          <div className="space-y-6">
            <div className="glass-card p-6 space-y-5">
              <h2 className="text-lg font-bold">
                📋 What Happens When You Delete Your Account
              </h2>

              <div className="space-y-4">
                {[
                  {
                    icon: "🗑️",
                    title: "All wardrobe items are permanently deleted",
                    desc: "Every clothing item you uploaded, including AI analysis, tags, wear counts, and photos.",
                    irreversible: true,
                  },
                  {
                    icon: "👗",
                    title: "All outfits are permanently deleted",
                    desc: "Generated outfits, your weekly planner history, favorites, and ratings — all gone.",
                    irreversible: true,
                  },
                  {
                    icon: "📊",
                    title: "Style profile & preferences are deleted",
                    desc: "Your body type, color preferences, style choices, and measurement data.",
                    irreversible: true,
                  },
                  {
                    icon: "💳",
                    title: "Subscription is cancelled immediately",
                    desc: "If you're on Pro or Studio, billing stops. No prorated refund for remaining time.",
                    irreversible: true,
                  },
                  {
                    icon: "🔐",
                    title: "Your login credentials are deactivated",
                    desc: "You'll be signed out on all devices. The account cannot be recovered or reactivated.",
                    irreversible: true,
                  },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <span className="text-xl shrink-0 mt-0.5">{item.icon}</span>
                    <div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                      {item.irreversible && (
                        <p className="text-[10px] text-red-400/70 mt-1 flex items-center gap-1">
                          <span>✗</span> This action cannot be undone
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Data Export Option */}
            <div className="glass-card p-5 border border-blue-500/20">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={exportRequested}
                  onChange={(e) => setExportRequested(e.target.checked)}
                  className="mt-1 w-4 h-4 accent-[#e879f9]"
                />
                <div>
                  <p className="text-sm font-medium text-blue-300">
                    💾 Export my data before deleting
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Download a copy of all your wardrobe items, outfits, and profile
                    data as a JSON file before we delete everything.
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep("confirm")}
                className="flex-1 bg-red-500 text-white rounded-xl px-6 py-3.5 font-semibold hover:bg-red-600 transition-all"
              >
                I Understand, Continue →
              </button>
              <button
                onClick={() => setStep("start")}
                className="btn-secondary py-3.5 px-4 rounded-xl"
              >
                ← Go Back
              </button>
            </div>
          </div>
        )}

        {/* ─── STEP 3: Final Confirmation ──────────────────── */}
        {step === "confirm" && (
          <div className="space-y-6">
            <div className="glass-card p-6 border border-red-500/30 text-center space-y-4">
              <div className="text-5xl">🚨</div>
              <h2 className="text-xl font-bold text-red-400">
                Final Confirmation
              </h2>
              <p className="text-sm text-gray-300">
                Type the phrase below to confirm permanent account deletion:
              </p>
              <code className="block text-lg font-mono font-bold text-red-300 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3 tracking-wide">
                {DELETE_CONFIRM_PHRASE}
              </code>
            </div>

            <input
              type="text"
              value={confirmedTyping}
              onChange={(e) => setConfirmedTyping(e.target.value)}
              placeholder='Type "DELETE MY ACCOUNT" here'
              className="w-full bg-white/5 border-2 border-white/10 rounded-xl px-5 py-4 text-center text-lg font-mono tracking-wider placeholder:text-gray-600 focus:border-red-500 focus:outline-none transition-colors uppercase"
              autoFocus
            />

            {!canConfirm && confirmedTyping.length > 0 && (
              <p className="text-xs text-yellow-400 text-center">
                Keep typing… phrase must match exactly
              </p>
            )}

            {canConfirm && (
              <div className="glass-card p-3 border border-green-500/20 text-center">
                <p className="text-sm text-green-400 font-medium">
                  ✓ Confirmed. Ready to delete.
                </p>
              </div>
            )}

            <button
              onClick={handleDelete}
              disabled={!canConfirm}
              className={
                "w-full rounded-xl px-6 py-4 font-bold text-base transition-all " +
                (canConfirm
                  ? "bg-red-500 text-white hover:bg-red-600 cursor-pointer"
                  : "bg-white/5 text-gray-500 cursor-not-allowed")
              }
            >
              {canConfirm
                ? "🗑️ Permanently Delete My Account"
                : "Type confirmation phrase above"}
            </button>

            <button
              onClick={() => setStep("understand")}
              className="w-full btn-secondary py-3 rounded-xl"
            >
              ← I Changed My Mind
            </button>
          </div>
        )}

        {/* ─── STEP: Processing ───────────────────────────── */}
        {step === "processing" && (
          <div className="glass-card p-12 text-center space-y-4">
            <div className="w-12 h-12 border-3 border-red-400 border-t-transparent rounded-full animate-spin mx-auto" />
            <h2 className="text-lg font-bold">Deleting Your Account</h2>
            <p className="text-sm text-gray-400">
              This may take a moment. We&apos;re removing all your data from our
              servers…
            </p>
            <div className="space-y-2 text-left max-w-xs mx-auto">
              {[
                "Deleting wardrobe items…",
                "Removing outfits & planner data…",
                "Erasing style profile…",
                "Deactivating account…",
              ].map((msg, i) => (
                <p
                  key={i}
                  className={`text-xs flex items-center gap-2 ${
                    i <= Math.floor(Date.now() / 1000) % 5
                      ? "text-green-400"
                      : "text-gray-500"
                  }`}
                >
                  <span>{i <= Math.floor(Date.now() / 1000) % 5 ? "✓" : "○"}</span>{" "}
                  {msg}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* ─── STEP: Done ─────────────────────────────────── */}
        {step === "done" && (
          <div className="glass-card p-8 text-center space-y-6">
            <div className="text-6xl">👋</div>
            <h2 className="text-2xl font-bold">Account Deleted</h2>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              Your account and all associated data have been permanently deleted
              from our servers. We&apos;re sorry to see you go.
            </p>

            {exportData && (
              <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                <p className="text-sm text-green-300 font-medium mb-2">
                  ✅ Your data export is ready
                </p>
                <button
                  onClick={downloadExport}
                  className="btn-primary py-2 px-6 text-sm"
                >
                  Download Export (JSON)
                </button>
              </div>
            )}

            <div className="space-y-2 text-xs text-gray-500">
              <p>A copy of this confirmation has been logged.</p>
              <p>If you didn&apos;t initiate this deletion, contact us immediately.</p>
            </div>

            <button
              onClick={() => router.push("/")}
              className="btn-primary py-3 px-8"
            >
              Return to Clad Homepage
            </button>
          </div>
        )}

        {/* ─── STEP: Error ─────────────────────────────────── */}
        {step === "error" && (
          <div className="glass-card p-8 text-center space-y-6 border border-red-500/30">
            <div className="text-5xl">❌</div>
            <h2 className="text-xl font-bold text-red-400">
              Deletion Failed
            </h2>
            <p className="text-gray-400 text-sm">
              Something went wrong while deleting your account.
            </p>
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                <p className="text-xs text-red-300 font-mono">{error}</p>
              </div>
            )}
            <div className="flex gap-3 justify-center">
              <button
                onClick={handleDelete}
                className="bg-red-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-red-600"
              >
                Try Again
              </button>
              <button
                onClick={() => router.push("/settings")}
                className="btn-secondary px-6 py-2.5 rounded-lg text-sm"
              >
                Back to Settings
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
