export default function ProfileLoading() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      {/* Avatar + name header */}
      <div className="mb-8 flex items-center gap-4">
        <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
        <div className="space-y-2">
          <div className="h-6 w-40 rounded bg-gray-200" />
          <div className="h-4 w-28 rounded bg-gray-200" />
        </div>
      </div>

      {/* Form fields */}
      <div className="space-y-5 rounded-xl bg-gray-100 p-6">
        {['Name', 'Email', 'Body Type', 'Style Preferences'].map((label) => (
          <div key={label} className="space-y-1.5">
            <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
          </div>
        ))}

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <div className="h-10 flex-1 animate-pulse rounded-lg bg-rose-200" />
          <div className="h-10 w-28 animate-pulse rounded-lg bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
