/**
 * Recommandations Produits - La Fine Parfumerie
 * Algorithme de recommandation basé sur l'historique d'achat
 */

import { prisma } from './prisma';
import { getCached } from './redis';

interface Product {
  id: number;
  name: string;
  brand: string | null;
  image: string;
  price: number;
  category: string;
  volume: string | null;
  stock: number;
  isBestSeller: boolean;
  isFeatured: boolean;
  isNew: boolean;
}

/**
 * Récupère les recommandations personnalisées pour un utilisateur
 */
export async function getRecommendations(
  userId?: string,
  limit: number = 6
): Promise<Product[]> {
  const cacheKey = `recommendations:${userId || 'anonymous'}:${limit}`;

  return getCached(
    cacheKey,
    async () => {
      // Si pas d'utilisateur connecté, retourner les bestsellers
      if (!userId) {
        return getBestSellers(limit);
      }

      // Récupérer l'historique d'achats
      const orders = await prisma.order.findMany({
        where: {
          userId,
          status: { in: ['PAID', 'SHIPPED', 'DELIVERED'] },
        },
        include: {
          items: {
            include: {
              product: {
                select: {
                  id: true,
                  category: true,
                  brand: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      });

      // Si pas d'historique, retourner les nouveautés
      if (orders.length === 0) {
        return getNewArrivals(limit);
      }

      // Extraire catégories et marques achetées
      const purchasedProducts = orders.flatMap((o) =>
        o.items.map((i) => i.product)
      );
      const categories = Array.from(new Set(purchasedProducts.map((p) => p.category)));
      const brands = Array.from(new Set(purchasedProducts.map((p) => p.brand).filter(Boolean))) as string[];
      const purchasedIds = purchasedProducts.map((p) => p.id);

      // Recommander produits de même catégorie/marque, pas encore achetés
      const recommended = await prisma.product.findMany({
        where: {
          AND: [
            {
              OR: [
                { category: { in: categories } },
                { brand: { in: brands } },
              ],
            },
            { id: { notIn: purchasedIds } },
            { stock: { gt: 0 } },
          ],
        },
        select: {
          id: true,
          name: true,
          brand: true,
          image: true,
          price: true,
          category: true,
          volume: true,
          stock: true,
          isBestSeller: true,
          isFeatured: true,
          isNew: true,
        },
        orderBy: [
          { isBestSeller: 'desc' },
          { isFeatured: 'desc' },
        ],
        take: limit,
      });

      // Si pas assez de recommandations, compléter avec des bestsellers
      if (recommended.length < limit) {
        const bestSellers = await getBestSellers(
          limit - recommended.length,
          [...purchasedIds, ...recommended.map((r) => r.id)]
        );
        return [...recommended, ...bestSellers] as Product[];
      }

      return recommended as Product[];
    },
    600 // Cache 10 minutes
  );
}

/**
 * Récupère les produits fréquemment achetés ensemble
 */
export async function getFrequentlyBoughtTogether(
  productId: number,
  limit: number = 3
): Promise<Product[]> {
  const cacheKey = `fbt:${productId}:${limit}`;

  return getCached(
    cacheKey,
    async () => {
      // Trouver les commandes contenant ce produit
      const orderItems = await prisma.orderItem.findMany({
        where: { productId },
        select: { orderId: true },
        distinct: ['orderId'],
        take: 100,
      });

      const orderIds = orderItems.map((o) => o.orderId);

      if (orderIds.length === 0) {
        // Pas de commandes, retourner produits similaires
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: { category: true, brand: true },
        });

        if (!product) return [];

        return await prisma.product.findMany({
          where: {
            AND: [
              { id: { not: productId } },
              {
                OR: [
                  { category: product.category },
                  { brand: product.brand },
                ],
              },
              { stock: { gt: 0 } },
            ],
          },
          select: {
            id: true,
            name: true,
            brand: true,
            image: true,
            price: true,
            category: true,
            volume: true,
            stock: true,
            isBestSeller: true,
            isFeatured: true,
            isNew: true,
          },
          orderBy: { isBestSeller: 'desc' },
          take: limit,
        }) as Product[];
      }

      // Trouver les autres produits dans ces commandes
      const coProducts = await prisma.orderItem.groupBy({
        by: ['productId'],
        where: {
          AND: [
            { orderId: { in: orderIds } },
            { productId: { not: productId } },
          ],
        },
        _count: { productId: true },
        orderBy: { _count: { productId: 'desc' } },
        take: limit,
      });

      if (coProducts.length === 0) return [];

      // Récupérer les produits
      const productIds = coProducts.map((c) => c.productId);
      const products = await prisma.product.findMany({
        where: {
          id: { in: productIds },
          stock: { gt: 0 },
        },
        select: {
          id: true,
          name: true,
          brand: true,
          image: true,
          price: true,
          category: true,
          volume: true,
          stock: true,
          isBestSeller: true,
          isFeatured: true,
          isNew: true,
        },
      });

      // Trier par fréquence d'achat ensemble
      const orderedProducts = productIds
        .map((id) => products.find((p) => p.id === id))
        .filter(Boolean) as Product[];

      return orderedProducts;
    },
    1800 // Cache 30 minutes
  );
}

/**
 * Récupère les produits similaires (même catégorie/marque)
 */
export async function getSimilarProducts(
  productId: number,
  limit: number = 4
): Promise<Product[]> {
  const cacheKey = `similar:${productId}:${limit}`;

  return getCached(
    cacheKey,
    async () => {
      const product = await prisma.product.findUnique({
        where: { id: productId },
        select: { category: true, brand: true, price: true },
      });

      if (!product) return [];

      // Produits dans la même gamme de prix (±30%)
      const minPrice = product.price * 0.7;
      const maxPrice = product.price * 1.3;

      return await prisma.product.findMany({
        where: {
          AND: [
            { id: { not: productId } },
            {
              OR: [
                { category: product.category },
                { brand: product.brand },
              ],
            },
            { price: { gte: minPrice, lte: maxPrice } },
            { stock: { gt: 0 } },
          ],
        },
        select: {
          id: true,
          name: true,
          brand: true,
          image: true,
          price: true,
          category: true,
          volume: true,
          stock: true,
          isBestSeller: true,
          isFeatured: true,
          isNew: true,
        },
        orderBy: [
          { isBestSeller: 'desc' },
          { isFeatured: 'desc' },
        ],
        take: limit,
      }) as Product[];
    },
    1800 // Cache 30 minutes
  );
}

/**
 * Récupère les bestsellers
 */
async function getBestSellers(
  limit: number,
  excludeIds: number[] = []
): Promise<Product[]> {
  return await prisma.product.findMany({
    where: {
      isBestSeller: true,
      id: { notIn: excludeIds },
      stock: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      brand: true,
      image: true,
      price: true,
      category: true,
      volume: true,
      stock: true,
      isBestSeller: true,
      isFeatured: true,
      isNew: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  }) as Product[];
}

/**
 * Récupère les nouveautés
 */
async function getNewArrivals(limit: number): Promise<Product[]> {
  return await prisma.product.findMany({
    where: {
      isNew: true,
      stock: { gt: 0 },
    },
    select: {
      id: true,
      name: true,
      brand: true,
      image: true,
      price: true,
      category: true,
      volume: true,
      stock: true,
      isBestSeller: true,
      isFeatured: true,
      isNew: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  }) as Product[];
}
