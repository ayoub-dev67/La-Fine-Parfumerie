'use client';

/**
 * ProductReviews - Placeholder component
 * TODO: Implement full reviews functionality
 */

export default function ProductReviews({ productId }: { productId?: number }) {
  return (
    <div className="p-4 text-creme/50">
      <p>Avis produit {productId ? `#${productId}` : ''} - Bientôt disponible</p>
    </div>
  );
}
