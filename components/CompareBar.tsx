'use client';

/**
 * CompareBar - Sticky bottom bar showing products to compare
 */

import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useCompare, MAX_COMPARE_ITEMS } from '@/lib/CompareContext';

const barVariants = {
  hidden: { y: 100, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 30,
    },
  },
  exit: {
    y: 100,
    opacity: 0,
    transition: { duration: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.8 },
};

export function CompareBar() {
  const { compareProducts, removeFromCompare, clearCompare } = useCompare();

  const showBar = compareProducts.length >= 1;

  return (
    <AnimatePresence>
      {showBar && (
        <motion.div
          variants={barVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="fixed bottom-0 left-0 right-0 z-40 bg-gradient-to-r from-noir via-gray-900 to-noir border-t border-or/30 shadow-2xl"
        >
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              {/* Products */}
              <div className="flex items-center gap-3 overflow-x-auto flex-1">
                <span className="text-creme/70 text-sm whitespace-nowrap">
                  Comparer ({compareProducts.length}/{MAX_COMPARE_ITEMS}):
                </span>

                <AnimatePresence mode="popLayout">
                  {compareProducts.map((product) => (
                    <motion.div
                      key={product.id}
                      variants={itemVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="relative group flex-shrink-0"
                    >
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-or/30 bg-noir">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      {/* Remove button */}
                      <button
                        onClick={() => removeFromCompare(product.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ×
                      </button>
                      {/* Tooltip */}
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-noir border border-or/30 rounded text-xs text-creme whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        {product.name}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty slots */}
                {Array.from({ length: MAX_COMPARE_ITEMS - compareProducts.length }).map((_, i) => (
                  <div
                    key={`empty-${i}`}
                    className="w-12 h-12 rounded-lg border border-dashed border-or/20 bg-noir/50 flex items-center justify-center flex-shrink-0"
                  >
                    <span className="text-or/30 text-xl">+</span>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={clearCompare}
                  className="px-3 py-2 text-creme/60 hover:text-creme text-sm transition-colors"
                >
                  Effacer
                </button>

                {compareProducts.length >= 2 && (
                  <Link
                    href={`/compare?ids=${compareProducts.map((p) => p.id).join(',')}`}
                    className="px-4 py-2 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors text-sm"
                  >
                    Comparer maintenant
                  </Link>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
