'use client';

/**
 * CompareContext - Context for managing product comparison
 */

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import toast from 'react-hot-toast';

interface Product {
  id: number;
  name: string;
  brand: string | null;
  description: string;
  price: number;
  volume: string | null;
  image: string;
  category: string;
  stock: number;
  notesTop: string | null;
  notesHeart: string | null;
  notesBase: string | null;
}

interface CompareContextType {
  compareProducts: Product[];
  addToCompare: (product: Product) => void;
  removeFromCompare: (productId: number) => void;
  clearCompare: () => void;
  isInCompare: (productId: number) => boolean;
  canAddMore: boolean;
}

const MAX_COMPARE_ITEMS = 4;
const STORAGE_KEY = 'perfume-shop-compare';

const CompareContext = createContext<CompareContextType | undefined>(undefined);

export function CompareProvider({ children }: { children: ReactNode }) {
  const [compareProducts, setCompareProducts] = useState<Product[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCompareProducts(parsed);
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
    setIsHydrated(true);
  }, []);

  // Save to localStorage on change
  useEffect(() => {
    if (isHydrated) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(compareProducts));
    }
  }, [compareProducts, isHydrated]);

  const addToCompare = useCallback((product: Product) => {
    setCompareProducts((prev) => {
      if (prev.length >= MAX_COMPARE_ITEMS) {
        toast.error(`Maximum ${MAX_COMPARE_ITEMS} produits à comparer`);
        return prev;
      }
      if (prev.some((p) => p.id === product.id)) {
        toast.error('Produit déjà dans la comparaison');
        return prev;
      }
      toast.success(`${product.name} ajouté à la comparaison`);
      return [...prev, product];
    });
  }, []);

  const removeFromCompare = useCallback((productId: number) => {
    setCompareProducts((prev) => {
      const product = prev.find((p) => p.id === productId);
      if (product) {
        toast.success(`${product.name} retiré de la comparaison`);
      }
      return prev.filter((p) => p.id !== productId);
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareProducts([]);
    toast.success('Comparaison vidée');
  }, []);

  const isInCompare = useCallback(
    (productId: number) => {
      return compareProducts.some((p) => p.id === productId);
    },
    [compareProducts]
  );

  const canAddMore = compareProducts.length < MAX_COMPARE_ITEMS;

  return (
    <CompareContext.Provider
      value={{
        compareProducts,
        addToCompare,
        removeFromCompare,
        clearCompare,
        isInCompare,
        canAddMore,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const context = useContext(CompareContext);
  if (context === undefined) {
    throw new Error('useCompare must be used within a CompareProvider');
  }
  return context;
}

export { MAX_COMPARE_ITEMS };
