"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import type { WardrobeItem } from "@/lib/types";

const CATEGORIES = [
  { value: "", label: "All", icon: "" },
  { value: "tops", label: "Tops", icon: "👔" },
  { value: "bottoms", label: "Bottoms", icon: "👖" },
  { value: "dresses", label: "Dresses", icon: "👗" },
  { value: "outerwear", label: "Outerwear", icon: "🧥" },
  { value: "footwear", label: "Footwear", icon: "👞" },
  { value: "accessories", label: "Accessories", icon: "👜" },
];

export default function WardrobePage() {
  const router = useRouter();
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
      if (res.ok) { const data = await res.json(); setItems(data.items || []); }
    } catch (err) { console.error("Failed to fetch wardrobe:", err); }
    setLoading(false);
  };

  useEffect(() => { fetchWardrobe(); }, [activeCategory]);
  useEffect(() => { const t = setTimeout(() => fetchWardrobe(), 400); return () => clearTimeout(t); }, [searchQuery]);

  const toggleFavorite = async (id: string) => {
    const item = items.find((i) => i.id === id); if (!item) return;
    await fetch("/api/wardrobe/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_favorite: !item.isFavorite }) });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, isFavorite: !i.isFavorite } : i));
    if (selectedItem?.id === id) setSelectedItem((prev) => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
  };

  const toggleLaundry = async (id: string) => {
    const item = items.find((i) => i.id === id); if (!item) return;
    await fetch("/api/wardrobe/" + id, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_in_laundry: !item.isInLaundry }) });
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, isInLaundry: !i.isInLaundry } : i));
    if (selectedItem?.id === id) setSelectedItem((prev) => prev ? { ...prev, isInLaundry: !prev.isInLaundry } : null);
  };

  const deleteItem = async (id: string) => {
    await fetch("/api/wardrobe/" + id, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const pillStyle = (active: boolean): React.CSSProperties => ({
    padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: 12, fontWeight: 600,
    fontFamily: 'var(--font-body)', cursor: 'pointer', transition: 'all 150ms ease', border: '1px solid',
    whiteSpace: 'nowrap' as const,
    ...(active ? { background: 'var(--color-primary)', color: 'white', borderColor: 'var(--color-primary)' }
      : { background: 'var(--color-muted)', color: 'var(--color-muted-foreground)', borderColor: 'var(--color-border)' }),
  });

  const laundryCount = items.filter((i) => i.isInLaundry).length;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>
      <PageHeader
        title="My Wardrobe"
        description={`${items.length} item${items.length !== 1 ? "s" : ""}${laundryCount > 0 ? ` · ${laundryCount} in laundry` : ""}`}
        action={<button onClick={() => router.push("/upload")} className="btn-primary" style={{ fontSize: 13 }}>+ Add Items</button>}
      />

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 24 }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 200px', maxWidth: 320 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', fontSize: 14 }}>🔍</span>
          <input
            type="text" placeholder="Search by color, type..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input"
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>

        {/* Categories */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', paddingBottom: 2 }}>
          {CATEGORIES.map((cat) => (
            <button key={cat.value} onClick={() => setActiveCategory(cat.value)} style={pillStyle(activeCategory === cat.value)}>
              {cat.icon && <span>{cat.icon} </span>}{cat.label}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div style={{ display: 'flex', gap: 2, background: 'var(--color-muted)', borderRadius: 'var(--radius-md)', padding: 3, marginLeft: 'auto', border: '1px solid var(--color-border)' }}>
          {(["grid", "list"] as const).map((v) => (
            <button key={v} onClick={() => setViewMode(v)} style={{
              padding: '6px 12px', borderRadius: 'var(--radius-sm)', fontSize: 12, fontWeight: 600,
              cursor: 'pointer', transition: 'all 150ms ease', border: 'none',
              ...(viewMode === v ? { background: 'var(--color-primary)', color: 'white' } : { background: 'transparent', color: 'var(--color-muted-foreground)' }),
            }}>
              {v === "grid" ? "▦" : "☰"}
            </button>
          ))}
        </div>
      </div>

      {/* Empty */}
      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <p style={{ fontSize: 48, marginBottom: 16 }}>👕</p>
          <h3 style={{ fontSize: 20, fontWeight: 700, fontFamily: 'var(--font-display)', marginBottom: 8 }}>Your wardrobe is empty</h3>
          <p style={{ fontSize: 14, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', maxWidth: 400, margin: '0 auto 24px' }}>
            Upload photos of your clothing to get started. Our AI will identify each piece automatically.
          </p>
          <button onClick={() => router.push("/upload")} className="btn-primary">Upload Your First Item →</button>
        </div>
      )}

      {/* Loading */}
      {loading && <LoadingSkeleton type="card" rows={5} />}

      {/* Grid View */}
      {!loading && items.length > 0 && viewMode === "grid" && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 16 }}>
          {items.map((item) => (
            <div key={item.id} onClick={() => setSelectedItem(item)} style={{
              borderRadius: 'var(--radius-lg)', overflow: 'hidden', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all 200ms ease',
              opacity: item.isInLaundry ? 0.5 : 1,
            }}>
              <div style={{ aspectRatio: '3/4', position: 'relative', background: 'var(--color-muted)', overflow: 'hidden' }}>
                <img src={item.imageUrl} alt={item.suggestedName || item.itemType} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 300ms ease' }}
                  onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='267'%3E%3Crect fill='%23f3e8ef' width='200' height='267'/%3E%3Ctext x='100' y='130' fill='%23999' text-anchor='middle' dominant-baseline='middle' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E"; }}
                />
                {/* Badges */}
                <div style={{ position: 'absolute', top: 6, left: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                  {item.isFavorite && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-secondary)', color: 'white', fontWeight: 700 }}>♥ Fav</span>}
                  {item.isInLaundry && <span style={{ fontSize: 9, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: '#2563EB', color: 'white', fontWeight: 700 }}>🧺 Laundry</span>}
                </div>
              </div>
              <div style={{ padding: 10 }}>
                <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.suggestedName || item.itemType}</p>
                <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'rgba(190,24,93,0.06)', fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>{item.itemType}</span>
                  <span style={{ fontSize: 10, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>{item.primaryColor}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {!loading && items.length > 0 && viewMode === "list" && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map((item) => (
            <div key={item.id} onClick={() => setSelectedItem(item)} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '12px 16px',
              borderRadius: 'var(--radius-md)', background: 'var(--color-surface)',
              border: '1px solid var(--color-border)', cursor: 'pointer', transition: 'all 150ms ease',
            }}>
              <img src={item.imageUrl} alt="" style={{ width: 48, height: 48, objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                onError={(e) => { (e.target as HTMLImageElement).src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48'%3E%3Crect fill='%23f3e8ef' width='48' height='48'/%3E%3C/svg%3E"; }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-body)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.suggestedName || item.itemType}</p>
                <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
                  {item.primaryColor}{item.secondaryColor ? " / " + item.secondaryColor : ""} · {item.pattern} · {item.wearCount}× worn
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 10, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(190,24,93,0.06)', fontWeight: 600, color: 'var(--color-primary)', fontFamily: 'var(--font-body)' }}>{item.category}</span>
                <button onClick={(e) => { e.stopPropagation(); toggleFavorite(item.id); }} style={{ fontSize: 16, background: 'none', border: 'none', cursor: 'pointer', color: item.isFavorite ? 'var(--color-secondary)' : 'var(--color-muted-foreground)' }}>
                  {item.isFavorite ? "❤️" : "🤍"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selectedItem && (
        <div onClick={() => setSelectedItem(null)} style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--color-bg)', borderRadius: 'var(--radius-xl)', maxWidth: 720, width: '100%', maxHeight: '90vh', overflow: 'auto', border: '1px solid var(--color-border)', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--color-border)' }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{selectedItem.suggestedName || selectedItem.itemType}</h2>
                <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', marginTop: 2 }}>Added {new Date(selectedItem.createdAt).toLocaleDateString()}</p>
              </div>
              <button onClick={() => setSelectedItem(null)} style={{ width: 32, height: 32, borderRadius: 'var(--radius-md)', background: 'var(--color-muted)', border: '1px solid var(--color-border)', cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-muted-foreground)' }}>×</button>
            </div>

            {/* Content */}
            <div style={{ padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Image */}
              <img src={selectedItem.imageUrl} alt="" style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', borderRadius: 'var(--radius-lg)', border: '1px solid var(--color-border)' }} />

              {/* Details */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>AI Analysis</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    {[
                      { label: "Type", value: selectedItem.itemType },
                      { label: "Color(s)", value: selectedItem.primaryColor + (selectedItem.secondaryColor ? " / " + selectedItem.secondaryColor : "") },
                      { label: "Pattern", value: selectedItem.pattern },
                      { label: "Material", value: selectedItem.material || "Unknown" },
                      { label: "Formality", value: ["", "Home/Athleisure", "Casual", "Smart Casual", "Business/Formal", "Black Tie"][selectedItem.formalityLevel] },
                      { label: "Confidence", value: Math.round(selectedItem.aiConfidence * 100) + "%" },
                    ].map((f) => (
                      <div key={f.label} style={{ background: 'var(--color-muted)', borderRadius: 'var(--radius-md)', padding: '10px 12px', border: '1px solid var(--color-border)' }}>
                        <p style={{ fontSize: 10, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', marginBottom: 2 }}>{f.label}</p>
                        <p style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)', textTransform: 'capitalize' }}>{f.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Occasions & Seasons */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {selectedItem.occasions.map((occ) => (
                    <span key={occ} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(5,150,105,0.06)', fontWeight: 600, color: 'var(--color-success)', fontFamily: 'var(--font-body)' }}>{occ}</span>
                  ))}
                  {selectedItem.seasons.map((s) => (
                    <span key={s} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 'var(--radius-full)', background: 'rgba(217,119,6,0.06)', fontWeight: 600, color: 'var(--color-accent)', fontFamily: 'var(--font-body)' }}>{s}</span>
                  ))}
                </div>

                {/* Tags */}
                {selectedItem.tags?.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                    {selectedItem.tags.map((tag) => (
                      <span key={tag} style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--radius-full)', background: 'var(--color-muted)', color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)', border: '1px solid var(--color-border)' }}>#{tag}</span>
                    ))}
                  </div>
                )}

                {/* Details */}
                {(selectedItem.brand || selectedItem.size || selectedItem.priceUsd) && (
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: 12 }}>
                    {selectedItem.brand && <p style={{ fontSize: 13, fontFamily: 'var(--font-body)' }}><span style={{ color: 'var(--color-muted-foreground)' }}>Brand:</span> {selectedItem.brand}</p>}
                    {selectedItem.size && <p style={{ fontSize: 13, fontFamily: 'var(--font-body)' }}><span style={{ color: 'var(--color-muted-foreground)' }}>Size:</span> {selectedItem.size}</p>}
                    {selectedItem.priceUsd && <p style={{ fontSize: 13, fontFamily: 'var(--font-body)' }}><span style={{ color: 'var(--color-muted-foreground)' }}>Price:</span> ${selectedItem.priceUsd}</p>}
                  </div>
                )}

                <p style={{ fontSize: 12, color: 'var(--color-muted-foreground)', fontFamily: 'var(--font-body)' }}>
                  Worn {selectedItem.wearCount}×{selectedItem.lastWornAt ? " · Last worn " + new Date(selectedItem.lastWornAt).toLocaleDateString() : ""}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', borderTop: '1px solid var(--color-border)' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggleFavorite(selectedItem.id)} style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: 'pointer', border: '1px solid',
                  ...(selectedItem.isFavorite
                    ? { background: 'rgba(236,72,153,0.06)', borderColor: 'var(--color-secondary)', color: 'var(--color-secondary)' }
                    : { background: 'var(--color-muted)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }),
                }}>
                  {selectedItem.isFavorite ? "❤️ Favorited" : "🤍 Favorite"}
                </button>
                <button onClick={() => toggleLaundry(selectedItem.id)} style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-md)', fontSize: 13, fontWeight: 600,
                  fontFamily: 'var(--font-body)', cursor: 'pointer', border: '1px solid',
                  ...(selectedItem.isInLaundry
                    ? { background: 'rgba(37,99,235,0.06)', borderColor: '#2563EB', color: '#2563EB' }
                    : { background: 'var(--color-muted)', borderColor: 'var(--color-border)', color: 'var(--color-foreground)' }),
                }}>
                  {selectedItem.isInLaundry ? "🧺 In Laundry" : "🧺 Add to Laundry"}
                </button>
              </div>
              <button onClick={() => deleteItem(selectedItem.id)} style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-destructive)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
