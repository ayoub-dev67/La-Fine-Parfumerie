'use client';

/**
 * RecommendedProducts - Affiche les recommandations personnalisées
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Product {
  id: number;
  name: string;
  brand: string | null;
  image: string;
  price: number;
  category: string;
  isBestSeller: boolean;
  isNew: boolean;
}

interface RecommendedProductsProps {
  title?: string;
  productId?: number;
  type?: 'personal' | 'similar' | 'fbt';
  limit?: number;
  className?: string;
}

export function RecommendedProducts({
  title = 'Recommandés pour vous',
  productId,
  type = 'personal',
  limit = 4,
  className = '',
}: RecommendedProductsProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [productId, type, limit]);

  async function fetchRecommendations() {
    try {
      const params = new URLSearchParams();
      if (productId) params.set('productId', productId.toString());
      if (type !== 'personal') params.set('type', type);
      params.set('limit', limit.toString());

      const res = await fetch(`/api/recommendations?${params.toString()}`);
      const data = await res.json();
      setProducts(data.products || []);
    } catch (error) {
      console.error('Erreur chargement recommandations:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={`${className}`}>
        <h2 className="text-xl font-bold text-or mb-6">{title}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <div
              key={i}
              className="bg-noir/50 border border-or/10 rounded-lg overflow-hidden animate-pulse"
            >
              <div className="aspect-square bg-noir/30" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-or/10 rounded w-1/2" />
                <div className="h-4 bg-creme/10 rounded w-3/4" />
                <div className="h-4 bg-or/20 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className={`${className}`}>
      <h2 className="text-xl font-bold text-or mb-6">{title}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="group bg-noir/50 border border-or/10 rounded-lg overflow-hidden hover:border-or/30 transition-colors"
          >
            <div className="relative aspect-square overflow-hidden bg-noir/30">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 50vw, 25vw"
              />
              {/* Badges */}
              <div className="absolute top-2 left-2 flex flex-col gap-1">
                {product.isNew && (
                  <span className="px-2 py-0.5 bg-green-500 text-white text-xs font-medium rounded">
                    Nouveau
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-2 py-0.5 bg-or text-noir text-xs font-medium rounded">
                    Best-seller
                  </span>
                )}
              </div>
            </div>
            <div className="p-3">
              {product.brand && (
                <p className="text-xs text-or mb-1 truncate">{product.brand}</p>
              )}
              <h3 className="text-sm text-creme font-medium mb-2 line-clamp-2 group-hover:text-or transition-colors">
                {product.name}
              </h3>
              <p className="text-or font-bold">{product.price.toFixed(2)}€</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * Composant pour "Achetés ensemble" sur les pages produit
 */
export function FrequentlyBoughtTogether({ productId }: { productId: number }) {
  return (
    <RecommendedProducts
      title="Fréquemment achetés ensemble"
      productId={productId}
      type="fbt"
      limit={3}
    />
  );
}

/**
 * Composant pour "Produits similaires" sur les pages produit
 */
export function SimilarProducts({ productId }: { productId: number }) {
  return (
    <RecommendedProducts
      title="Vous aimerez aussi"
      productId={productId}
      type="similar"
      limit={4}
    />
  );
}
