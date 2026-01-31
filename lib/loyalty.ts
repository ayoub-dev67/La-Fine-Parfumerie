/**
 * Programme de Fidélité - La Fine Parfumerie
 * Gestion des points, tiers et récompenses
 */

import { prisma } from './prisma';
import { LoyaltyTier, PointsReason } from '@prisma/client';

// ============================================
// CONFIGURATION DES TIERS
// ============================================
export const TIERS = {
  BRONZE: { min: 0, discount: 0, name: 'Bronze', emoji: '🥉' },
  SILVER: { min: 5000, discount: 5, name: 'Argent', emoji: '🥈' },
  GOLD: { min: 15000, discount: 10, name: 'Or', emoji: '🥇' },
  PLATINUM: { min: 50000, discount: 15, name: 'Platine', emoji: '💎' },
} as const;

// Points par action
export const POINTS_CONFIG = {
  PURCHASE_MULTIPLIER: 10,  // 1€ = 10 points
  REDEEM_RATE: 100,         // 100 points = 1€
  REVIEW_BONUS: 50,         // 50 points par avis
  REFERRAL_BONUS: 500,      // 500 points par parrainage
  BIRTHDAY_BONUS: 200,      // 200 points anniversaire
};

// ============================================
// CALCULS
// ============================================

/**
 * Calcule les points gagnés pour un achat
 */
export function calculatePointsFromPurchase(amountInEuros: number): number {
  return Math.floor(amountInEuros * POINTS_CONFIG.PURCHASE_MULTIPLIER);
}

/**
 * Calcule la réduction en euros pour un nombre de points
 */
export function calculateDiscountFromPoints(points: number): number {
  return points / POINTS_CONFIG.REDEEM_RATE;
}

/**
 * Détermine le tier basé sur le nombre de points
 */
export function calculateTier(points: number): LoyaltyTier {
  if (points >= TIERS.PLATINUM.min) return 'PLATINUM';
  if (points >= TIERS.GOLD.min) return 'GOLD';
  if (points >= TIERS.SILVER.min) return 'SILVER';
  return 'BRONZE';
}

/**
 * Obtient les infos du prochain tier
 */
export function getNextTier(currentTier: LoyaltyTier): typeof TIERS[keyof typeof TIERS] | null {
  const tierOrder: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
  const currentIndex = tierOrder.indexOf(currentTier);
  if (currentIndex >= tierOrder.length - 1) return null;
  return TIERS[tierOrder[currentIndex + 1]];
}

// ============================================
// OPÉRATIONS DE POINTS
// ============================================

/**
 * Récupère ou crée le compte fidélité d'un utilisateur
 */
export async function getOrCreateLoyalty(userId: string) {
  let loyalty = await prisma.loyaltyPoints.findUnique({
    where: { userId },
    include: {
      history: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });

  if (!loyalty) {
    loyalty = await prisma.loyaltyPoints.create({
      data: { userId, points: 0, tier: 'BRONZE' },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });
  }

  return loyalty;
}

/**
 * Ajoute des points au compte fidélité
 */
export async function addPoints(
  userId: string,
  amount: number,
  reason: PointsReason,
  orderId?: string
): Promise<{ points: number; tier: LoyaltyTier; tierChanged: boolean }> {
  const loyalty = await getOrCreateLoyalty(userId);
  const oldTier = loyalty.tier;

  // Calculer nouveaux points et tier
  const newPoints = loyalty.points + amount;
  const newTier = calculateTier(newPoints);
  const tierChanged = oldTier !== newTier;

  // Mettre à jour
  await prisma.loyaltyPoints.update({
    where: { id: loyalty.id },
    data: {
      points: newPoints,
      tier: newTier,
      history: {
        create: {
          amount,
          reason,
          orderId,
        },
      },
    },
  });

  return { points: newPoints, tier: newTier, tierChanged };
}

/**
 * Utilise des points pour une réduction
 * Retourne le montant de la réduction en euros
 */
export async function redeemPoints(
  userId: string,
  pointsToRedeem: number
): Promise<{ discount: number; remainingPoints: number }> {
  // Validation : minimum 1000 points, multiples de 100
  if (pointsToRedeem < 1000) {
    throw new Error('Minimum 1000 points requis');
  }
  if (pointsToRedeem % 100 !== 0) {
    throw new Error('Les points doivent être un multiple de 100');
  }

  const loyalty = await prisma.loyaltyPoints.findUnique({
    where: { userId },
  });

  if (!loyalty) {
    throw new Error('Compte fidélité non trouvé');
  }

  if (loyalty.points < pointsToRedeem) {
    throw new Error('Points insuffisants');
  }

  const discount = calculateDiscountFromPoints(pointsToRedeem);
  const remainingPoints = loyalty.points - pointsToRedeem;

  // Mettre à jour les points
  await prisma.loyaltyPoints.update({
    where: { id: loyalty.id },
    data: {
      points: remainingPoints,
      tier: calculateTier(remainingPoints),
      history: {
        create: {
          amount: -pointsToRedeem,
          reason: 'REDEEM',
        },
      },
    },
  });

  return { discount, remainingPoints };
}

/**
 * Récupère le solde et l'historique d'un utilisateur
 */
export async function getLoyaltyBalance(userId: string) {
  const loyalty = await prisma.loyaltyPoints.findUnique({
    where: { userId },
    include: {
      history: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: {
          order: {
            select: { id: true, totalAmount: true, createdAt: true },
          },
        },
      },
    },
  });

  if (!loyalty) {
    return {
      points: 0,
      tier: 'BRONZE' as LoyaltyTier,
      tierInfo: TIERS.BRONZE,
      nextTier: TIERS.SILVER,
      history: [],
    };
  }

  return {
    points: loyalty.points,
    tier: loyalty.tier,
    tierInfo: TIERS[loyalty.tier],
    nextTier: getNextTier(loyalty.tier),
    history: loyalty.history,
  };
}

/**
 * Ajoute des points bonus (avis, anniversaire, etc.)
 */
export async function addBonusPoints(
  userId: string,
  reason: 'REVIEW' | 'BIRTHDAY' | 'BONUS' | 'REFERRAL',
  customAmount?: number
): Promise<{ points: number; tier: LoyaltyTier }> {
  let amount: number;

  switch (reason) {
    case 'REVIEW':
      amount = POINTS_CONFIG.REVIEW_BONUS;
      break;
    case 'BIRTHDAY':
      amount = POINTS_CONFIG.BIRTHDAY_BONUS;
      break;
    case 'REFERRAL':
      amount = POINTS_CONFIG.REFERRAL_BONUS;
      break;
    case 'BONUS':
      amount = customAmount || 100;
      break;
    default:
      amount = customAmount || 0;
  }

  const result = await addPoints(userId, amount, reason);
  return { points: result.points, tier: result.tier };
}

/**
 * Calcule la réduction de tier pour un utilisateur
 */
export async function getTierDiscount(userId: string): Promise<number> {
  const loyalty = await prisma.loyaltyPoints.findUnique({
    where: { userId },
    select: { tier: true },
  });

  if (!loyalty) return 0;
  return TIERS[loyalty.tier].discount;
}
