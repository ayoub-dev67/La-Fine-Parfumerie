/**
 * LOADING STATE - PAGE D'ACCUEIL
 * Skeleton loader global
 */

export default function Loading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Hero skeleton */}
      <div className="h-[600px] bg-gradient-to-b from-gray-900 to-[#0a0a0a] animate-pulse" />

      {/* Content sections skeleton */}
      <div className="max-w-7xl mx-auto px-4 py-24 space-y-24">
        {/* Collection showcase skeleton */}
        <div className="space-y-8">
          <div className="text-center space-y-4">
            <div className="h-8 w-64 bg-gray-800 animate-pulse rounded mx-auto" />
            <div className="h-4 w-48 bg-gray-800 animate-pulse rounded mx-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <div className="aspect-square bg-gray-800 animate-pulse rounded-lg" />
                <div className="h-4 bg-gray-800 animate-pulse rounded" />
                <div className="h-4 bg-gray-800 animate-pulse rounded w-2/3" />
              </div>
            ))}
          </div>
        </div>

        {/* Features skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="text-center space-y-4">
              <div className="h-16 w-16 bg-gray-800 animate-pulse rounded-full mx-auto" />
              <div className="h-6 w-32 bg-gray-800 animate-pulse rounded mx-auto" />
              <div className="h-4 bg-gray-800 animate-pulse rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
