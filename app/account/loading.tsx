/**
 * LOADING STATE - PAGE COMPTE
 * Skeleton loader pour la page mon compte
 */

export default function AccountLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-12">
          <div className="h-12 w-48 bg-gray-800 animate-pulse rounded mb-4" />
          <div className="h-4 w-64 bg-gray-800 animate-pulse rounded" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar skeleton */}
          <div className="bg-black border border-gray-800 rounded-lg p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gray-800 animate-pulse rounded-full" />
              <div className="space-y-2">
                <div className="h-5 w-32 bg-gray-800 animate-pulse rounded" />
                <div className="h-4 w-40 bg-gray-800 animate-pulse rounded" />
              </div>
            </div>

            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-800 animate-pulse rounded"
                />
              ))}
            </div>
          </div>

          {/* Content skeleton */}
          <div className="lg:col-span-2 bg-black border border-gray-800 rounded-lg p-6 space-y-6">
            <div className="h-8 w-48 bg-gray-800 animate-pulse rounded" />

            {/* Form fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-gray-800 animate-pulse rounded" />
                <div className="h-12 bg-gray-800 animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-gray-800 animate-pulse rounded" />
                <div className="h-12 bg-gray-800 animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-gray-800 animate-pulse rounded" />
                <div className="h-12 bg-gray-800 animate-pulse rounded" />
              </div>
            </div>

            {/* Save button */}
            <div className="h-12 w-40 bg-[#c5a059]/30 animate-pulse rounded" />
          </div>
        </div>
      </div>
    </div>
  );
}
