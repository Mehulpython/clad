"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";

interface UploadedItem {
  id: string;
  file: File;
  preview: string;
  status: "uploading" | "analyzing" | "done" | "error";
  analysis?: {
    itemType: string;
    primaryColor: string;
    pattern: string;
    suggestedName: string;
    confidence: number;
  };
  error?: string;
}

export default function UploadPage() {
  const router = useRouter();
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevCountRef = useRef(0);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;
    const newItems: UploadedItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 20)
      .map((file) => ({ id: crypto.randomUUID(), file, preview: URL.createObjectURL(file), status: "uploading" as const }));
    setItems((prev) => [...prev, ...newItems]);
  }, []);

  const processItem = async (item: UploadedItem) => {
    setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "analyzing" as const } : i));
    try {
      const formData = new FormData();
      formData.append("file", item.file);
      const res = await fetch("/api/wardrobe/upload", { method: "POST", body: formData });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "done" as const, analysis: data.aiAnalysis } : i));
    } catch (err) {
      setItems((prev) => prev.map((i) => i.id === item.id ? { ...i, status: "error" as const, error: err instanceof Error ? err.message : "Failed" } : i));
    }
  };

  const startProcessing = async () => {
    setIsProcessing(true);
    for (const item of items.filter((i) => i.status === "uploading")) await processItem(item);
    setIsProcessing(false);
  };

  if (items.length > prevCountRef.current && items.some((i) => i.status === "uploading")) {
    prevCountRef.current = items.length;
    setTimeout(() => startProcessing(), 100);
  }

  const removeItem = (id: string) => {
    setItems((prev) => { const item = prev.find((i) => i.id === id); if (item?.preview) URL.revokeObjectURL(item.preview); return prev.filter((i) => i.id !== id); });
  };

  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  const statusConfig = {
    uploading: { icon: "⏳", label: "Queued", color: "var(--color-muted-foreground)" },
    analyzing: { icon: "✨", label: "Analyzing...", color: "var(--color-primary)" },
    done: { icon: "✅", label: "Done!", color: "var(--color-success)" },
    error: { icon: "❌", label: "Error", color: "var(--color-destructive)" },
  };

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="Build Your Wardrobe"
        description="Upload photos of your clothing. AI will identify and categorize each piece."
        badge="Upload"
      />

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFiles(e.dataTransfer.files); }}
        onClick={() => fileInputRef.current?.click()}
        style={{
          borderRadius: 'var(--radius-xl)',
          padding: '56px 24px',
          border: `2px dashed ${isDragging ? 'var(--color-primary)' : 'var(--color-border-strong)'}`,
          background: isDragging ? 'rgba(190,24,93,0.04)' : 'var(--color-muted)',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 200ms ease',
        }}
      >
        <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={(e) => handleFiles(e.target.files)} />
        <p style={{ fontSize: 40, marginBottom: 16 }}>📸</p>
        <p style={{ fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-body)', marginBottom: 6 }}>Drop images here or click to browse</p>
        <p style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>JPEG, PNG, WebP · Up to 20 photos · Max 10MB each</p>
      </div>

      {/* Items Grid */}
      {items.length > 0 && (
        <div style={{ marginTop: 32 }}>
          {/* Progress */}
          {(isProcessing || doneCount + errorCount < items.length) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <div style={{ width: 16, height: 16, border: '2px solid var(--color-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
              <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
                Analyzing {doneCount}/{items.length} items...{errorCount > 0 ? ` (${errorCount} errors)` : ""}
              </span>
            </div>
          )}

          {/* Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
            {items.map((item) => {
              const sc = statusConfig[item.status];
              return (
                <div key={item.id} style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-surface)', border: '1px solid var(--color-border)', position: 'relative' }}>
                  <div style={{ aspectRatio: '3/4', position: 'relative', background: 'var(--color-muted)' }}>
                    <img src={item.preview} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {/* Status Overlay */}
                    {item.status !== "uploading" && (
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 4, background: 'rgba(0,0,0,0.4)' }}>
                        <span style={{ fontSize: 24 }}>{sc.icon}</span>
                        <span style={{ fontSize: 11, color: sc.color, fontWeight: 600, fontFamily: 'var(--font-body)' }}>{sc.label}</span>
                      </div>
                    )}
                    {/* Remove */}
                    <button onClick={(e) => { e.stopPropagation(); removeItem(item.id); }} style={{ position: 'absolute', top: 6, right: 6, width: 24, height: 24, borderRadius: '50%', background: 'rgba(0,0,0,0.5)', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, color: 'white' }}>×</button>
                  </div>
                  {/* Analysis */}
                  {item.analysis && (
                    <div style={{ padding: 10 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.analysis.suggestedName}</p>
                      <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(190,24,93,0.06)', fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>{item.analysis.itemType}</span>
                        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(37,99,235,0.06)', fontWeight: 600, color: '#2563EB', fontFamily: 'var(--font-body)' }}>{item.analysis.primaryColor}</span>
                      </div>
                      <p style={{ fontSize: 10, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', marginTop: 4 }}>{Math.round(item.analysis.confidence * 100)}% confident</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 }}>
            <span style={{ fontSize: 13, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>{doneCount} of {items.length} analyzed</span>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setItems([])} className="btn-secondary" style={{ fontSize: 13 }}>Clear All</button>
              <button onClick={() => router.push("/wardrobe")} disabled={doneCount === 0} className="btn-primary" style={{ fontSize: 13, opacity: doneCount === 0 ? 0.5 : 1 }}>View Wardrobe →</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
