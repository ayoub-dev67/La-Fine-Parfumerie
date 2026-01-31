'use client';

/**
 * QuickViewModal - Placeholder component
 * TODO: Implement quick view modal for products
 */

export default function QuickViewModal({ productId }: { productId?: number }) {
  return (
    <div className="p-4 text-creme/50">
      <p>Quick view {productId ? `#${productId}` : ''} - Bientôt disponible</p>
    </div>
  );
}
