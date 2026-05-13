export default function GenerateLoading() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Main preview area */}
        <div className="aspect-square animate-pulse rounded-2xl bg-gray-200 md:aspect-[4/5]" />

        {/* Control bar */}
        <div className="animate-pulse rounded-xl bg-gray-100 p-4">
          <div className="mb-3 h-10 w-full rounded-lg bg-gray-200" />
          <div className="flex gap-3">
            <div className="h-10 flex-1 rounded-lg bg-gray-200" />
            <div className="h-10 w-24 shrink-0 rounded-lg bg-rose-200" />
          </div>
        </div>

        {/* Options row */}
        <div className="flex gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-12 flex-1 animate-pulse rounded-lg bg-gray-100" />
          ))}
        </div>
      </div>
    </div>
  );
}
