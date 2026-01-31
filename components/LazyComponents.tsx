'use client';

/**
 * LazyComponents - Chargement différé des composants lourds
 * Améliore le Time to Interactive (TTI) en différant le chargement
 */

import dynamic from 'next/dynamic';
import { Suspense, ComponentType, ReactNode } from 'react';

// ============================================
// SKELETON LOADERS
// ============================================

/**
 * Skeleton pour cartes produits
 */
export function ProductCardSkeleton() {
  return (
    <div className="bg-noir-50 border border-or/10 overflow-hidden animate-pulse">
      <div className="aspect-[3/4] bg-gradient-to-b from-noir-100 to-noir-50" />
      <div className="p-4 space-y-3">
        <div className="h-3 bg-or/10 rounded w-1/3" />
        <div className="h-5 bg-creme/10 rounded w-3/4" />
        <div className="h-4 bg-or/20 rounded w-1/4" />
      </div>
    </div>
  );
}

/**
 * Skeleton pour grille de produits
 */
export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/**
 * Skeleton pour les reviews
 */
export function ReviewsSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-noir-50 border border-or/10 p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-10 h-10 rounded-full bg-or/20" />
            <div className="space-y-2">
              <div className="h-4 bg-creme/20 rounded w-24" />
              <div className="h-3 bg-creme/10 rounded w-16" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="h-3 bg-creme/10 rounded w-full" />
            <div className="h-3 bg-creme/10 rounded w-3/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton pour le graphique admin
 */
export function ChartSkeleton() {
  return (
    <div className="bg-noir-50 border border-or/10 p-6 animate-pulse">
      <div className="h-6 bg-creme/10 rounded w-1/4 mb-6" />
      <div className="h-64 bg-gradient-to-t from-or/5 to-transparent rounded flex items-end justify-around gap-2">
        {[40, 65, 45, 80, 55, 70, 60, 85, 50, 75, 65, 90].map((h, i) => (
          <div
            key={i}
            className="w-full bg-or/20 rounded-t"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Skeleton générique
 */
export function GenericSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-noir-50 border border-or/10 ${className}`} />
  );
}

// ============================================
// LAZY LOADING WRAPPER
// ============================================

interface LazyWrapperProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Wrapper pour composants lazy avec Suspense intégré
 */
export function LazyWrapper({ children, fallback }: LazyWrapperProps) {
  return (
    <Suspense fallback={fallback || <GenericSkeleton className="h-64 w-full" />}>
      {children}
    </Suspense>
  );
}

// ============================================
// DYNAMIC IMPORTS AVEC LAZY LOADING
// ============================================

/**
 * Créer un composant lazy avec skeleton personnalisé
 */
export function createLazyComponent<P extends object>(
  importFn: () => Promise<{ default: ComponentType<P> }>,
  LoadingSkeleton?: ComponentType
) {
  const LazyComponent = dynamic(importFn, {
    loading: LoadingSkeleton ? () => <LoadingSkeleton /> : undefined,
    ssr: true,
  });

  return LazyComponent;
}

// ============================================
// COMPOSANTS LAZY PRÉ-CONFIGURÉS
// ============================================

/**
 * Reviews lazy - chargé uniquement quand visible
 */
export const LazyReviews = dynamic(
  () => import('@/components/ProductReviews').catch(() => ({
    default: () => <div className="text-creme/50 p-4">Avis non disponibles</div>
  })),
  {
    loading: () => <ReviewsSkeleton />,
    ssr: false, // Reviews sont interactifs, pas besoin de SSR
  }
);

/**
 * Graphique Chart.js lazy - bundle lourd
 */
export const LazyRevenueChart = dynamic(
  () => import('@/components/admin/RevenueChart').catch(() => ({
    default: () => <div className="text-creme/50 p-4">Graphique non disponible</div>
  })),
  {
    loading: () => <ChartSkeleton />,
    ssr: false,
  }
);

/**
 * Modal lazy - chargé à la demande
 */
export const LazyQuickViewModal = dynamic(
  () => import('@/components/QuickViewModal').catch(() => ({
    default: () => null
  })),
  {
    ssr: false,
  }
);

// ============================================
// INTERSECTION OBSERVER HOOK
// ============================================

import { useEffect, useRef, useState } from 'react';

/**
 * Hook pour détecter si un élément est visible dans le viewport
 */
export function useInView(options?: IntersectionObserverInit) {
  const ref = useRef<HTMLDivElement>(null);
  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect(); // Une fois visible, on arrête d'observer
        }
      },
      {
        threshold: 0.1,
        rootMargin: '100px', // Précharger 100px avant d'être visible
        ...options,
      }
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return { ref, isInView };
}

/**
 * Composant qui charge son contenu quand il devient visible
 */
export function LazyOnView({
  children,
  fallback,
  className = '',
}: {
  children: ReactNode;
  fallback?: ReactNode;
  className?: string;
}) {
  const { ref, isInView } = useInView();

  return (
    <div ref={ref} className={className}>
      {isInView ? children : (fallback || <GenericSkeleton className="h-64 w-full" />)}
    </div>
  );
}

// ============================================
// DEFER HYDRATION
// ============================================

/**
 * Composant qui diffère l'hydration jusqu'à l'interaction utilisateur
 * Améliore le TTI en réduisant le JS exécuté au chargement
 */
export function DeferHydration({
  children,
  fallback,
}: {
  children: ReactNode;
  fallback?: ReactNode;
}) {
  const [shouldHydrate, setShouldHydrate] = useState(false);

  useEffect(() => {
    // Hydrater après un petit délai ou interaction
    const timeout = setTimeout(() => setShouldHydrate(true), 100);

    const handleInteraction = () => {
      setShouldHydrate(true);
      clearTimeout(timeout);
    };

    // Hydrater immédiatement si l'utilisateur interagit
    window.addEventListener('scroll', handleInteraction, { once: true, passive: true });
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true, passive: true });

    return () => {
      clearTimeout(timeout);
      window.removeEventListener('scroll', handleInteraction);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  if (!shouldHydrate) {
    return <>{fallback || children}</>;
  }

  return <>{children}</>;
}
