"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PageHeader from "@/components/ui/PageHeader";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";

interface ShopProduct {
  id: string;
  platform: string;
  productName: string;
  productUrl: string;
  productImageUrl: string;
  priceUsd: number;
  priceRange: string;
  category: "tops" | "bottoms" | "outerwear" | "footwear" | "accessories";
  reason: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  tops: "Tops",
  bottoms: "Bottoms",
  outerwear: "Outerwear",
  footwear: "Footwear",
  accessories: "Accessories",
};

/** Soft gradient colours per category for placeholder images */
const CATEGORY_GRADIENTS: Record<string, string> = {
  tops: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
  bottoms: "linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)",
  outerwear: "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)",
  footwear: "linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%)",
  accessories: "linear-gradient(135deg, #d1fae5 0#, #a7f3d0 100%)",
};

const CATEGORY_EMOJIS: Record<string, string> = {
  tops: "👕",
  bottoms: "👖",
  outerwear: "🧥",
  footwear: "👟",
  accessories: "🎀",
};

const TAB_ORDER = ["all", "tops", "bottoms", "outerwear", "footwear", "accessories"] as const;

function ShopPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [category, setCategory] = useState<string>("all");

  // Read initial category from URL (?category=tops)
  useEffect(() => {
    const fromUrl = searchParams.get("category");
    if (fromUrl && TAB_ORDER.includes(fromUrl as typeof TAB_ORDER[number])) {
      setCategory(fromUrl);
    }
  }, [searchParams]);

  // Fetch products for selected category
  useEffect(() => {
    setLoading(true);
    const query = category === "all" ? "" : `?category=${category}`;
    fetch(`/api/shop${query}`)
      .then((r) => r.json())
      .then((data) => {
        setProducts(data.products || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [category]);

  function handleCategoryChange(cat: string) {
    setCategory(cat);
    // Update URL so gap-analysis links work
    const params = new URLSearchParams(window.location.search);
    if (cat === "all") {
      params.delete("category");
    } else {
      params.set("category", cat);
    }
    router.replace(`/shop${params.toString() ? `?${params}` : ""}`, { scroll: false });
  }

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "40px 24px" }}>
      <PageHeader
        title="Shop Suggestions"
        description="AI-curated items to fill wardrobe gaps"
        badge="Coming Soon"
      />

      {/* ── Honesty Banner ─────────────────────────────── */}
      <div
        style={{
          background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 50%, #fef3c7 100%)",
          borderRadius: "var(--radius-lg)",
          padding: "20px 24px",
          marginBottom: 28,
          border: "1px solid #fdba74",
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#9a3412",
            fontFamily: "var(--font-display)",
            marginBottom: 6,
          }}
        >
          ✨ Coming Soon — AI-Curated Suggestions
        </p>
        <p
          style={{
            fontSize: 13,
            color: "#9a3412",
            fontFamily: "var(--font-body)",
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          We don&apos;t have a real store yet. These are AI-suggested items based on common
          wardrobe gaps. Click &quot;Search on Google&quot; to compare real prices across retailers.
          A full shop with affiliate links is on our roadmap!
        </p>
      </div>

      {/* ── Category Filter Tabs ───────────────────────── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {TAB_ORDER.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryChange(cat)}
            style={{
              padding: "6px 18px",
              borderRadius: "var(--radius-full)",
              fontSize: 12,
              fontWeight: 600,
              fontFamily: "var(--font-body)",
              cursor: "pointer",
              transition: "all 150ms ease",
              border: "1px solid",
              textTransform: "capitalize",
              ...(cat === category
                ? {
                    background: "var(--color-primary)",
                    color: "white",
                    borderColor: "var(--color-primary)",
                  }
                : {
                    background: "var(--color-muted)",
                    color: "var(--color-muted-foreground)",
                    borderColor: "var(--color-border)",
                  }),
            }}
          >
            {CATEGORY_EMOJIS[cat] ? `${CATEGORY_EMOJIS[cat]} ` : ""}
            {CATEGORY_LABELS[cat] ?? cat}
          </button>
        ))}
      </div>

      {loading && <LoadingSkeleton type="card" rows={4} />}

      {/* ── Empty State ─────────────────────────────────── */}
      {!loading && products.length === 0 && (
        <div style={{ textAlign: "center", padding: "64px 24px" }}>
          <p style={{ fontSize: 40, marginBottom: 12 }}>🔍</p>
          <h3
            style={{
              fontSize: 18,
              fontWeight: 700,
              fontFamily: "var(--font-display)",
              marginBottom: 8,
            }}
          >
            No items in this category
          </h3>
          <p
            style={{
              fontSize: 14,
              color: "var(--color-muted-foreground)",
              fontFamily: "var(--font-body)",
              marginBottom: 24,
            }}
          >
            Try selecting a different category, or check back later as we expand our suggestions.
          </p>
          <button
            onClick={() => handleCategoryChange("all")}
            className="btn-primary"
          >
            View All Items
          </button>
        </div>
      )}

      {/* ── Product Grid ───────────────────────────────── */}
      {!loading && products.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
            gap: 16,
          }}
        >
          {products.map((item) => (
            <div key={item.id} className="card" style={{ padding: 20 }}>
              {/* Gradient image placeholder */}
              <div
                style={{
                  height: 120,
                  borderRadius: "var(--radius-md)",
                  background:
                    CATEGORY_GRADIENTS[item.category] ??
                    "linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%)",
                  marginBottom: 14,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "1px solid var(--color-border)",
                  fontSize: 36,
                }}
              >
                {CATEGORY_EMOJIS[item.category] ?? "🛍️"}
              </div>

              {/* Category badge + Name */}
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: 0.05,
                    color: "white",
                    background: "var(--color-primary)",
                    padding: "2px 8px",
                    borderRadius: "var(--radius-full)",
                    fontFamily: "var(--font-body)",
                  }}
                >
                  {item.category}
                </span>
              </div>

              <h4
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  fontFamily: "var(--font-display)",
                  marginBottom: 4,
                  lineHeight: 1.3,
                }}
              >
                {item.productName}
              </h4>

              {/* Price range */}
              <p
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "var(--color-primary)",
                  fontFamily: "var(--font-body)",
                  marginBottom: 8,
                }}
              >
                {item.priceRange}
              </p>

              {/* AI Reason */}
              <div
                style={{
                  background: "var(--color-muted)",
                  borderRadius: "var(--radius-md)",
                  padding: "10px 12px",
                  border: "1px solid var(--color-border)",
                  marginBottom: 14,
                }}
              >
                <p
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--color-primary)",
                    fontFamily: "var(--font-body)",
                    marginBottom: 4,
                  }}
                >
                  💡 Why this item?
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--color-muted-foreground)",
                    fontFamily: "var(--font-body)",
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  {item.reason}
                </p>
              </div>

              {/* Search on Google button */}
              <a
                href={item.productUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: 13,
                  textDecoration: "none",
                }}
              >
                🔍 Search on Google
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <ShopPageContent />
    </Suspense>
  );
}