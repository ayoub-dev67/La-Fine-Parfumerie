'use client';

/**
 * Compare Page - Side by side product comparison
 */

import { useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useCompare } from '@/lib/CompareContext';
import { useCart } from '@/lib/CartContext';
import { FadeIn, SlideUp } from '@/components/animations';

interface Product {
  id: number;
  name: string;
  brand: string | null;
  price: number;
  image: string;
  rating?: number;
  volume: string | null;
  topNotes?: string[];
  heartNotes?: string[];
  baseNotes?: string[];
  // From context (string format)
  notesTop?: string | null;
  notesHeart?: string | null;
  notesBase?: string | null;
  stock: number;
  description?: string;
}

// Helper to convert notes from string to array
function parseNotes(notes: string | string[] | null | undefined): string[] {
  if (!notes) return [];
  if (Array.isArray(notes)) return notes;
  return notes.split(',').map(n => n.trim()).filter(Boolean);
}

function CompareContent() {
  const searchParams = useSearchParams();
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();
  const { addToCart } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Get product IDs from URL or context
  useEffect(() => {
    const idsParam = searchParams.get('ids');

    if (idsParam) {
      // Fetch products from URL IDs
      const ids = idsParam.split(',').map(Number).filter(Boolean);
      fetchProducts(ids);
    } else if (compareProducts.length > 0) {
      // Use products from context - convert to local Product type
      setProducts(compareProducts as unknown as Product[]);
      setLoading(false);
    } else {
      setLoading(false);
    }
  }, [searchParams, compareProducts]);

  const fetchProducts = async (ids: number[]) => {
    try {
      setLoading(true);
      const responses = await Promise.all(
        ids.map(id => fetch(`/api/products/${id}`).then(r => r.json()))
      );
      setProducts(responses.filter(p => p && !p.error));
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    // Cast to the expected Product type for cart
    addToCart(product as unknown as Parameters<typeof addToCart>[0]);
  };

  const handleRemove = (productId: number) => {
    removeFromCompare(productId);
    setProducts(prev => prev.filter(p => p.id !== productId));
  };

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/compare?ids=${products.map(p => p.id).join(',')}`
    : '';

  const copyShareLink = () => {
    navigator.clipboard.writeText(shareUrl);
    // Toast notification will be added later
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

  if (products.length === 0) {
    return (
      <div className="min-h-screen bg-noir pt-24 pb-16">
        <div className="container mx-auto px-4">
          <FadeIn>
            <div className="text-center py-16">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-or/20 to-or/5 flex items-center justify-center">
                <svg className="w-12 h-12 text-or/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-serif text-creme mb-4">
                Aucun produit à comparer
              </h1>
              <p className="text-creme/60 mb-8">
                Ajoutez des produits à votre liste de comparaison pour les voir côte à côte.
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

  const comparisonRows = [
    { label: 'Marque', key: 'brand', render: (p: Product) => p.brand },
    { label: 'Prix', key: 'price', render: (p: Product) => `${p.price.toFixed(2)} €` },
    { label: 'Note', key: 'rating', render: (p: Product) => (
      <div className="flex items-center gap-1">
        <span className="text-or">★</span>
        <span>{p.rating?.toFixed(1) || 'N/A'}</span>
      </div>
    )},
    { label: 'Volume', key: 'volume', render: (p: Product) => p.volume || 'N/A' },
    { label: 'Notes de tête', key: 'topNotes', render: (p: Product) => {
      const notes = parseNotes(p.topNotes || p.notesTop);
      return (
        <div className="flex flex-wrap gap-1">
          {notes.length > 0 ? notes.map((note, i) => (
            <span key={i} className="px-2 py-0.5 bg-or/10 text-or text-xs rounded-full">{note}</span>
          )) : <span className="text-creme/40">-</span>}
        </div>
      );
    }},
    { label: 'Notes de cœur', key: 'heartNotes', render: (p: Product) => {
      const notes = parseNotes(p.heartNotes || p.notesHeart);
      return (
        <div className="flex flex-wrap gap-1">
          {notes.length > 0 ? notes.map((note, i) => (
            <span key={i} className="px-2 py-0.5 bg-rose-500/10 text-rose-300 text-xs rounded-full">{note}</span>
          )) : <span className="text-creme/40">-</span>}
        </div>
      );
    }},
    { label: 'Notes de fond', key: 'baseNotes', render: (p: Product) => {
      const notes = parseNotes(p.baseNotes || p.notesBase);
      return (
        <div className="flex flex-wrap gap-1">
          {notes.length > 0 ? notes.map((note, i) => (
            <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-300 text-xs rounded-full">{note}</span>
          )) : <span className="text-creme/40">-</span>}
        </div>
      );
    }},
    { label: 'Stock', key: 'stock', render: (p: Product) => (
      <span className={p.stock > 0 ? 'text-green-400' : 'text-red-400'}>
        {p.stock > 0 ? `${p.stock} en stock` : 'Rupture de stock'}
      </span>
    )},
  ];

  return (
    <div className="min-h-screen bg-noir pt-24 pb-16">
      <div className="container mx-auto px-4">
        {/* Header */}
        <SlideUp>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-serif text-creme mb-2">
                Comparer les produits
              </h1>
              <p className="text-creme/60">
                {products.length} produit{products.length > 1 ? 's' : ''} sélectionné{products.length > 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={copyShareLink}
                className="flex items-center gap-2 px-4 py-2 border border-or/30 text-creme rounded-lg hover:bg-or/10 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
                Partager
              </button>
              <button
                onClick={() => {
                  clearCompare();
                  setProducts([]);
                }}
                className="flex items-center gap-2 px-4 py-2 text-creme/60 hover:text-creme transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Tout effacer
              </button>
            </div>
          </div>
        </SlideUp>

        {/* Comparison Table */}
        <FadeIn delay={0.2}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              {/* Product Headers */}
              <thead>
                <tr>
                  <th className="w-40 p-4 text-left text-creme/60 font-normal border-b border-or/10">
                    Produit
                  </th>
                  {products.map((product, index) => (
                    <th key={product.id} className="p-4 border-b border-or/10">
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="relative"
                      >
                        {/* Remove button */}
                        <button
                          onClick={() => handleRemove(product.id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm hover:bg-red-600 transition-colors z-10"
                        >
                          ×
                        </button>

                        {/* Product Image */}
                        <Link href={`/produit/${product.id}`}>
                          <div className="w-32 h-32 mx-auto mb-3 rounded-lg overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={128}
                              height={128}
                              className="w-full h-full object-cover hover:scale-105 transition-transform"
                            />
                          </div>
                        </Link>

                        {/* Product Name */}
                        <Link href={`/produit/${product.id}`}>
                          <h3 className="text-creme font-medium hover:text-or transition-colors">
                            {product.name}
                          </h3>
                        </Link>
                      </motion.div>
                    </th>
                  ))}
                  {/* Empty slots */}
                  {Array.from({ length: 4 - products.length }).map((_, i) => (
                    <th key={`empty-${i}`} className="p-4 border-b border-or/10">
                      <Link href="/boutique">
                        <div className="w-32 h-32 mx-auto mb-3 rounded-lg border-2 border-dashed border-or/20 flex items-center justify-center hover:border-or/40 transition-colors">
                          <span className="text-or/40 text-3xl">+</span>
                        </div>
                        <span className="text-creme/40 text-sm">Ajouter</span>
                      </Link>
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Comparison Rows */}
              <tbody>
                {comparisonRows.map((row, rowIndex) => (
                  <motion.tr
                    key={row.key}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + rowIndex * 0.05 }}
                    className="border-b border-or/10"
                  >
                    <td className="p-4 text-creme/60 font-medium">
                      {row.label}
                    </td>
                    {products.map((product) => (
                      <td key={product.id} className="p-4 text-creme text-center">
                        {row.render(product)}
                      </td>
                    ))}
                    {Array.from({ length: 4 - products.length }).map((_, i) => (
                      <td key={`empty-${i}`} className="p-4 text-center text-creme/20">
                        -
                      </td>
                    ))}
                  </motion.tr>
                ))}

                {/* Add to Cart Row */}
                <tr>
                  <td className="p-4 text-creme/60 font-medium">
                    Action
                  </td>
                  {products.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          product.stock > 0
                            ? 'bg-or text-noir hover:bg-or/90'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                      >
                        {product.stock > 0 ? 'Ajouter au panier' : 'Indisponible'}
                      </button>
                    </td>
                  ))}
                  {Array.from({ length: 4 - products.length }).map((_, i) => (
                    <td key={`empty-${i}`} className="p-4" />
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </FadeIn>

        {/* Back to Shop */}
        <div className="mt-8 text-center">
          <Link
            href="/boutique"
            className="inline-flex items-center gap-2 text-or hover:text-or/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour à la boutique
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-noir pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-or border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    }>
      <CompareContent />
    </Suspense>
  );
}
