/**
 * RATE LIMITING - Protection contre les abus
 *
 * Utilise LRU Cache pour une gestion efficace de la mémoire.
 *
 * @security Limite le nombre de requêtes par IP pour éviter:
 * - Les attaques par force brute
 * - Les abus d'API
 * - La surcharge serveur
 *
 * NOTE: Pour la production avec plusieurs instances,
 * utiliser Upstash Redis (@upstash/ratelimit)
 */

import { LRUCache } from "lru-cache";

// Configuration par défaut
const DEFAULT_WINDOW_MS = 60 * 1000; // 1 minute
const DEFAULT_MAX_REQUESTS = 5; // 5 requêtes par fenêtre

// Types pour le cache
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

// Store LRU Cache optimisé
// - max: limite le nombre d'entrées (évite memory leak)
// - ttl: nettoyage automatique des entrées expirées
const requestStore = new LRUCache<string, RateLimitEntry>({
  max: 10000, // Maximum 10k IPs suivies
  ttl: 15 * 60 * 1000, // TTL max de 15 minutes (fenêtre auth)
  ttlAutopurge: true, // Nettoyage automatique
  updateAgeOnGet: false, // Ne pas rafraîchir le TTL à chaque lecture
  allowStale: false, // Pas d'entrées périmées
});

export interface RateLimitConfig {
  windowMs?: number; // Durée de la fenêtre en ms
  maxRequests?: number; // Nombre max de requêtes par fenêtre
  keyPrefix?: string; // Préfixe pour différencier les routes
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
  retryAfter?: number; // Secondes avant de réessayer
}

/**
 * Vérifie si une requête est autorisée selon le rate limit
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = {}
): RateLimitResult {
  const {
    windowMs = DEFAULT_WINDOW_MS,
    maxRequests = DEFAULT_MAX_REQUESTS,
    keyPrefix = "default",
  } = config;

  const key = `${keyPrefix}:${identifier}`;
  const now = Date.now();

  // Récupérer ou créer l'entrée
  let entry = requestStore.get(key);

  if (!entry || entry.resetTime < now) {
    // Nouvelle fenêtre
    entry = {
      count: 0,
      resetTime: now + windowMs,
    };
  }

  // Vérifier si la limite est atteinte
  if (entry.count >= maxRequests) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
    return {
      allowed: false,
      remaining: 0,
      resetTime: entry.resetTime,
      retryAfter,
    };
  }

  // Incrémenter le compteur
  entry.count++;
  requestStore.set(key, entry);

  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    resetTime: entry.resetTime,
  };
}

/**
 * Extrait l'IP d'une requête Next.js
 */
export function getClientIP(request: Request): string {
  // Headers standards pour les proxies
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    // Prendre la première IP (client original)
    return forwarded.split(",")[0].trim();
  }

  const realIP = request.headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  // Fallback (ne fonctionne pas toujours avec Next.js)
  return "unknown";
}

/**
 * Configuration prédéfinie pour les routes sensibles
 */
export const RATE_LIMIT_CONFIGS = {
  // Checkout: 5 requêtes par minute (évite le spam de commandes)
  checkout: {
    windowMs: 60 * 1000,
    maxRequests: 5,
    keyPrefix: "checkout",
  },

  // Webhook: plus permissif (Stripe peut retry)
  webhook: {
    windowMs: 60 * 1000,
    maxRequests: 100,
    keyPrefix: "webhook",
  },

  // API générale: 30 requêtes par minute
  api: {
    windowMs: 60 * 1000,
    maxRequests: 30,
    keyPrefix: "api",
  },

  // Auth: très restrictif (anti-bruteforce)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5,
    keyPrefix: "auth",
  },

  // Search: modéré
  search: {
    windowMs: 60 * 1000,
    maxRequests: 20,
    keyPrefix: "search",
  },

  // Admin: modéré mais surveillé
  admin: {
    windowMs: 60 * 1000,
    maxRequests: 60,
    keyPrefix: "admin",
  },
} as const;

/**
 * Crée une réponse 429 avec headers appropriés
 */
export function rateLimitResponse(result: RateLimitResult): Response {
  return new Response(
    JSON.stringify({
      error: "Too Many Requests",
      message: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
      retryAfter: result.retryAfter,
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": String(result.retryAfter || 60),
        "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(result.resetTime),
      },
    }
  );
}
