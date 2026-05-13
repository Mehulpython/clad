export default function ScanLoading() {
  return (
    <div className="container mx-auto flex min-h-screen flex-col items-center justify-center gap-8 px-4 py-12">
      {/* Upload area skeleton */}
      <div className="w-full max-w-sm animate-pulse rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 p-12 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-gray-200" />
        <div className="mx-auto h-5 w-48 rounded bg-gray-200" />
        <div className="mx-auto mt-2 h-4 w-36 rounded bg-gray-200" />
      </div>

      {/* Result card skeleton */}
      <div className="w-full max-w-md animate-pulse rounded-xl bg-gray-100 p-5">
        <div className="flex gap-4">
          <div className="h-28 w-24 shrink-0 rounded-lg bg-gray-200" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-3/4 rounded bg-gray-200" />
            <div className="h-3 w-full rounded bg-gray-200" />
            <div className="h-3 w-2/3 rounded bg-gray-200" />
            <div className="flex gap-2 pt-1">
              <div className="h-6 w-14 rounded-full bg-gray-200" />
              <div className="h-6 w-18 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
