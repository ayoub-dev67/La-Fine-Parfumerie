'use client';

/**
 * QuickViewContext - Context for managing Quick View modal state
 */

import { createContext, useContext, useState, ReactNode, useCallback } from 'react';

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
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
}

interface QuickViewContextType {
  isOpen: boolean;
  product: Product | null;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;
}

const QuickViewContext = createContext<QuickViewContextType | undefined>(undefined);

export function QuickViewProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);

  const openQuickView = useCallback((product: Product) => {
    setProduct(product);
    setIsOpen(true);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }, []);

  const closeQuickView = useCallback(() => {
    setIsOpen(false);
    // Restore body scroll
    document.body.style.overflow = 'unset';
    // Delay clearing product for exit animation
    setTimeout(() => setProduct(null), 300);
  }, []);

  return (
    <QuickViewContext.Provider
      value={{
        isOpen,
        product,
        openQuickView,
        closeQuickView,
      }}
    >
      {children}
    </QuickViewContext.Provider>
  );
}

export function useQuickView() {
  const context = useContext(QuickViewContext);
  if (context === undefined) {
    throw new Error('useQuickView must be used within a QuickViewProvider');
  }
  return context;
}
