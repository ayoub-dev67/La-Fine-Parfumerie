/**
 * LOADING STATE - PAGE PRODUITS
 * Skeleton loader pour la page produits
 */

export default function ProductsLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-4 w-24 bg-gray-800 animate-pulse rounded mx-auto mb-4" />
          <div className="h-12 w-64 bg-gray-800 animate-pulse rounded mx-auto mb-6" />
          <div className="h-px w-16 bg-gray-800 animate-pulse mx-auto" />
        </div>

        {/* Grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-black border border-gray-800 rounded-lg overflow-hidden"
            >
              {/* Image skeleton */}
              <div className="aspect-square bg-gray-800 animate-pulse" />

              {/* Content skeleton */}
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-800 animate-pulse rounded" />
                <div className="h-4 bg-gray-800 animate-pulse rounded w-2/3" />
                <div className="h-6 bg-gray-800 animate-pulse rounded w-1/2 mt-4" />
                <div className="h-10 bg-gray-800 animate-pulse rounded mt-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Pagination skeleton */}
        <div className="mt-12 flex justify-center gap-2">
          <div className="h-10 w-24 bg-gray-800 animate-pulse rounded" />
          <div className="h-10 w-32 bg-gray-800 animate-pulse rounded" />
          <div className="h-10 w-24 bg-gray-800 animate-pulse rounded" />
        </div>
      </div>
    </div>
  );
}
