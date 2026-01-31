'use client';

/**
 * Accessibility Hooks
 * React hooks for common accessibility patterns
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import {
  saveFocus,
  restoreFocus,
  trapFocus,
  announce,
  prefersReducedMotion,
  generateAriaId,
} from '@/lib/accessibility';

/**
 * Hook for managing focus trap in modals/dialogs
 */
export function useFocusTrap(isActive: boolean) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    saveFocus();
    const cleanup = trapFocus(containerRef.current);

    return () => {
      cleanup();
      restoreFocus();
    };
  }, [isActive]);

  return containerRef;
}

/**
 * Hook for handling Escape key to close modals/menus
 */
export function useEscapeKey(callback: () => void, isActive = true) {
  useEffect(() => {
    if (!isActive) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        callback();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [callback, isActive]);
}

/**
 * Hook for click outside detection
 */
export function useClickOutside<T extends HTMLElement>(
  callback: () => void,
  isActive = true
) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!isActive) return;

    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        callback();
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [callback, isActive]);

  return ref;
}

/**
 * Hook for managing aria-live announcements
 */
export function useAnnounce() {
  const announcePolite = useCallback((message: string) => {
    announce(message, 'polite');
  }, []);

  const announceAssertive = useCallback((message: string) => {
    announce(message, 'assertive');
  }, []);

  return { announcePolite, announceAssertive };
}

/**
 * Hook for reduced motion preference
 */
export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    setReducedMotion(prefersReducedMotion());

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return reducedMotion;
}

/**
 * Hook for generating unique ARIA IDs
 */
export function useAriaId(prefix = 'aria'): string {
  const [id] = useState(() => generateAriaId(prefix));
  return id;
}

/**
 * Hook for managing roving tabindex in lists/menus
 */
export function useRovingTabIndex<T extends HTMLElement>(
  items: T[],
  initialIndex = 0
) {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      let newIndex = activeIndex;

      switch (e.key) {
        case 'ArrowDown':
        case 'ArrowRight':
          e.preventDefault();
          newIndex = (activeIndex + 1) % items.length;
          break;
        case 'ArrowUp':
        case 'ArrowLeft':
          e.preventDefault();
          newIndex = (activeIndex - 1 + items.length) % items.length;
          break;
        case 'Home':
          e.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          e.preventDefault();
          newIndex = items.length - 1;
          break;
        default:
          return;
      }

      setActiveIndex(newIndex);
      items[newIndex]?.focus();
    },
    [activeIndex, items]
  );

  const getTabIndex = useCallback(
    (index: number) => (index === activeIndex ? 0 : -1),
    [activeIndex]
  );

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
    getTabIndex,
  };
}

/**
 * Hook for skip link functionality
 */
export function useSkipLink() {
  const skipToMain = useCallback(() => {
    const main = document.getElementById('main-content');
    if (main) {
      main.tabIndex = -1;
      main.focus();
      // Reset tabindex after focus
      setTimeout(() => {
        main.removeAttribute('tabindex');
      }, 100);
    }
  }, []);

  return { skipToMain };
}

/**
 * Hook for managing dialog/modal accessibility
 */
export function useDialog(isOpen: boolean, onClose: () => void) {
  const dialogRef = useFocusTrap(isOpen);

  useEscapeKey(onClose, isOpen);

  // Prevent body scroll when dialog is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  const dialogProps = {
    role: 'dialog' as const,
    'aria-modal': true,
    ref: dialogRef,
  };

  return { dialogRef, dialogProps };
}

/**
 * Hook for form field accessibility
 */
export function useFormField(hasError?: boolean, errorMessage?: string) {
  const fieldId = useAriaId('field');
  const errorId = useAriaId('error');
  const descriptionId = useAriaId('description');

  const fieldProps = {
    id: fieldId,
    'aria-invalid': hasError || undefined,
    'aria-describedby': hasError ? errorId : undefined,
  };

  const errorProps = {
    id: errorId,
    role: 'alert' as const,
    'aria-live': 'polite' as const,
  };

  const labelProps = {
    htmlFor: fieldId,
  };

  return {
    fieldId,
    errorId,
    descriptionId,
    fieldProps,
    errorProps,
    labelProps,
  };
}
