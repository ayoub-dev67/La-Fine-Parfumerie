/**
 * Accessibility Utilities
 * Helper functions for focus management, keyboard navigation, and screen readers
 */

/**
 * Focus Management
 */

// Store the last focused element before opening a modal
let lastFocusedElement: HTMLElement | null = null;

export function saveFocus() {
  lastFocusedElement = document.activeElement as HTMLElement;
}

export function restoreFocus() {
  if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') {
    lastFocusedElement.focus();
  }
}

// Trap focus within a container (for modals)
export function trapFocus(container: HTMLElement) {
  const focusableElements = getFocusableElements(container);
  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    }
  }

  container.addEventListener('keydown', handleKeyDown);

  // Focus first element
  firstElement?.focus();

  // Return cleanup function
  return () => {
    container.removeEventListener('keydown', handleKeyDown);
  };
}

// Get all focusable elements within a container
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const focusableSelectors = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors)) as HTMLElement[];
}

/**
 * Keyboard Navigation Helpers
 */

// Handle arrow key navigation for lists/grids
export function handleArrowKeyNavigation(
  e: KeyboardEvent,
  items: HTMLElement[],
  currentIndex: number,
  options: { wrap?: boolean; horizontal?: boolean } = {}
): number {
  const { wrap = true, horizontal = false } = options;

  let newIndex = currentIndex;

  switch (e.key) {
    case 'ArrowDown':
    case (horizontal ? 'ArrowRight' : ''):
      e.preventDefault();
      newIndex = currentIndex + 1;
      if (newIndex >= items.length) {
        newIndex = wrap ? 0 : items.length - 1;
      }
      break;

    case 'ArrowUp':
    case (horizontal ? 'ArrowLeft' : ''):
      e.preventDefault();
      newIndex = currentIndex - 1;
      if (newIndex < 0) {
        newIndex = wrap ? items.length - 1 : 0;
      }
      break;

    case 'Home':
      e.preventDefault();
      newIndex = 0;
      break;

    case 'End':
      e.preventDefault();
      newIndex = items.length - 1;
      break;
  }

  items[newIndex]?.focus();
  return newIndex;
}

// Check if Enter or Space was pressed (for button-like elements)
export function isActivationKey(e: KeyboardEvent): boolean {
  return e.key === 'Enter' || e.key === ' ';
}

// Handle Escape key to close modals/dropdowns
export function onEscapeKey(callback: () => void) {
  return (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      callback();
    }
  };
}

/**
 * Screen Reader Announcements
 */

// Create or get the live region element
function getLiveRegion(): HTMLElement {
  let liveRegion = document.getElementById('sr-live-region');

  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'sr-live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    liveRegion.style.cssText = `
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      white-space: nowrap;
      border: 0;
    `;
    document.body.appendChild(liveRegion);
  }

  return liveRegion;
}

// Announce a message to screen readers
export function announce(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const liveRegion = getLiveRegion();
  liveRegion.setAttribute('aria-live', priority);

  // Clear and re-add to trigger announcement
  liveRegion.textContent = '';
  requestAnimationFrame(() => {
    liveRegion.textContent = message;
  });
}

// Announce route change
export function announceRouteChange(title: string) {
  announce(`Navigué vers ${title}`, 'polite');
}

// Announce loading state
export function announceLoading(isLoading: boolean) {
  announce(isLoading ? 'Chargement en cours...' : 'Chargement terminé', 'polite');
}

// Announce errors
export function announceError(message: string) {
  announce(`Erreur: ${message}`, 'assertive');
}

// Announce success
export function announceSuccess(message: string) {
  announce(message, 'polite');
}

/**
 * Color Contrast Utilities
 */

// Calculate relative luminance
function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

// Parse hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

// Calculate contrast ratio between two colors
export function getContrastRatio(color1: string, color2: string): number {
  const rgb1 = hexToRgb(color1);
  const rgb2 = hexToRgb(color2);

  if (!rgb1 || !rgb2) return 0;

  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);

  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);

  return (lighter + 0.05) / (darker + 0.05);
}

// Check if contrast meets WCAG AA standards
export function meetsContrastAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 3 : ratio >= 4.5;
}

// Check if contrast meets WCAG AAA standards
export function meetsContrastAAA(
  foreground: string,
  background: string,
  isLargeText = false
): boolean {
  const ratio = getContrastRatio(foreground, background);
  return isLargeText ? ratio >= 4.5 : ratio >= 7;
}

/**
 * Reduced Motion
 */

// Check if user prefers reduced motion
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * ARIA Helpers
 */

// Generate unique ID for ARIA relationships
let idCounter = 0;
export function generateAriaId(prefix = 'aria'): string {
  return `${prefix}-${++idCounter}`;
}

// Create describedby/labelledby attributes
export function ariaDescribedBy(...ids: (string | undefined)[]): string | undefined {
  const validIds = ids.filter(Boolean);
  return validIds.length > 0 ? validIds.join(' ') : undefined;
}

/**
 * Visibility Classes
 */

// CSS classes for visually hidden content (still accessible to screen readers)
export const srOnly = `
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`;

// Tailwind class for sr-only
export const srOnlyClass = 'sr-only';

/**
 * Focus Visible Polyfill Check
 */
export function supportsFocusVisible(): boolean {
  if (typeof window === 'undefined') return true;

  try {
    document.querySelector(':focus-visible');
    return true;
  } catch {
    return false;
  }
}
