const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Activer la compression gzip
  compress: true,

  // Masquer le header X-Powered-By
  poweredByHeader: false,

  // Mode strict React
  reactStrictMode: true,

  // Optimisations expérimentales pour performance
  experimental: {
    // Optimiser les imports de packages
    optimizePackageImports: ['framer-motion', 'lucide-react', 'recharts'],
  },

  // Compiler certains modules en TypeScript strict
  typescript: {
    // Ignorer les erreurs de build en production (déjà vérifiées en CI)
    ignoreBuildErrors: process.env.CI === 'true' ? false : false,
  },

  // Configuration des images optimisées
  images: {
    remotePatterns: [
      // Unsplash - Photos gratuites haute qualité
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Google - Avatars utilisateurs OAuth
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      // Développement local
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      // Pexels - Photos gratuites
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
      },
      // Pixabay - Photos gratuites
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      // Cloudinary - CDN images populaire
      {
        protocol: 'https',
        hostname: '*.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      // Imgix - CDN images
      {
        protocol: 'https',
        hostname: '*.imgix.net',
      },
      // Placeholder images pour tests
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
    ],
    // Formats modernes pour optimisation
    formats: ['image/avif', 'image/webp'],
    // Tailles d'images optimisées
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers de sécurité
  async headers() {
    return [
      {
        // Appliquer à toutes les routes
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
      {
        // Headers spécifiques API
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
    ];
  },
};

// Configuration Sentry
const sentryWebpackPluginOptions = {
  // Silence les logs pendant le build
  silent: true,

  // Désactiver en dev pour vitesse
  disableServerWebpackPlugin: process.env.NODE_ENV === "development",
  disableClientWebpackPlugin: process.env.NODE_ENV === "development",

  // Masquer les source maps en production
  hideSourceMaps: true,

  // Tunnel les requêtes Sentry pour éviter les bloqueurs
  tunnelRoute: "/monitoring-tunnel",

  // Automatiquement instrumenter
  autoInstrumentServerFunctions: true,
  autoInstrumentMiddleware: true,
  autoInstrumentAppDirectory: true,
};

// Exporter avec ou sans Sentry selon la config
module.exports = process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, sentryWebpackPluginOptions)
  : nextConfig;
