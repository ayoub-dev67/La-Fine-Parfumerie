/**
 * LOADING STATE - PAGE CHECKOUT
 * Skeleton loader pour la page de paiement
 */

export default function CheckoutLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] py-24 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header skeleton */}
        <div className="text-center mb-12">
          <div className="h-12 w-48 bg-gray-800 animate-pulse rounded mx-auto mb-4" />
          <div className="h-4 w-64 bg-gray-800 animate-pulse rounded mx-auto" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order summary skeleton */}
          <div className="bg-black border border-gray-800 rounded-lg p-6 space-y-4">
            <div className="h-6 w-32 bg-gray-800 animate-pulse rounded" />

            {/* Items */}
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-4 py-4 border-b border-gray-800">
                <div className="w-20 h-20 bg-gray-800 animate-pulse rounded" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-800 animate-pulse rounded w-3/4" />
                  <div className="h-4 bg-gray-800 animate-pulse rounded w-1/2" />
                  <div className="h-4 bg-gray-800 animate-pulse rounded w-1/4" />
                </div>
              </div>
            ))}

            {/* Totals */}
            <div className="space-y-2 pt-4">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-gray-800 animate-pulse rounded" />
                <div className="h-4 w-16 bg-gray-800 animate-pulse rounded" />
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-gray-800 animate-pulse rounded" />
                <div className="h-4 w-16 bg-gray-800 animate-pulse rounded" />
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-800">
                <div className="h-6 w-16 bg-gray-800 animate-pulse rounded" />
                <div className="h-6 w-24 bg-[#c5a059]/30 animate-pulse rounded" />
              </div>
            </div>
          </div>

          {/* Payment form skeleton */}
          <div className="bg-black border border-gray-800 rounded-lg p-6 space-y-6">
            <div className="h-6 w-48 bg-gray-800 animate-pulse rounded" />

            {/* Promo code */}
            <div className="flex gap-2">
              <div className="flex-1 h-12 bg-gray-800 animate-pulse rounded" />
              <div className="w-24 h-12 bg-gray-800 animate-pulse rounded" />
            </div>

            {/* Submit button */}
            <div className="h-14 bg-[#c5a059]/30 animate-pulse rounded" />

            {/* Secure payment notice */}
            <div className="flex items-center justify-center gap-2">
              <div className="w-5 h-5 bg-gray-800 animate-pulse rounded" />
              <div className="h-4 w-48 bg-gray-800 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
