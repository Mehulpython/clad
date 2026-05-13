export default function StatsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-44 animate-pulse rounded bg-gray-200" />
      {/* Stat cards grid */}
      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-gray-100 p-5">
            <div className="mb-2 h-3 w-20 rounded bg-gray-200" />
            <div className="mb-1 h-7 w-16 rounded bg-gray-200" />
            <div className="h-3 w-24 rounded bg-gray-200" />
          </div>
        ))}
      </div>
      {/* Chart area skeleton */}
      <div className="animate-pulse rounded-xl bg-gray-100 p-5">
        <div className="mb-4 h-5 w-32 rounded bg-gray-200" />
        <div className="flex items-end gap-2">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="h-24 flex-1 rounded-t bg-gray-200"
              style={{ height: `${Math.max(20, Math.random() * 100)}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
