'use client';

/**
 * ProductQuickView - Modal for quick product preview
 */

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuickView } from '@/lib/QuickViewContext';
import { useCart } from '@/lib/CartContext';
import toast from 'react-hot-toast';

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const modalVariants = {
  hidden: {
    opacity: 0,
    scale: 0.9,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: 20,
    transition: {
      duration: 0.2,
    },
  },
};

export function ProductQuickView() {
  const { isOpen, product, closeQuickView } = useQuickView();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  if (!product) return null;

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      // Add product to cart (quantity times if more than 1)
      for (let i = 0; i < quantity; i++) {
        addToCart(product as Parameters<typeof addToCart>[0]);
      }
      toast.success(`${product.name} ajouté au panier`);
      closeQuickView();
    } catch {
      toast.error('Erreur lors de l\'ajout au panier');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50"
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onClick={closeQuickView}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            <motion.div
              variants={modalVariants}
              className="relative w-full max-w-4xl max-h-[90vh] bg-gradient-to-br from-noir to-gray-900 rounded-2xl border border-or/30 shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={closeQuickView}
                className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-noir/80 text-creme hover:bg-or hover:text-noir transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>

              <div className="grid md:grid-cols-2 gap-0">
                {/* Image */}
                <div className="relative aspect-square bg-noir">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  {/* Badges */}
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.isNew && (
                      <span className="px-3 py-1 bg-or text-noir text-xs font-bold rounded-full">
                        NOUVEAU
                      </span>
                    )}
                    {product.isBestSeller && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                        BEST SELLER
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 md:p-8 overflow-y-auto max-h-[60vh] md:max-h-[90vh]">
                  {/* Brand */}
                  {product.brand && (
                    <p className="text-or/70 text-sm uppercase tracking-widest mb-2">
                      {product.brand}
                    </p>
                  )}

                  {/* Name */}
                  <h2 className="text-2xl md:text-3xl font-serif text-creme mb-2">
                    {product.name}
                  </h2>

                  {/* Volume */}
                  {product.volume && (
                    <p className="text-creme/50 text-sm mb-4">{product.volume}</p>
                  )}

                  {/* Price */}
                  <p className="text-3xl font-bold text-or mb-6">
                    {product.price.toFixed(2)} €
                  </p>

                  {/* Description */}
                  <p className="text-creme/70 text-sm leading-relaxed mb-6 line-clamp-4">
                    {product.description}
                  </p>

                  {/* Notes */}
                  {(product.notesTop || product.notesHeart || product.notesBase) && (
                    <div className="mb-6 space-y-2">
                      <h3 className="text-sm font-semibold text-or mb-2">Notes Olfactives</h3>
                      {product.notesTop && (
                        <p className="text-xs text-creme/60">
                          <span className="text-creme/80">Tête:</span> {product.notesTop}
                        </p>
                      )}
                      {product.notesHeart && (
                        <p className="text-xs text-creme/60">
                          <span className="text-creme/80">Cœur:</span> {product.notesHeart}
                        </p>
                      )}
                      {product.notesBase && (
                        <p className="text-xs text-creme/60">
                          <span className="text-creme/80">Fond:</span> {product.notesBase}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Stock Status */}
                  <div className="mb-6">
                    {product.stock > 0 ? (
                      <span className="text-green-400 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                        En stock ({product.stock} disponibles)
                      </span>
                    ) : (
                      <span className="text-red-400 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 bg-red-400 rounded-full" />
                        Rupture de stock
                      </span>
                    )}
                  </div>

                  {/* Quantity Selector */}
                  {product.stock > 0 && (
                    <div className="flex items-center gap-4 mb-6">
                      <span className="text-sm text-creme/70">Quantité:</span>
                      <div className="flex items-center border border-or/30 rounded-lg overflow-hidden">
                        <button
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          className="px-3 py-2 text-creme hover:bg-or/10 transition-colors"
                        >
                          -
                        </button>
                        <span className="px-4 py-2 text-creme bg-noir/50 min-w-[50px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                          className="px-3 py-2 text-creme hover:bg-or/10 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="space-y-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock === 0 || isAdding}
                      className="w-full py-3 bg-or text-noir font-bold rounded-lg hover:bg-or/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isAdding ? (
                        <>
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Ajout en cours...
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Ajouter au panier
                        </>
                      )}
                    </button>

                    <Link
                      href={`/products/${product.id}`}
                      onClick={closeQuickView}
                      className="block w-full py-3 text-center border border-or/30 text-or rounded-lg hover:bg-or/10 transition-colors"
                    >
                      Voir tous les détails
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
