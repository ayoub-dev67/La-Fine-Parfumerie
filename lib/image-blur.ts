/**
 * Image Blur Placeholder
 * Génère des placeholders pour le lazy loading des images
 */

/**
 * Placeholder noir simple (pour fond sombre)
 */
export const darkBlurDataURL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0iIzBhMGEwYSIvPjwvc3ZnPg==';

/**
 * Placeholder avec dégradé or/noir (thème luxe)
 */
export const luxuryBlurDataURL =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48bGluZWFyR3JhZGllbnQgaWQ9ImciIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPjxzdG9wIG9mZnNldD0iMCUiIHN0b3AtY29sb3I9IiMxYTFhMWEiLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0b3AtY29sb3I9IiMwYTBhMGEiLz48L2xpbmVhckdyYWRpZW50PjwvZGVmcz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgZmlsbD0idXJsKCNnKSIvPjwvc3ZnPg==';

/**
 * Placeholder shimmer animé (pour skeleton loading)
 */
export const shimmerBlurDataURL = `data:image/svg+xml;base64,${Buffer.from(`
  <svg width="400" height="400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#0a0a0a">
          <animate attributeName="offset" values="-1; 1" dur="2s" repeatCount="indefinite"/>
        </stop>
        <stop offset="50%" stop-color="#1a1a1a">
          <animate attributeName="offset" values="0; 2" dur="2s" repeatCount="indefinite"/>
        </stop>
        <stop offset="100%" stop-color="#0a0a0a">
          <animate attributeName="offset" values="1; 3" dur="2s" repeatCount="indefinite"/>
        </stop>
      </linearGradient>
    </defs>
    <rect width="400" height="400" fill="url(#shimmer)"/>
  </svg>
`).toString('base64')}`;

/**
 * Retourne le blur placeholder par défaut
 */
export function getBlurDataURL(): string {
  return darkBlurDataURL;
}

/**
 * Génère un placeholder de couleur spécifique
 */
export function getColorBlurDataURL(color: string = '#0a0a0a'): string {
  const svg = `<svg width="400" height="400" xmlns="http://www.w3.org/2000/svg"><rect width="400" height="400" fill="${color}"/></svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}
