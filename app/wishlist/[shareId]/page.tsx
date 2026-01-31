'use client';

/**
 * Public Wishlist Page - View shared wishlist
 */

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCart } from '@/lib/CartContext';
import { FadeIn, SlideUp, ProductGrid, ProductGridItem } from '@/components/animations';

interface WishlistProduct {
  id: number;
  name: string;
  brand: string;
  price: number;
  image: string;
  volume: string;
  stock: number;
  rating: number;
  addedAt: string;
}

interface WishlistData {
  owner: {
    name: string;
    image: string | null;
  };
  products: WishlistProduct[];
  totalItems: number;
  totalValue: number;
}

export default function PublicWishlistPage() {
  const params = useParams();
  const shareId = params.shareId as string;
  const { addToCart } = useCart();

  const [wishlist, setWishlist] = useState<WishlistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (shareId) {
      fetchWishlist();
    }
  }, [shareId]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/wishlist/public/${shareId}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors du chargement');
      }

      setWishlist(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: WishlistProduct) => {
    // Cast to the expected Product type for cart
    addToCart(product as unknown as Parameters<typeof addToCart>[0]);
  };

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.href);
    alert('Lien copié !');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-noir pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-noir pt-24 pb-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg className="w-12 h-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif text-creme mb-4">
                Wishlist non disponible
              </h1>
              <p className="text-creme/60 mb-8">{error}</p>
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 px-6 py-3 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors"
              >
                Découvrir nos produits
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  if (!wishlist || wishlist.products.length === 0) {
    return (
      <div className="min-h-screen bg-noir pt-24 pb-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-or/20 to-or/5 flex items-center justify-center">
                <svg className="w-12 h-12 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif text-creme mb-4">
                Cette wishlist est vide
              </h1>
              <p className="text-creme/60 mb-8">
                Aucun produit dans cette liste pour le moment.
              </p>
              <Link
                href="/boutique"
                className="inline-flex items-center gap-2 px-6 py-3 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors"
              >
                Parcourir la boutique
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-noir pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <SlideUp>
          <div className="text-center mb-12">
            {/* Owner Avatar */}
            <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden border-2 border-or">
              {wishlist.owner.image ? (
                <Image
                  src={wishlist.owner.image}
                  alt={wishlist.owner.name}
                  width={80}
                  height={80}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-or/30 to-or/10 flex items-center justify-center">
                  <span className="text-2xl text-or">
                    {wishlist.owner.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            <h1 className="text-3xl font-serif text-creme mb-2">
              Wishlist de {wishlist.owner.name}
            </h1>
            <p className="text-creme/60">
              {wishlist.totalItems} produit{wishlist.totalItems > 1 ? 's' : ''} •
              Valeur totale : {wishlist.totalValue.toFixed(2)} €
            </p>

            {/* Share Button */}
            <button
              onClick={copyShareLink}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 border border-or/30 text-creme rounded-lg hover:bg-or/10 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              Partager cette wishlist
            </button>
          </div>
        </SlideUp>

        {/* Products Grid */}
        <ProductGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {wishlist.products.map((product, index) => (
            <ProductGridItem key={product.id}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group bg-gradient-to-br from-gray-900 to-noir border border-or/10 rounded-lg overflow-hidden hover:border-or/30 transition-colors"
              >
                {/* Product Image */}
                <Link href={`/produit/${product.id}`}>
                  <div className="relative aspect-square overflow-hidden">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-noir/40 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </Link>

                {/* Product Info */}
                <div className="p-4">
                  {/* Brand */}
                  <span className="text-or text-xs font-medium tracking-wider uppercase">
                    {product.brand}
                  </span>

                  {/* Name */}
                  <Link href={`/produit/${product.id}`}>
                    <h3 className="text-creme font-medium mt-1 group-hover:text-or transition-colors">
                      {product.name}
                    </h3>
                  </Link>

                  {/* Volume */}
                  {product.volume && (
                    <span className="text-creme/50 text-sm">{product.volume}</span>
                  )}

                  {/* Rating */}
                  {product.rating && (
                    <div className="flex items-center gap-1 mt-1">
                      <span className="text-or text-sm">★</span>
                      <span className="text-creme/60 text-sm">{product.rating.toFixed(1)}</span>
                    </div>
                  )}

                  {/* Price and Action */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xl font-serif text-creme">
                      {product.price.toFixed(2)} €
                    </span>

                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.stock === 0}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        product.stock > 0
                          ? 'bg-or text-noir hover:bg-or/90'
                          : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {product.stock > 0 ? (
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      ) : (
                        'Épuisé'
                      )}
                    </button>
                  </div>

                  {/* Stock indicator */}
                  <div className="flex items-center gap-1 mt-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      product.stock > 5 ? 'bg-green-500' :
                      product.stock > 0 ? 'bg-or' : 'bg-red-500'
                    }`} />
                    <span className="text-creme/40 text-xs">
                      {product.stock > 5 ? 'En stock' :
                       product.stock > 0 ? `${product.stock} restant${product.stock > 1 ? 's' : ''}` :
                       'Épuisé'}
                    </span>
                  </div>
                </div>
              </motion.div>
            </ProductGridItem>
          ))}
        </ProductGrid>

        {/* Call to Action */}
        <FadeIn delay={0.4}>
          <div className="mt-12 text-center">
            <p className="text-creme/60 mb-4">
              Vous aimez cette sélection ? Créez votre propre wishlist !
            </p>
            <Link
              href="/boutique"
              className="inline-flex items-center gap-2 px-6 py-3 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors"
            >
              Parcourir la boutique
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}
