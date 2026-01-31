/**
 * MIDDLEWARE NEXTAUTH + SÉCURITÉ
 * Protection des routes et headers de sécurité
 *
 * Fonctionnalités:
 * - Protection des routes nécessitant une authentification
 * - Headers de sécurité (CSP, HSTS, etc.)
 * - Protection CSRF implicite via NextAuth
 *
 * Routes protégées:
 * - /checkout/* : Nécessite connexion pour commander
 * - /orders/* : Historique des commandes
 * - /admin/* : Administration (rôle ADMIN requis)
 * - /account/* : Paramètres du compte
 */

import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

// Headers de sécurité à appliquer
const securityHeaders = {
  // DNS Prefetch Control
  "X-DNS-Prefetch-Control": "on",

  // Strict Transport Security (HSTS) - 2 ans
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Clickjacking protection - DENY pour plus de sécurité
  "X-Frame-Options": "DENY",

  // XSS Protection (legacy mais toujours utile)
  "X-XSS-Protection": "1; mode=block",

  // Referrer Policy
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // Permissions Policy - désactiver les APIs sensibles
  "Permissions-Policy":
    "camera=(), microphone=(), geolocation=(), interest-cohort=()",

  // Content Security Policy
  "Content-Security-Policy": [
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
  ].join("; "),
};

/**
 * Applique les headers de sécurité à une réponse
 */
function applySecurityHeaders(response: NextResponse): NextResponse {
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });
  return response;
}

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const userRole = req.auth?.user?.role;

  // Routes protégées nécessitant une authentification
  const protectedRoutes = ["/checkout", "/orders", "/account"];
  const isProtectedRoute = protectedRoutes.some((route) =>
    nextUrl.pathname.startsWith(route)
  );

  // Routes admin nécessitant le rôle ADMIN
  const isAdminRoute = nextUrl.pathname.startsWith("/admin");

  // Redirection si non connecté sur route protégée
  if (isProtectedRoute && !isLoggedIn) {
    const callbackUrl = encodeURIComponent(nextUrl.pathname + nextUrl.search);
    const response = NextResponse.redirect(
      new URL(`/auth/signin?callbackUrl=${callbackUrl}`, nextUrl)
    );
    return applySecurityHeaders(response);
  }

  // Redirection si non admin sur route admin
  if (isAdminRoute) {
    if (!isLoggedIn) {
      const response = NextResponse.redirect(new URL("/auth/signin", nextUrl));
      return applySecurityHeaders(response);
    }
    if (userRole !== "ADMIN") {
      // Utilisateur connecté mais pas admin
      const response = NextResponse.redirect(new URL("/", nextUrl));
      return applySecurityHeaders(response);
    }
  }

  // Routes auth : rediriger vers accueil si déjà connecté
  const authRoutes = ["/auth/signin", "/auth/signup"];
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  if (isAuthRoute && isLoggedIn) {
    const response = NextResponse.redirect(new URL("/", nextUrl));
    return applySecurityHeaders(response);
  }

  // Réponse normale avec headers de sécurité
  const response = NextResponse.next();
  return applySecurityHeaders(response);
});

// Configuration du matcher
export const config = {
  matcher: [
    // Routes à protéger
    "/checkout/:path*",
    "/orders/:path*",
    "/account/:path*",
    "/admin/:path*",
    // Routes auth (pour redirection si connecté)
    "/auth/signin",
    "/auth/signup",
  ],
};
