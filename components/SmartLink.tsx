'use client';

/**
 * SmartLink - Prefetching Intelligent
 * Prefetch les pages après un délai de hover pour réduire le temps de navigation
 */

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, ReactNode, ComponentProps } from 'react';

interface SmartLinkProps extends Omit<ComponentProps<typeof Link>, 'prefetch'> {
  /** Délai en ms avant le prefetch (défaut: 150ms) */
  prefetchDelay?: number;
  /** Désactiver le prefetch intelligent */
  disableSmartPrefetch?: boolean;
  children: ReactNode;
}

export default function SmartLink({
  href,
  children,
  prefetchDelay = 150,
  disableSmartPrefetch = false,
  ...props
}: SmartLinkProps) {
  const router = useRouter();
  const [isPrefetched, setIsPrefetched] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Prefetch intelligent au hover
  const handleMouseEnter = () => {
    if (disableSmartPrefetch || isPrefetched) return;

    timeoutRef.current = setTimeout(() => {
      const url = typeof href === 'string' ? href : href.pathname || '';
      router.prefetch(url);
      setIsPrefetched(true);
    }, prefetchDelay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <Link
      href={href}
      prefetch={false} // Désactiver le prefetch automatique de Next.js
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      {...props}
    >
      {children}
    </Link>
  );
}

/**
 * Hook pour prefetch programmatique
 */
export function usePrefetch() {
  const router = useRouter();
  const prefetchedUrls = useRef<Set<string>>(new Set());

  const prefetch = (url: string) => {
    if (prefetchedUrls.current.has(url)) return;

    router.prefetch(url);
    prefetchedUrls.current.add(url);
  };

  return { prefetch };
}
