/**
 * LOADING STATE - PAGE COMPARATEUR
 * Skeleton loader pour la page de comparaison de produits
 */

export default function CompareLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 w-72 bg-gray-800 animate-pulse rounded mx-auto mb-4" />
          <div className="h-4 w-96 bg-gray-800 animate-pulse rounded mx-auto" />
        </div>

        {/* Comparison table skeleton */}
        <div className="overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Products row */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              <div className="h-6 w-24 bg-gray-800 animate-pulse rounded" />
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-4">
                  <div className="aspect-square bg-gray-800 animate-pulse rounded-lg" />
                  <div className="h-5 bg-gray-800 animate-pulse rounded" />
                  <div className="h-6 w-20 bg-[#c5a059]/30 animate-pulse rounded mx-auto" />
                </div>
              ))}
            </div>

            {/* Data rows skeleton */}
            {['Marque', 'Prix', 'Volume', 'Concentration', 'Genre', 'Notes de tête', 'Notes de cœur', 'Notes de fond'].map((_, idx) => (
              <div
                key={idx}
                className={`grid grid-cols-5 gap-4 py-4 ${idx % 2 === 0 ? 'bg-gray-900/50' : ''}`}
              >
                <div className="h-4 w-24 bg-gray-800 animate-pulse rounded" />
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-800 animate-pulse rounded" />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
