export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-28 animate-pulse rounded bg-gray-200" />

      {/* Stats bar */}
      <div className="mb-6 grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-lg bg-gray-100 p-4">
            <div className="mb-1 h-3 w-16 rounded bg-gray-200" />
            <div className="h-6 w-12 rounded bg-gray-200" />
          </div>
        ))}
      </div>

      {/* Table skeleton */}
      <div className="overflow-hidden rounded-xl bg-gray-100">
        {/* Header */}
        <div className="grid grid-cols-5 gap-4 border-b border-gray-200 bg-gray-200/60 px-4 py-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-4 w-16 rounded bg-gray-300" />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className={`grid grid-cols-5 gap-4 px-4 py-3 ${i % 2 === 0 ? '' : 'bg-white'}`}
          >
            {Array.from({ length: 5 }).map((_, j) => (
              <div key={j} className="h-4 animate-pulse rounded bg-gray-200" style={{ width: `${70 + Math.random() * 30}%` }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
