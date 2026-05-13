export default function SettingsLoading() {
  const sections = ['Appearance', 'Notifications', 'Privacy', 'Data & Storage'];
  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 h-8 w-36 animate-pulse rounded bg-gray-200" />

      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section} className="rounded-xl bg-gray-100 p-5">
            <div className="mb-4 h-5 w-32 animate-pulse rounded bg-gray-200" />
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="h-4 w-36 animate-pulse rounded bg-gray-200" />
                  <div className="h-6 w-11 animate-pulse rounded-full bg-gray-200" />
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Danger zone */}
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <div className="mb-3 h-5 w-24 animate-pulse rounded bg-red-200" />
          <div className="h-9 w-32 animate-pulse rounded bg-red-200" />
        </div>
      </div>
    </div>
  );
}
