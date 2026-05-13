export default function GapAnalysisLoading() {
  const categories = ['Tops', 'Bottoms', 'Outerwear', 'Footwear', 'Accessories'];
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-52 animate-pulse rounded bg-gray-200" />
      <div className="space-y-3">
        {categories.map((cat, i) => (
          <div
            key={cat}
            className="flex animate-pulse items-center gap-4 rounded-xl bg-gray-100 p-4"
          >
            {/* Category label + progress bar */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-12 rounded bg-gray-200" />
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
                <div
                  className="h-full rounded-full bg-rose-200"
                  style={{ width: `${Math.max(15, 90 - i * 18)}%` }}
                />
              </div>
            </div>
            {/* Count badge */}
            <div className="h-8 w-12 shrink-0 rounded-full bg-gray-200" />
          </div>
        ))}
      </div>
    </div>
  );
}
