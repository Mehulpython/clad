"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Heart,
  ShirtIcon as Laundry,
  Grid3X3,
  List,
  Shirt,
  X,
  Filter,
} from "lucide-react";
import type { WardrobeItem } from "@/lib/types";

const CATEGORIES = [
  { value: "", label: "All", icon: null },
  { value: "tops", label: "Tops", icon: "\uD83D\uDC55" },
  { value: "bottoms", label: "Bottoms", icon: "\uD83D\uDC56" },
  { value: "dresses", label: "Dresses", icon: "\uD83D\uDC57" },
  { value: "outerwear", label: "Outerwear", icon: "\uD83E\uDDE5" },
  { value: "footwear", label: "Footwear", icon: "\uD83D\uDC5F" },
  { value: "accessories", label: "Accessories", icon: "\uD83D\uDC5C" },
];

export default function WardrobePage() {
  const [items, setItems] = useState<WardrobeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("");
  const [selectedItem, setSelectedItem] = useState<WardrobeItem | null>(null);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const fetchWardrobe = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory) params.set("category", activeCategory);
      if (searchQuery) params.set("color", searchQuery);

      const res = await fetch("/api/wardrobe?" + params.toString());
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch (err) {
      console.error("Failed to fetch wardrobe:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWardrobe();
  }, [activeCategory]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) fetchWardrobe();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const toggleFavorite = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    await fetch("/api/wardrobe/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_favorite: !item.isFavorite }),
    });

    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, isFavorite: !i.isFavorite } : i
      )
    );
  };

  const toggleLaundry = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    await fetch("/api/wardrobe/" + id, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ is_in_laundry: !item.isInLaundry }),
    });

    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, isInLaundry: !i.isInLaundry } : i
      )
    );
  };

  const deleteItem = async (id: string) => {
    await fetch("/api/wardrobe/" + id, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  return (
    <main className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Wardrobe</h1>
            <p className="text-gray-400 text-sm mt-1">
              {items.length} item{items.length !== 1 ? "s" : ""}
              {items.filter((i) => i.isInLaundry).length > 0
                ? " \u00b7 " + items.filter((i) => i.isInLaundry).length + " in laundry"
                : ""}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a href="/upload" className="btn-primary text-sm py-2.5">
              + Add Items
            </a>
          </div>
        </div>

        {/* Filters bar */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search by color, type..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 text-sm focus:border-purple-500/50 focus:outline-none transition-colors"
            />
          </div>

          {/* Category pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                onClick={() => setActiveCategory(cat.value)}
                className={
                  "px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all " +
                  (activeCategory === cat.value
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]")
                }
              >
                {cat.icon && <span className="mr-1">{cat.icon}</span>}
                {cat.label}
              </button>
            ))}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-0.5 bg-white/[0.04] rounded-lg p-0.5 ml-auto">
            <button
              onClick={() => setViewMode("grid")}
              className={
                "p-1.5 rounded " +
                (viewMode === "grid"
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-gray-500")
              }
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={
                "p-1.5 rounded " +
                (viewMode === "list"
                  ? "bg-purple-500/20 text-purple-300"
                  : "text-gray-500")
              }
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Empty state */}
        {!loading && items.length === 0 && (
          <div className="text-center py-24">
            <Shirt className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h2 className="text-xl font-semibold mb-2">Your wardrobe is empty</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              Upload photos of your clothing to get started. Our AI will identify each piece automatically.
            </p>
            <a href="/upload" className="btn-primary">
              Upload Your First Item &rarr;
            </a>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="glass-card animate-pulse">
                <div className="aspect-[3/4] bg-white/5" />
                <div className="p-3 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4" />
                  <div className="h-3 bg-white/5 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Items grid */}
        {!loading && items.length > 0 && viewMode === "grid" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className={
                  "glass-card overflow-hidden cursor-pointer group hover:border-purple-500/30 transition-all duration-200 " +
                  (item.isInLaundry ? "opacity-50" : "")
                }
              >
                {/* Image */}
                <div className="aspect-[3/4] relative bg-black/30 overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.suggestedName || item.itemType}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='267'%3E%3Crect fill='%231a1a25' width='200' height='267'/%3E%3Ctext x='100' y='130' fill='%23666' text-anchor='middle' dominant-baseline='middle' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";
                    }}
                  />

                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {item.isFavorite && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-pink-500/80 text-white">
                        \u2665 Favorite
                      </span>
                    )}
                    {item.isInLaundry && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-500/80 text-white">
                        \uD83E\uDDFA Laundry
                      </span>
                    )}
                  </div>

                  {/* Quick actions on hover */}
                  <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(item.id);
                      }}
                      className={
                        "w-7 h-7 rounded-full flex items-center justify-center " +
                        (item.isFavorite
                          ? "bg-pink-500 text-white"
                          : "bg-black/60 text-white")
                      }
                    >
                      <Heart
                        className={
                          "w-3.5 h-3.5 " +
                          (item.isFavorite ? "fill-current" : "")
                        }
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLaundry(item.id);
                      }}
                      className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center"
                    >
                      <Laundry className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="font-medium text-sm truncate">
                    {item.suggestedName || item.itemType}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                    <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-300">
                      {item.itemType}
                    </span>
                    <span className="text-[11px] text-gray-500">
                      {item.primaryColor}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Items list view */}
        {!loading && items.length > 0 && viewMode === "list" && (
          <div className="space-y-2">
            {items.map((item) => (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="glass-card p-3 flex items-center gap-4 cursor-pointer hover:border-purple-500/30 transition-colors"
              >
                <img
                  src={item.imageUrl}
                  alt=""
                  className="w-14 h-14 object-cover rounded-lg"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect fill='%231a1a25' width='56' height='56'/%3E%3C/text%3E%3C/svg%3E";
                  }}
                />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {item.suggestedName || item.itemType}
                  </p>
                  <p className="text-xs text-gray-400">
                    {item.primaryColor}
                    {item.secondaryColor ? " / " + item.secondaryColor : ""} \u00b7{" "}
                    {item.pattern} \u00b7 {item.wearCount}x worn
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-300">
                    {item.category}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(item.id);
                    }}
                    className={
                      "p-1.5 rounded " +
                      (item.isFavorite ? "text-pink-400" : "text-gray-500")
                    }
                  >
                    <Heart
                      className={
                        "w-4 h-4 " +
                        (item.isFavorite ? "fill-current" : "")
                      }
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detail modal */}
        {selectedItem && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setSelectedItem(null)}
          >
            <div
              className="glass-card max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-start justify-between p-4 border-b border-white/5">
                <div>
                  <h2 className="text-lg font-semibold">
                    {selectedItem.suggestedName || selectedItem.itemType}
                  </h2>
                  <p className="text-sm text-gray-400 mt-0.5">
                    Added {new Date(selectedItem.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-4 grid md:grid-cols-2 gap-6">
                {/* Image */}
                <img
                  src={selectedItem.imageUrl}
                  alt=""
                  className="w-full aspect-[3/4] object-cover rounded-xl"
                />

                {/* Details */}
                <div className="space-y-4">
                  {/* AI Tags */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                      AI Analysis
                    </h3>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="bg-white/[0.03] rounded-lg p-2.5">
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-medium capitalize">{selectedItem.itemType}</p>
                      </div>
                      <div className="bg-white/[0.03] rounded-lg p-2.5">
                        <p className="text-xs text-gray-500">Color(s)</p>
                        <p className="font-medium capitalize">
                          {selectedItem.primaryColor}
                          {selectedItem.secondaryColor
                            ? " / " + selectedItem.secondaryColor
                            : ""}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] rounded-lg p-2.5">
                        <p className="text-xs text-gray-500">Pattern</p>
                        <p className="font-medium capitalize">{selectedItem.pattern}</p>
                      </div>
                      <div className="bg-white/[0.03] rounded-lg p-2.5">
                        <p className="text-xs text-gray-500">Material</p>
                        <p className="font-medium capitalize">
                          {selectedItem.material || "Unknown"}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] rounded-lg p-2.5">
                        <p className="text-xs text-gray-500">Formality</p>
                        <p className="font-medium">
                          {[
                            "",
                            "Home/Athleisure",
                            "Casual",
                            "Smart Casual",
                            "Business/Formal",
                            "Black Tie",
                          ][selectedItem.formalityLevel]}
                        </p>
                      </div>
                      <div className="bg-white/[0.03] rounded-lg p-2.5">
                        <p className="text-xs text-gray-500">Confidence</p>
                        <p className="font-medium">
                          {Math.round(selectedItem.aiConfidence * 100)}%
                        </p>
                      </div>
                    </div>

                    {/* Occasions & Seasons */}
                    <div className="flex flex-wrap gap-1.5">
                      {selectedItem.occasions.map((occ) => (
                        <span
                          key={occ}
                          className="text-xs px-2 py-0.5 rounded-full bg-green-500/15 text-green-300"
                        >
                          {occ}
                        </span>
                      ))}
                      {selectedItem.seasons.map((s) => (
                        <span
                          key={s}
                          className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/15 text-yellow-300"
                        >
                          {s}
                        </span>
                      ))}
                    </div>

                    {/* Tags */}
                    {selectedItem.tags?.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {selectedItem.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-[11px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* User info */}
                  {(selectedItem.brand || selectedItem.size || selectedItem.priceUsd) && (
                    <div className="space-y-2 pt-3 border-t border-white/5">
                      <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">
                        Details
                      </h3>
                      {selectedItem.brand && (
                        <p className="text-sm">
                          <span className="text-gray-500">Brand:</span> {selectedItem.brand}
                        </p>
                      )}
                      {selectedItem.size && (
                        <p className="text-sm">
                          <span className="text-gray-500">Size:</span> {selectedItem.size}
                        </p>
                      )}
                      {selectedItem.priceUsd && (
                        <p className="text-sm">
                          <span className="text-gray-500">Price:</span> ${selectedItem.priceUsd}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stats */}
                  <div className="pt-3 border-t border-white/5">
                    <p className="text-xs text-gray-500">
                      Worn {selectedItem.wearCount} time
                      {selectedItem.wearCount !== 1 ? "s" : ""}
                      {selectedItem.lastWornAt
                        ? " \u00b7 Last worn " +
                          new Date(selectedItem.lastWornAt).toLocaleDateString()
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 border-t border-white/5 flex items-center justify-between">
                <div className="flex gap-2">
                  <button
                    onClick={() => toggleFavorite(selectedItem.id)}
                    className={
                      "btn-secondary text-sm " +
                      (selectedItem.isFavorite
                        ? "!border-pink-500 !text-pink-400"
                        : "")
                    }
                  >
                    {selectedItem.isFavorite ? "\u2665 Favorited" : "\u2661 Favorite"}
                  </button>
                  <button
                    onClick={() => toggleLaundry(selectedItem.id)}
                    className={
                      "btn-secondary text-sm " +
                      (selectedItem.isInLaundry
                        ? "!border-blue-500 !text-blue-400"
                        : "")
                    }
                  >
                    {selectedItem.isInLaundry
                      ? "\uD83E\uDDFA In Laundry"
                      : "\uD83E\uDDFA Add to Laundry"}
                  </button>
                </div>
                <button
                  onClick={() => deleteItem(selectedItem.id)}
                  className="text-sm text-red-400 hover:text-red-300 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
