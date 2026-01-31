/**
 * MIDDLEWARE EDGE-COMPATIBLE - SÉCURITÉ HEADERS UNIQUEMENT
 *
 * IMPORTANT: Ce middleware est optimisé pour Vercel Edge Runtime (< 1MB)
 * - Protection auth déplacée vers les pages individuelles (getServerSession)
 * - Pas d'import Prisma/NextAuth pour rester sous la limite de taille
 *
 * Fonctionnalités:
 * - Headers de sécurité (CSP, HSTS, X-Frame-Options, etc.)
 * - Compatible Edge Runtime
 * - Léger et performant
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Headers de sécurité à appliquer sur toutes les requêtes
const securityHeaders = {
  // DNS Prefetch Control
  'X-DNS-Prefetch-Control': 'on',

  // Strict Transport Security (HSTS) - 2 ans
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',

  // Prevent MIME type sniffing
  'X-Content-Type-Options': 'nosniff',

  // Clickjacking protection - DENY pour plus de sécurité
  'X-Frame-Options': 'DENY',

  // XSS Protection (legacy mais toujours utile)
  'X-XSS-Protection': '1; mode=block',

  // Referrer Policy
  'Referrer-Policy': 'strict-origin-when-cross-origin',

  // Permissions Policy - désactiver les APIs sensibles
  'Permissions-Policy':
    'camera=(), microphone=(), geolocation=(), interest-cohort=()',

  // Content Security Policy
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: https: blob:",
    "font-src 'self' data: https://fonts.gstatic.com",
    "connect-src 'self' https://api.stripe.com https://*.neon.tech wss://*.neon.tech",
    "frame-src 'self' https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; '),
};

export function middleware(_request: NextRequest) {
  // Créer la réponse
  const response = NextResponse.next();

  // Appliquer les headers de sécurité
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

// Matcher: appliquer sur toutes les routes sauf les fichiers statiques
export const config = {
  matcher: [
    /*
     * Match toutes les routes SAUF:
     * - _next/static (fichiers statiques)
     * - _next/image (optimisation d'images)
     * - favicon.ico, autres assets
     * - fichiers avec extensions (svg, png, jpg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
