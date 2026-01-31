/**
 * Lighthouse CI Configuration
 * Automated performance and accessibility testing
 */

module.exports = {
  ci: {
    collect: {
      // Use static server for testing
      staticDistDir: '.next',
      // Or start the dev server
      startServerCommand: 'npm run start',
      startServerReadyPattern: 'Ready',
      startServerReadyTimeout: 30000,
      // URLs to test
      url: [
        'http://localhost:3000/',
        'http://localhost:3000/boutique',
        'http://localhost:3000/products/1',
      ],
      // Number of runs for averaging
      numberOfRuns: 3,
      // Settings
      settings: {
        preset: 'desktop',
        // Throttling for realistic mobile
        throttling: {
          cpuSlowdownMultiplier: 1,
        },
      },
    },
    assert: {
      // Use recommended preset as baseline
      preset: 'lighthouse:recommended',
      // Custom assertions
      assertions: {
        // Performance (target: 90+)
        'categories:performance': ['error', { minScore: 0.9 }],

        // Accessibility (target: 95+)
        'categories:accessibility': ['error', { minScore: 0.95 }],

        // Best Practices (target: 90+)
        'categories:best-practices': ['error', { minScore: 0.9 }],

        // SEO (target: 95+)
        'categories:seo': ['error', { minScore: 0.95 }],

        // PWA checks
        'categories:pwa': ['warn', { minScore: 0.7 }],

        // Specific performance metrics
        'first-contentful-paint': ['warn', { maxNumericValue: 2000 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 3000 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
        'total-blocking-time': ['warn', { maxNumericValue: 300 }],
        'speed-index': ['warn', { maxNumericValue: 3500 }],

        // Accessibility specifics (informational)
        'color-contrast': 'off', // Handled manually
        'image-alt': 'error',
        'label': 'error',
        'link-name': 'error',
        'button-name': 'error',

        // Best practices specifics
        'no-vulnerable-libraries': 'warn',
        'js-libraries': 'off',

        // SEO specifics
        'meta-description': 'error',
        'document-title': 'error',
        'http-status-code': 'error',
      },
    },
    upload: {
      // Upload to temporary public storage (for CI)
      target: 'temporary-public-storage',
    },
  },
};
