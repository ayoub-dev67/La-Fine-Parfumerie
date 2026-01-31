"use client";

/**
 * Skip Link - Accessibilité
 * Permet aux utilisateurs de clavier de sauter directement au contenu principal
 */
export default function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100]
                 focus:px-6 focus:py-3 focus:bg-or focus:text-noir focus:font-semibold
                 focus:outline-none focus:ring-2 focus:ring-or-light"
    >
      Aller au contenu principal
    </a>
  );
}
