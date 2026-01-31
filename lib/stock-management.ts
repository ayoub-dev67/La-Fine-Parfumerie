/**
 * Stock Management - Gestion avancée des stocks
 * Historique, alertes et ajustements
 */

import { prisma } from '@/lib/prisma';
import { StockMovement } from '@prisma/client';

// Configuration des seuils d'alerte
export const STOCK_CONFIG = {
  LOW_STOCK_THRESHOLD: 10,    // Seuil stock faible
  CRITICAL_STOCK_THRESHOLD: 3, // Seuil stock critique
  OUT_OF_STOCK_THRESHOLD: 0,   // Rupture de stock
};

export type StockAlert = {
  level: 'critical' | 'low' | 'ok';
  message: string;
  color: string;
};

/**
 * Détermine le niveau d'alerte pour un stock donné
 */
export function getStockAlert(stock: number): StockAlert {
  if (stock <= STOCK_CONFIG.OUT_OF_STOCK_THRESHOLD) {
    return { level: 'critical', message: 'Rupture de stock', color: 'red' };
  }
  if (stock <= STOCK_CONFIG.CRITICAL_STOCK_THRESHOLD) {
    return { level: 'critical', message: 'Stock critique', color: 'red' };
  }
  if (stock <= STOCK_CONFIG.LOW_STOCK_THRESHOLD) {
    return { level: 'low', message: 'Stock faible', color: 'orange' };
  }
  return { level: 'ok', message: 'Stock OK', color: 'green' };
}

/**
 * Enregistre un mouvement de stock
 */
export async function recordStockChange(params: {
  productId: number;
  quantity: number;
  type: StockMovement;
  reason?: string;
  orderId?: string;
  userId?: string;
}) {
  const { productId, quantity, type, reason, orderId, userId } = params;

  // Récupérer le produit actuel
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  });

  if (!product) {
    throw new Error(`Produit ${productId} non trouvé`);
  }

  const stockBefore = product.stock;
  const stockAfter = stockBefore + quantity;

  // Créer l'historique et mettre à jour le stock en transaction
  const [history, updatedProduct] = await prisma.$transaction([
    prisma.stockHistory.create({
      data: {
        productId,
        quantity,
        type,
        reason,
        stockBefore,
        stockAfter,
        orderId,
        userId,
      },
    }),
    prisma.product.update({
      where: { id: productId },
      data: { stock: stockAfter },
    }),
  ]);

  return { history, product: updatedProduct };
}

/**
 * Ajuste le stock d'un produit (pour inventaire manuel)
 */
export async function adjustStock(params: {
  productId: number;
  newStock: number;
  reason: string;
  userId?: string;
}) {
  const { productId, newStock, reason, userId } = params;

  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { stock: true },
  });

  if (!product) {
    throw new Error(`Produit ${productId} non trouvé`);
  }

  const quantity = newStock - product.stock;

  return recordStockChange({
    productId,
    quantity,
    type: 'ADJUSTMENT',
    reason,
    userId,
  });
}

/**
 * Récupère l'historique des mouvements de stock d'un produit
 */
export async function getStockHistory(
  productId: number,
  options?: {
    limit?: number;
    startDate?: Date;
    endDate?: Date;
    type?: StockMovement;
  }
) {
  const { limit = 50, startDate, endDate, type } = options || {};

  const where: Record<string, unknown> = { productId };

  if (type) {
    where.type = type;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) (where.createdAt as Record<string, unknown>).gte = startDate;
    if (endDate) (where.createdAt as Record<string, unknown>).lte = endDate;
  }

  return prisma.stockHistory.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

/**
 * Récupère les produits avec stock faible ou en rupture
 */
export async function getLowStockProducts(threshold?: number) {
  const limit = threshold ?? STOCK_CONFIG.LOW_STOCK_THRESHOLD;

  return prisma.product.findMany({
    where: {
      stock: { lte: limit },
    },
    orderBy: { stock: 'asc' },
    select: {
      id: true,
      name: true,
      brand: true,
      stock: true,
      image: true,
      category: true,
    },
  });
}

/**
 * Récupère les statistiques de stock globales
 */
export async function getStockStats() {
  const products = await prisma.product.findMany({
    select: { stock: true, price: true },
  });

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, p) => sum + p.stock, 0);
  const totalValue = products.reduce((sum, p) => sum + p.stock * p.price, 0);

  const outOfStock = products.filter(
    (p) => p.stock <= STOCK_CONFIG.OUT_OF_STOCK_THRESHOLD
  ).length;

  const criticalStock = products.filter(
    (p) =>
      p.stock > STOCK_CONFIG.OUT_OF_STOCK_THRESHOLD &&
      p.stock <= STOCK_CONFIG.CRITICAL_STOCK_THRESHOLD
  ).length;

  const lowStock = products.filter(
    (p) =>
      p.stock > STOCK_CONFIG.CRITICAL_STOCK_THRESHOLD &&
      p.stock <= STOCK_CONFIG.LOW_STOCK_THRESHOLD
  ).length;

  const healthyStock = products.filter(
    (p) => p.stock > STOCK_CONFIG.LOW_STOCK_THRESHOLD
  ).length;

  return {
    totalProducts,
    totalStock,
    totalValue,
    outOfStock,
    criticalStock,
    lowStock,
    healthyStock,
  };
}

/**
 * Récupère les mouvements de stock récents (tous produits)
 */
export async function getRecentStockMovements(limit: number = 20) {
  return prisma.stockHistory.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: {
      product: {
        select: { name: true, brand: true, image: true },
      },
    },
  });
}

/**
 * Enregistre une vente (diminue le stock)
 */
export async function recordSale(params: {
  productId: number;
  quantity: number;
  orderId: string;
}) {
  return recordStockChange({
    productId: params.productId,
    quantity: -params.quantity, // Négatif car c'est une sortie
    type: 'SALE',
    orderId: params.orderId,
  });
}

/**
 * Enregistre un retour (augmente le stock)
 */
export async function recordReturn(params: {
  productId: number;
  quantity: number;
  orderId: string;
  reason?: string;
}) {
  return recordStockChange({
    productId: params.productId,
    quantity: params.quantity, // Positif car c'est une entrée
    type: 'RETURN',
    orderId: params.orderId,
    reason: params.reason,
  });
}

/**
 * Enregistre un réapprovisionnement
 */
export async function recordRestock(params: {
  productId: number;
  quantity: number;
  reason?: string;
  userId?: string;
}) {
  return recordStockChange({
    productId: params.productId,
    quantity: params.quantity,
    type: 'RESTOCK',
    reason: params.reason,
    userId: params.userId,
  });
}

/**
 * Labels pour les types de mouvement
 */
export const MOVEMENT_LABELS: Record<StockMovement, { label: string; emoji: string; color: string }> = {
  SALE: { label: 'Vente', emoji: '🛒', color: 'text-blue-400' },
  RETURN: { label: 'Retour', emoji: '↩️', color: 'text-green-400' },
  RESTOCK: { label: 'Réappro', emoji: '📦', color: 'text-emerald-400' },
  ADJUSTMENT: { label: 'Ajustement', emoji: '✏️', color: 'text-yellow-400' },
  DAMAGE: { label: 'Dommage', emoji: '💔', color: 'text-red-400' },
  TRANSFER: { label: 'Transfert', emoji: '🔄', color: 'text-purple-400' },
};
