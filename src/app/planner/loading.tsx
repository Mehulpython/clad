export default function PlannerLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 h-8 w-56 animate-pulse rounded bg-gray-200" />
      {/* Week navigation */}
      <div className="mb-4 flex items-center justify-between">
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-9 w-24 animate-pulse rounded-lg bg-gray-200" />
      </div>
      {/* Day cards */}
      <div className="grid grid-cols-7 gap-2 md:gap-3">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="flex animate-pulse flex-col rounded-xl bg-gray-100 p-2 md:p-3">
            <div className="mb-2 h-4 w-8 self-center rounded bg-gray-200" />
            <div className="aspect-[3/4] rounded-lg bg-gray-200" />
            <div className="mt-2 space-y-1.5">
              <div className="h-3 w-full rounded bg-gray-200" />
              <div className="h-3 w-2/3 rounded bg-gray-200" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
