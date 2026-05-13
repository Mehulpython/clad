export default function WardrobeLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-48 animate-pulse rounded bg-gray-200" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl bg-gray-100">
            <div className="aspect-[3/4] rounded-t-xl bg-gray-200" />
            <div className="space-y-2 p-3">
              <div className="h-4 w-3/4 rounded bg-gray-200" />
              <div className="h-3 w-1/2 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
