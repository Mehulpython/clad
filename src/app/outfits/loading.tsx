export default function OutfitsLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-40 animate-pulse rounded bg-gray-200" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex animate-pulse gap-4 rounded-xl bg-gray-100 p-4">
            <div className="h-32 w-32 shrink-0 rounded-lg bg-gray-200 md:h-40 md:w-40" />
            <div className="flex-1 space-y-3 pt-1">
              <div className="h-5 w-2/3 rounded bg-gray-200" />
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-4/5 rounded bg-gray-200" />
              <div className="flex gap-2 pt-1">
                <div className="h-6 w-16 rounded-full bg-gray-200" />
                <div className="h-6 w-20 rounded-full bg-gray-200" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
