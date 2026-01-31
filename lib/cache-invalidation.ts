/**
 * Cache Invalidation Helpers
 * Fonctions pour invalider le cache lors des mutations
 */

import {
  invalidateCache,
  productCache,
  productsListCache,
  statsCache,
  categoriesCache,
} from './redis';

/**
 * Invalide le cache d'un produit spécifique
 * À appeler lors de: UPDATE, DELETE produit
 */
export async function invalidateProductCache(productId: number | string): Promise<void> {
  await Promise.all([
    productCache.invalidate(productId),
    productsListCache.invalidateAll(),
  ]);
}

/**
 * Invalide tout le cache produits
 * À appeler lors de: création produit, import bulk
 */
export async function invalidateAllProductsCache(): Promise<void> {
  await Promise.all([
    invalidateCache('product:*'),
    productsListCache.invalidateAll(),
  ]);
}

/**
 * Invalide le cache des commandes/stats
 * À appeler lors de: nouvelle commande, mise à jour statut
 */
export async function invalidateOrderCache(): Promise<void> {
  await Promise.all([
    statsCache.invalidate(),
    invalidateCache('admin:*'),
  ]);
}

/**
 * Invalide le cache des catégories
 * À appeler lors de: ajout/modification catégorie
 */
export async function invalidateCategoriesCache(): Promise<void> {
  await categoriesCache.invalidate();
}

/**
 * Invalide tout le cache (reset complet)
 * À utiliser avec précaution
 */
export async function invalidateAllCache(): Promise<void> {
  await invalidateCache('*');
}
