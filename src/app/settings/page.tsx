"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface UserProfileData {
  displayName: string | null;
  stylePreferences: { favoriteColors: string[]; preferredStyle: string; riskTolerance: string };
  itemCount: number;
  createdAt: string;
}

export default function SettingsPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleExportData = useCallback(async () => {
    setExporting(true);
    try {
      const res = await fetch("/api/export-data");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Export failed (${res.status})`);
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `clad-export-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Data exported!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  }, []);

  const handleDeleteAccount = useCallback(async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/delete-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmed: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Deletion failed");
      toast.success("Account deleted successfully");
      router.push("/");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete account");
    } finally {
      setDeleting(false);
      setShowDeleteConfirm(false);
    }
  }, [router]);

  useEffect(() => {
    fetch("/api/profile").then((r) => r.json()).then((data) => {
      if (data.profile) setProfile(data.profile);
      setLoading(false);
    });
  }, []);

  if (loading) return <div style={{ padding: 80 }}><LoadingSkeleton type="list" rows={4} /></div>;

  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader title="Settings" description="Manage your account, preferences, and plan." />

      {/* Account */}
      <section className="card-static" style={{ padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>👤 Account</h2>
        {profile && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: 'white', fontFamily: 'var(--font-display)' }}>
                {(profile.displayName || "C").charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontWeight: 600, fontSize: 16, fontFamily: 'var(--font-body)' }}>{profile.displayName || "Set your name"}</p>
                <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>{profile.itemCount} items in wardrobe</p>
              </div>
            </div>
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { label: "Edit Profile & Style Preferences", action: () => router.push("/profile") },
                { label: "Notification Preferences", action: () => {} },
                { label: "Connected Accounts", action: () => {} },
              ].map((item) => (
                <button key={item.label} onClick={item.action} disabled={(item as { disabled?: boolean }).disabled} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', cursor: (item as { disabled?: boolean }).disabled ? 'not-allowed' : 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-foreground)', opacity: (item as { disabled?: boolean }).disabled ? 0.6 : 1, transition: 'all 150ms ease' }}>
                  <span>{item.label}{exporting && item.label.includes("Export") ? "…" : ""}</span>
                  <span style={{ color: 'var(--color-muted-foreground)' }}>→</span>
                </button>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Data */}
      <section className="card-static" style={{ padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>📦 Your Data</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: "View Statistics", action: () => router.push("/stats") },
            { label: "Wardrobe Gap Analysis", action: () => router.push("/gap-analysis") },
            { label: "Export Wardrobe Data (JSON)", action: handleExportData, disabled: exporting },
          ].map((item) => (
            <button key={item.label} onClick={item.action} style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--color-muted)', border: '1px solid var(--color-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontSize: 14, color: 'var(--color-foreground)', transition: 'all 150ms ease' }}>
              <span>{item.label}</span>
              <span style={{ color: 'var(--color-muted-foreground)' }}>→</span>
            </button>
          ))}
        </div>
      </section>

      {/* Plan */}
      <section className="card-static" style={{ padding: 24, marginBottom: 16 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 16 }}>💎 Plan</h2>
        <div style={{ background: 'linear-gradient(135deg, rgba(190,24,93,0.06), rgba(236,72,153,0.06))', border: '1px solid var(--color-border-strong)', borderRadius: 'var(--radius-lg)', padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div>
              <p style={{ fontWeight: 700, fontSize: 16, fontFamily: 'var(--font-display)' }}>Free Plan</p>
              <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>25 wardrobe items · 3 outfits/day</p>
            </div>
            <span className="badge badge-primary">CURRENT</span>
          </div>
          <button className="btn-primary" style={{ width: '100%', fontSize: 14 }}>Upgrade to Pro — $6.99/mo →</button>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {[
            { name: "Pro", price: "$6.99/mo", features: ["200 items", "Unlimited outfits", "Weekly planner", "Gap analysis"] },
            { name: "Studio", price: "$14.99/mo", features: ["Unlimited items", "Family accounts", "Early sale alerts", "Style AI evolution"] },
          ].map((plan) => (
            <div key={plan.name} style={{ background: 'var(--color-muted)', borderRadius: 'var(--radius-md)', padding: 16, border: '1px solid var(--color-border)' }}>
              <p style={{ fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 15 }}>{plan.name}</p>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>{plan.price}</p>
              <div style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 4 }}>
                {plan.features.map((f) => (
                  <div key={f} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'rgba(5,150,105,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <svg width="8" height="6" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Danger Zone */}
      <section style={{ background: 'var(--color-surface)', borderRadius: 'var(--radius-lg)', padding: 24, marginBottom: 16, border: '1px solid rgba(220,38,38,0.2)' }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-destructive)', marginBottom: 16 }}>⚠️ Danger Zone</h2>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)} style={{ width: '100%', background: 'rgba(220,38,38,0.06)', border: '1px solid rgba(220,38,38,0.2)', color: 'var(--color-destructive)', borderRadius: 'var(--radius-md)', padding: '12px 16px', cursor: 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', transition: 'all 150ms ease' }}>
            Delete All Wardrobe Data
          </button>
        ) : (
          <div>
            <p style={{ fontSize: 14, color: 'var(--color-destructive)', fontFamily: 'var(--font-body)', marginBottom: 12, lineHeight: 1.6 }}>This will permanently delete all your wardrobe items, outfits, and preferences. This cannot be undone.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button onClick={() => setShowDeleteConfirm(false)} className="btn-secondary" style={{ flex: 1 }}>Cancel</button>
              <button onClick={handleDeleteAccount} disabled={deleting} style={{ flex: 1, background: 'var(--color-destructive)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', padding: '12px 16px', cursor: deleting ? 'not-allowed' : 'pointer', fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', opacity: deleting ? 0.6 : 1 }}>{deleting ? "Deleting…" : "Delete Everything"}</button>
            </div>
          </div>
        )}
      </section>

      <div style={{ textAlign: 'center', padding: '32px 0', fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
        <p>Clad v1.0.0 · <a href="/terms" style={{ color: 'var(--color-muted-foreground)' }}>Terms</a> · <a href="/privacy" style={{ color: 'var(--color-muted-foreground)' }}>Privacy</a></p>
      </div>
    </div>
  );
}
