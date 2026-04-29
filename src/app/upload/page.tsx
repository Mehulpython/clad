"use client";

import { useState, useCallback, useRef } from "react";
import { Upload, X, Sparkles, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

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
  const [items, setItems] = useState<UploadedItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files) return;

    const newItems: UploadedItem[] = Array.from(files)
      .filter((f) => f.type.startsWith("image/"))
      .slice(0, 20) // max 20 at a time
      .map((file) => ({
        id: crypto.randomUUID(),
        file,
        preview: URL.createObjectURL(file),
        status: "uploading" as const,
      }));

    setItems((prev) => [...prev, ...newItems]);
  }, []);

  // Auto-upload and analyze each item
  const processItem = async (item: UploadedItem): Promise<void> => {
    setItems((prev) =>
      prev.map((i) =>
        i.id === item.id ? { ...i, status: "analyzing" as const } : i
      )
    );

    try {
      const formData = new FormData();
      formData.append("file", item.file);

      const res = await fetch("/api/wardrobe/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);

      const data = await res.json();

      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "done" as const,
                analysis: data.aiAnalysis,
              }
            : i
        )
      );
    } catch (err) {
      setItems((prev) =>
        prev.map((i) =>
          i.id === item.id
            ? {
                ...i,
                status: "error" as const,
                error: err instanceof Error ? err.message : "Failed to analyze",
              }
            : i
        )
      );
    }
  };

  // Process all items when they're added
  const startProcessing = async () => {
    setIsProcessing(true);
    for (const item of items.filter((i) => i.status === "uploading")) {
      await processItem(item);
    }
    setIsProcessing(false);
  };

  // Auto-start processing when items are added
  useState(() => {
    if (items.length > 0 && items.some((i) => i.status === "uploading")) {
      startProcessing();
    }
  });

  // Re-trigger processing when new items are added
  const prevCountRef = useRef(0);
  if (items.length > prevCountRef.current && items.some((i) => i.status === "uploading")) {
    prevCountRef.current = items.length;
    setTimeout(() => startProcessing(), 100);
  }

  const removeItem = (id: string) => {
    setItems((prev) => {
      const item = prev.find((i) => i.id === id);
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((i) => i.id !== id);
    });
  };

  const doneCount = items.filter((i) => i.status === "done").length;
  const errorCount = items.filter((i) => i.status === "error").length;

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Build Your Wardrobe</h1>
          <p className="text-gray-400">
            Upload photos of your clothing. AI will identify and categorize each piece.
          </p>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragging
              ? "border-purple-500 bg-purple-500/10 scale-[1.01]"
              : "border-white/10 hover:border-purple-500/30 bg-white/[0.02]"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-500" />
          <p className="text-lg font-medium text-gray-300 mb-1">
            Drop images here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            JPEG, PNG, WebP · Up to 20 photos · Max 10MB each
          </p>
        </div>

        {/* Items grid */}
        {items.length > 0 && (
          <div className="mt-8 space-y-6">
            {/* Progress bar */}
            {(isProcessing || doneCount + errorCount < items.length) && (
              <div className="flex items-center gap-3 text-sm text-gray-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  Analyzing {doneCount}/{items.length} items...
                  {errorCount > 0 && ` (${errorCount} errors)`}
                </span>
              </div>
            )}

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="glass-card overflow-hidden group relative"
                >
                  {/* Image */}
                  <div className="aspect-[3/4] relative bg-black/30">
                    <img
                      src={item.preview}
                      alt=""
                      className="w-full h-full object-cover"
                    />

                    {/* Status overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                      {item.status === "analyzing" && (
                        <div className="flex flex-col items-center gap-2">
                          <Sparkles className="w-8 h-8 text-purple-400 animate-pulse" />
                          <span className="text-xs text-purple-300">Analyzing...</span>
                        </div>
                      )}
                      {item.status === "done" && (
                        <div className="flex flex-col items-center gap-1">
                          <CheckCircle2 className="w-8 h-8 text-green-400" />
                          <span className="text-xs text-green-300">Done!</span>
                        </div>
                      )}
                      {item.status === "error" && (
                        <div className="flex flex-col items-center gap-1">
                          <AlertCircle className="w-8 h-8 text-red-400" />
                          <span className="text-xs text-red-300">Error</span>
                        </div>
                      )}
                    </div>

                    {/* Remove button */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Analysis result */}
                  {item.analysis && (
                    <div className="p-3">
                      <p className="font-medium text-sm truncate">{item.analysis.suggestedName}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300">
                          {item.analysis.itemType}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-300">
                          {item.analysis.primaryColor}
                        </span>
                        <span className="text-xs text-gray-500">
                          {Math.round(item.analysis.confidence * 100)}% confident
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-gray-400">
                {doneCount} of {items.length} analyzed
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setItems([])}
                  className="btn-secondary text-sm"
                >
                  Clear All
                </button>
                <a
                  href="/wardrobe"
                  className={`btn-primary text-sm ${doneCount === 0 ? "pointer-events-none opacity-50" : ""}`}
                >
                  View Wardrobe →
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
