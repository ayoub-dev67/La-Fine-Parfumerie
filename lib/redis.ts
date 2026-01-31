/**
 * Redis Cache avec Upstash
 * Cache distribué pour améliorer les performances
 */

import { Redis } from '@upstash/redis';

// Client Redis (lazy initialization)
let redisClient: Redis | null = null;

function getRedis(): Redis | null {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null;
  }

  if (!redisClient) {
    redisClient = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN,
    });
  }

  return redisClient;
}

/**
 * Helper pour cache avec TTL
 * Retourne les données du cache si disponibles, sinon fetch et cache
 */
export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 3600 // 1 heure par défaut
): Promise<T> {
  const redis = getRedis();

  // Si Redis non configuré, retourner directement depuis fetcher
  if (!redis) {
    return await fetcher();
  }

  try {
    // Essayer de récupérer du cache
    const cached = await redis.get<T>(key);
    if (cached !== null) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[CACHE HIT] ${key}`);
      }
      return cached;
    }

    // Si pas en cache, fetch et store
    if (process.env.NODE_ENV === 'development') {
      console.log(`[CACHE MISS] ${key}`);
    }
    const data = await fetcher();
    await redis.setex(key, ttl, data);
    return data;
  } catch (error) {
    console.error(`[CACHE ERROR] ${key}:`, error);
    // Fallback sans cache en cas d'erreur
    return await fetcher();
  }
}

/**
 * Invalidation cache par pattern
 */
export async function invalidateCache(pattern: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      if (process.env.NODE_ENV === 'development') {
        console.log(`[CACHE INVALIDATED] ${keys.length} keys (${pattern})`);
      }
    }
  } catch (error) {
    console.error(`[CACHE INVALIDATION ERROR] ${pattern}:`, error);
  }
}

/**
 * Suppression d'une clé spécifique
 */
export async function deleteCache(key: string): Promise<void> {
  const redis = getRedis();
  if (!redis) return;

  try {
    await redis.del(key);
  } catch (error) {
    console.error(`[CACHE DELETE ERROR] ${key}:`, error);
  }
}

// ============================================
// CACHE SPÉCIFIQUES PAR ENTITÉ
// ============================================

/**
 * Cache pour un produit unique
 * TTL: 1 heure
 */
export const productCache = {
  key: (id: number | string) => `product:${id}`,

  async get<T>(id: number | string): Promise<T | null> {
    const redis = getRedis();
    if (!redis) return null;
    return await redis.get<T>(this.key(id));
  },

  async set<T>(id: number | string, data: T, ttl: number = 3600): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    await redis.setex(this.key(id), ttl, data);
  },

  async invalidate(id: number | string): Promise<void> {
    await deleteCache(this.key(id));
  },
};

/**
 * Cache pour liste de produits (avec filtres)
 * TTL: 30 minutes
 */
export const productsListCache = {
  key: (filters: string) => `products:${filters}`,

  async get<T>(filters: string): Promise<T | null> {
    const redis = getRedis();
    if (!redis) return null;
    return await redis.get<T>(this.key(filters));
  },

  async set<T>(filters: string, data: T, ttl: number = 1800): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    await redis.setex(this.key(filters), ttl, data);
  },

  async invalidateAll(): Promise<void> {
    await invalidateCache('products:*');
  },
};

/**
 * Cache pour statistiques admin
 * TTL: 5 minutes (données fréquemment mises à jour)
 */
export const statsCache = {
  key: 'admin:stats',

  async get<T>(): Promise<T | null> {
    const redis = getRedis();
    if (!redis) return null;
    return await redis.get<T>(this.key);
  },

  async set<T>(data: T, ttl: number = 300): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    await redis.setex(this.key, ttl, data);
  },

  async invalidate(): Promise<void> {
    await deleteCache(this.key);
  },
};

/**
 * Cache pour catégories
 * TTL: 1 heure
 */
export const categoriesCache = {
  key: 'categories:all',

  async get<T>(): Promise<T | null> {
    const redis = getRedis();
    if (!redis) return null;
    return await redis.get<T>(this.key);
  },

  async set<T>(data: T, ttl: number = 3600): Promise<void> {
    const redis = getRedis();
    if (!redis) return;
    await redis.setex(this.key, ttl, data);
  },

  async invalidate(): Promise<void> {
    await deleteCache(this.key);
  },
};

/**
 * Vérifie si Redis est configuré et accessible
 */
export async function isRedisAvailable(): Promise<boolean> {
  const redis = getRedis();
  if (!redis) return false;

  try {
    await redis.ping();
    return true;
  } catch {
    return false;
  }
}
