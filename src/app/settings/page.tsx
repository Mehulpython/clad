"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface UserProfileData {
  displayName: string | null;
  email: string | null;
  stylePreferences: {
    favoriteColors: string[];
    preferredStyle: string;
    riskTolerance: string;
  };
  itemCount: number;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/profile").then((r) => r.json()),
      // Get user email from Clerk
      fetch("/api/auth/session").then((r) => r.json().catch(() => ({}))),
    ]).then(([profileData]) => {
      if (profileData.profile) setProfile(profileData.profile);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#e879f9] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white px-4 sm:px-6 py-6 sm:py-8">
      {/* Header */}
      <header className="border-b border-white/10 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <h1 className="text-lg sm:text-xl font-bold">
            ⚡ <span className="text-[#e879f9]">Clad</span> — Settings
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
        {/* Account Section */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">👤 Account</h2>

          {profile && (
            <>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#e879f9] to-purple-600 flex items-center justify-center text-2xl font-bold">
                  {(profile.displayName || "C").charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-lg">{profile.displayName || "Set your name"}</p>
                  <p className="text-sm text-gray-400">{profile.itemCount} items in wardrobe</p>
                </div>
              </div>

              <div className="border-t border-white/5 pt-4 space-y-3">
                <button
                  onClick={() => router.push("/profile")}
                  className="w-full flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors"
                >
                  <span>Edit Profile & Style Preferences</span>
                  <span className="text-gray-500">→</span>
                </button>

                <button className="w-full flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors">
                  <span>Notification Preferences</span>
                  <span className="text-gray-500">→</span>
                </button>

                <button className="w-full flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors">
                  <span>Connected Accounts</span>
                  <span className="text-gray-500">→</span>
                </button>
              </div>
            </>
          )}
        </section>

        {/* Data Section */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">📦 Your Data</h2>

          <div className="space-y-3">
            <button
              onClick={() => router.push("/stats")}
              className="w-full flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors"
            >
              <span>View Statistics</span>
              <span className="text-gray-500">→</span>
            </button>

            <button
              onClick={() => router.push("/gap-analysis")}
              className="w-full flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors"
            >
              <span>Wardrobe Gap Analysis</span>
              <span className="text-gray-500">→</span>
            </button>

            <button className="w-full flex items-center justify-between bg-white/5 rounded-lg px-4 py-3 hover:bg-white/10 transition-colors">
              <span>Export Wardrobe Data (JSON)</span>
              <span className="text-gray-500">⬇</span>
            </button>
          </div>
        </section>

        {/* Subscription Section */}
        <section className="glass-card rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold">💎 Plan</h2>

          <div className="bg-gradient-to-r from-[#e879f9]/10 to-purple-500/10 border border-[#e879f9]/20 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-semibold text-lg">Free Plan</p>
                <p className="text-xs text-gray-400">25 wardrobe items · 3 outfits/day</p>
              </div>
              <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-medium">CURRENT</span>
            </div>
            <button className="w-full btn-primary py-2.5 rounded-lg text-sm font-medium mt-2">
              Upgrade to Pro — $6.99/mo →
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 mt-3">
            {[
              { name: "Pro", price: "$6.99/mo", features: ["200 items", "Unlimited outfits", "Weekly planner", "Gap analysis"] },
              { name: "Studio", price: "$14.99/mo", features: ["Unlimited items", "Family accounts", "Early sale alerts", "Style AI evolution"] },
            ].map((plan) => (
              <div key={plan.name} className="bg-white/5 rounded-xl p-4 border border-white/5">
                <p className="font-semibold">{plan.name}</p>
                <p className="text-sm text-[#e879f9] font-bold">{plan.price}</p>
                <ul className="mt-2 space-y-1">
                  {plan.features.map((f) => (
                    <li key={f} className="text-[11px] text-gray-400">✓ {f}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Danger Zone */}
        <section className="glass-card rounded-xl p-6 border border-red-500/20 space-y-4">
          <h2 className="text-lg font-semibold text-red-400">⚠️ Danger Zone</h2>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg px-4 py-3 hover:bg-red-500/20 transition-colors text-sm font-medium"
            >
              Delete All Wardrobe Data
            </button>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-red-300">
                This will permanently delete all your wardrobe items, outfits, and preferences.
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 btn-secondary py-2 rounded-lg text-sm"
                >
                  Cancel
                </button>
                <button className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-red-600 transition-colors">
                  Delete Everything
                </button>
              </div>
            </div>
          )}
        </section>

        {/* App Info */}
        <div className="text-center text-xs text-gray-600 pb-8">
          <p>Clad v1.0.0 — Built with ⚡ by Clad Team</p>
          <p className="mt-1">
            <a href="/terms" className="hover:text-gray-400">Terms</a>
            {" · "}
            <a href="/privacy" className="hover:text-gray-400">Privacy</a>
          </p>
        </div>
      </main>
    </div>
  );
}
