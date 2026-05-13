export default function ShopLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-32 animate-pulse rounded bg-gray-200" />
      {/* Filter bar */}
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-9 w-20 shrink-0 animate-pulse rounded-full bg-gray-100" />
        ))}
      </div>
      {/* Product grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-gray-100">
            <div className="aspect-square rounded-t-xl bg-gray-200" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-4/5 rounded bg-gray-200" />
              <div className="h-3 w-1/3 rounded bg-gray-200" />
              <div className="flex items-center justify-between">
                <div className="h-5 w-14 rounded bg-gray-200" />
                <div className="h-8 w-8 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
