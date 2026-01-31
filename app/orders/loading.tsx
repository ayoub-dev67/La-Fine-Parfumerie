/**
 * LOADING STATE - PAGE COMMANDES
 * Skeleton loader pour la page historique des commandes
 */

export default function OrdersLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="mb-12">
          <div className="h-12 w-64 bg-gray-800 animate-pulse rounded mb-4" />
          <div className="h-4 w-48 bg-gray-800 animate-pulse rounded" />
        </div>

        {/* Orders list skeleton */}
        <div className="space-y-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-black border border-gray-800 rounded-lg overflow-hidden"
            >
              {/* Order header */}
              <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-40 bg-gray-800 animate-pulse rounded" />
                  <div className="h-4 w-32 bg-gray-800 animate-pulse rounded" />
                </div>
                <div className="h-6 w-24 bg-[#c5a059]/30 animate-pulse rounded-full" />
              </div>

              {/* Order items */}
              <div className="p-4 space-y-4">
                {[...Array(2)].map((_, j) => (
                  <div key={j} className="flex gap-4">
                    <div className="w-16 h-16 bg-gray-800 animate-pulse rounded" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-800 animate-pulse rounded w-3/4" />
                      <div className="h-4 bg-gray-800 animate-pulse rounded w-1/2" />
                    </div>
                    <div className="h-4 w-16 bg-gray-800 animate-pulse rounded" />
                  </div>
                ))}
              </div>

              {/* Order footer */}
              <div className="p-4 border-t border-gray-800 flex items-center justify-between bg-gray-900/50">
                <div className="h-6 w-32 bg-gray-800 animate-pulse rounded" />
                <div className="h-10 w-28 bg-gray-800 animate-pulse rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
