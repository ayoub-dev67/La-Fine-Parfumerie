/**
 * LOADING STATE - DASHBOARD ADMIN
 * Skeleton loader pour le dashboard admin
 */

export default function AdminLoading() {
  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      {/* Sidebar skeleton */}
      <div className="fixed left-0 top-0 h-screen w-64 bg-black border-r border-[#c5a059]/20">
        <div className="p-6 space-y-4">
          <div className="h-8 bg-gray-800 animate-pulse rounded" />
          <div className="h-4 bg-gray-800 animate-pulse rounded w-2/3" />
          <div className="h-20 bg-gray-800 animate-pulse rounded mt-6" />
        </div>
        <div className="p-4 space-y-2 mt-8">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gray-800 animate-pulse rounded" />
          ))}
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Header skeleton */}
          <div className="space-y-2">
            <div className="h-12 w-64 bg-gray-800 animate-pulse rounded" />
            <div className="h-4 w-48 bg-gray-800 animate-pulse rounded" />
          </div>

          {/* Stats cards skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-black border border-gray-800 animate-pulse rounded-lg"
              />
            ))}
          </div>

          {/* Quick actions skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-black border border-gray-800 animate-pulse rounded-lg"
              />
            ))}
          </div>

          {/* Table skeleton */}
          <div className="bg-black border border-gray-800 rounded-lg p-6">
            <div className="h-6 w-48 bg-gray-800 animate-pulse rounded mb-6" />
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-16 bg-gray-800 animate-pulse rounded" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
