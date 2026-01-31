/**
 * VIP Detection - Système de détection des clients VIP
 * Scoring, segmentation et insights
 */

import { prisma } from '@/lib/prisma';
import { LoyaltyTier } from '@prisma/client';

// Configuration des seuils VIP
export const VIP_CONFIG = {
  // Seuils de dépenses totales (€)
  SPENDING_THRESHOLDS: {
    BRONZE: 0,
    SILVER: 200,
    GOLD: 500,
    PLATINUM: 1500,
    DIAMOND: 5000,
  },
  // Seuils de fréquence (commandes)
  FREQUENCY_THRESHOLDS: {
    OCCASIONAL: 1,
    REGULAR: 3,
    FREQUENT: 6,
    LOYAL: 12,
  },
  // Seuils de récence (jours depuis dernière commande)
  RECENCY_THRESHOLDS: {
    ACTIVE: 30,
    ENGAGED: 90,
    AT_RISK: 180,
    DORMANT: 365,
  },
  // Points pour le score VIP
  SCORING: {
    // Dépenses
    perEuroSpent: 0.1,
    // Fréquence
    perOrder: 10,
    // Récence (bonus si actif)
    activeBonus: 50,
    engagedBonus: 30,
    atRiskPenalty: -20,
    dormantPenalty: -50,
    // Tier fidélité
    loyaltyBonus: {
      BRONZE: 0,
      SILVER: 20,
      GOLD: 50,
      PLATINUM: 100,
    },
    // Avis donnés
    perReview: 5,
  },
};

export type VIPSegment = 'diamond' | 'platinum' | 'gold' | 'silver' | 'bronze' | 'prospect';
export type ActivityStatus = 'active' | 'engaged' | 'at_risk' | 'dormant' | 'new';

export interface VIPCustomer {
  id: string;
  email: string;
  name: string | null;
  // Stats
  totalSpent: number;
  orderCount: number;
  avgOrderValue: number;
  lastOrderDate: Date | null;
  daysSinceLastOrder: number | null;
  // Segmentation
  segment: VIPSegment;
  activityStatus: ActivityStatus;
  vipScore: number;
  // Fidélité
  loyaltyTier: LoyaltyTier | null;
  loyaltyPoints: number;
  // Détails
  reviewCount: number;
  wishlistCount: number;
  createdAt: Date;
}

export interface VIPStats {
  totalVIP: number;
  bySegment: Record<VIPSegment, number>;
  byActivity: Record<ActivityStatus, number>;
  totalRevenue: number;
  avgOrderValue: number;
  avgOrdersPerCustomer: number;
}

/**
 * Calcule le segment VIP basé sur les dépenses
 */
function getVIPSegment(totalSpent: number): VIPSegment {
  const { SPENDING_THRESHOLDS } = VIP_CONFIG;
  if (totalSpent >= SPENDING_THRESHOLDS.DIAMOND) return 'diamond';
  if (totalSpent >= SPENDING_THRESHOLDS.PLATINUM) return 'platinum';
  if (totalSpent >= SPENDING_THRESHOLDS.GOLD) return 'gold';
  if (totalSpent >= SPENDING_THRESHOLDS.SILVER) return 'silver';
  if (totalSpent > 0) return 'bronze';
  return 'prospect';
}

/**
 * Calcule le statut d'activité basé sur la récence
 */
function getActivityStatus(daysSinceLastOrder: number | null): ActivityStatus {
  if (daysSinceLastOrder === null) return 'new';
  const { RECENCY_THRESHOLDS } = VIP_CONFIG;
  if (daysSinceLastOrder <= RECENCY_THRESHOLDS.ACTIVE) return 'active';
  if (daysSinceLastOrder <= RECENCY_THRESHOLDS.ENGAGED) return 'engaged';
  if (daysSinceLastOrder <= RECENCY_THRESHOLDS.AT_RISK) return 'at_risk';
  return 'dormant';
}

/**
 * Calcule le score VIP d'un client
 */
function calculateVIPScore(params: {
  totalSpent: number;
  orderCount: number;
  daysSinceLastOrder: number | null;
  loyaltyTier: LoyaltyTier | null;
  reviewCount: number;
}): number {
  const { SCORING } = VIP_CONFIG;
  let score = 0;

  // Points pour les dépenses
  score += params.totalSpent * SCORING.perEuroSpent;

  // Points pour la fréquence
  score += params.orderCount * SCORING.perOrder;

  // Bonus/malus de récence
  const activity = getActivityStatus(params.daysSinceLastOrder);
  switch (activity) {
    case 'active':
      score += SCORING.activeBonus;
      break;
    case 'engaged':
      score += SCORING.engagedBonus;
      break;
    case 'at_risk':
      score += SCORING.atRiskPenalty;
      break;
    case 'dormant':
      score += SCORING.dormantPenalty;
      break;
  }

  // Bonus de fidélité
  if (params.loyaltyTier) {
    score += SCORING.loyaltyBonus[params.loyaltyTier];
  }

  // Points pour les avis
  score += params.reviewCount * SCORING.perReview;

  return Math.max(0, Math.round(score));
}

/**
 * Récupère tous les clients VIP avec leurs stats
 */
export async function getVIPCustomers(options?: {
  minSegment?: VIPSegment;
  activityFilter?: ActivityStatus;
  sortBy?: 'score' | 'spent' | 'orders' | 'recency';
  limit?: number;
}): Promise<VIPCustomer[]> {
  const { minSegment, activityFilter, sortBy = 'score', limit } = options || {};

  const users = await prisma.user.findMany({
    include: {
      orders: {
        where: { status: { notIn: ['CANCELLED', 'FAILED', 'PENDING'] } },
        select: { totalAmount: true, createdAt: true },
        orderBy: { createdAt: 'desc' },
      },
      loyalty: { select: { points: true, tier: true } },
      reviews: { select: { id: true } },
      wishlist: { select: { id: true } },
    },
  });

  const now = new Date();

  let vipCustomers: VIPCustomer[] = users.map((user) => {
    const totalSpent = user.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
    const orderCount = user.orders.length;
    const avgOrderValue = orderCount > 0 ? totalSpent / orderCount : 0;
    const lastOrderDate = user.orders[0]?.createdAt || null;
    const daysSinceLastOrder = lastOrderDate
      ? Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    const segment = getVIPSegment(totalSpent);
    const activityStatus = getActivityStatus(daysSinceLastOrder);
    const vipScore = calculateVIPScore({
      totalSpent,
      orderCount,
      daysSinceLastOrder,
      loyaltyTier: user.loyalty?.tier || null,
      reviewCount: user.reviews.length,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      totalSpent,
      orderCount,
      avgOrderValue,
      lastOrderDate,
      daysSinceLastOrder,
      segment,
      activityStatus,
      vipScore,
      loyaltyTier: user.loyalty?.tier || null,
      loyaltyPoints: user.loyalty?.points || 0,
      reviewCount: user.reviews.length,
      wishlistCount: user.wishlist.length,
      createdAt: user.createdAt,
    };
  });

  // Filtrer par segment minimum
  if (minSegment) {
    const segmentOrder: VIPSegment[] = ['prospect', 'bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const minIndex = segmentOrder.indexOf(minSegment);
    vipCustomers = vipCustomers.filter(
      (c) => segmentOrder.indexOf(c.segment) >= minIndex
    );
  }

  // Filtrer par activité
  if (activityFilter) {
    vipCustomers = vipCustomers.filter((c) => c.activityStatus === activityFilter);
  }

  // Trier
  switch (sortBy) {
    case 'score':
      vipCustomers.sort((a, b) => b.vipScore - a.vipScore);
      break;
    case 'spent':
      vipCustomers.sort((a, b) => b.totalSpent - a.totalSpent);
      break;
    case 'orders':
      vipCustomers.sort((a, b) => b.orderCount - a.orderCount);
      break;
    case 'recency':
      vipCustomers.sort((a, b) => {
        if (a.daysSinceLastOrder === null) return 1;
        if (b.daysSinceLastOrder === null) return -1;
        return a.daysSinceLastOrder - b.daysSinceLastOrder;
      });
      break;
  }

  // Limiter
  if (limit) {
    vipCustomers = vipCustomers.slice(0, limit);
  }

  return vipCustomers;
}

/**
 * Récupère les statistiques VIP globales
 */
export async function getVIPStats(): Promise<VIPStats> {
  const customers = await getVIPCustomers();

  const stats: VIPStats = {
    totalVIP: customers.filter((c) => c.segment !== 'prospect').length,
    bySegment: {
      diamond: 0,
      platinum: 0,
      gold: 0,
      silver: 0,
      bronze: 0,
      prospect: 0,
    },
    byActivity: {
      active: 0,
      engaged: 0,
      at_risk: 0,
      dormant: 0,
      new: 0,
    },
    totalRevenue: 0,
    avgOrderValue: 0,
    avgOrdersPerCustomer: 0,
  };

  let totalOrders = 0;
  let totalValue = 0;

  customers.forEach((c) => {
    stats.bySegment[c.segment]++;
    stats.byActivity[c.activityStatus]++;
    stats.totalRevenue += c.totalSpent;
    totalOrders += c.orderCount;
    if (c.orderCount > 0) {
      totalValue += c.avgOrderValue * c.orderCount;
    }
  });

  stats.avgOrderValue = totalOrders > 0 ? totalValue / totalOrders : 0;
  stats.avgOrdersPerCustomer = customers.length > 0 ? totalOrders / customers.length : 0;

  return stats;
}

/**
 * Récupère les clients à risque (at_risk ou dormant)
 */
export async function getAtRiskCustomers(): Promise<VIPCustomer[]> {
  const customers = await getVIPCustomers({ minSegment: 'bronze', sortBy: 'recency' });
  return customers.filter(
    (c) => c.activityStatus === 'at_risk' || c.activityStatus === 'dormant'
  );
}

/**
 * Récupère les top clients VIP
 */
export async function getTopVIPCustomers(limit: number = 10): Promise<VIPCustomer[]> {
  return getVIPCustomers({ minSegment: 'silver', sortBy: 'score', limit });
}

/**
 * Labels et couleurs pour les segments
 */
export const SEGMENT_LABELS: Record<VIPSegment, { label: string; emoji: string; color: string }> = {
  diamond: { label: 'Diamant', emoji: '💎', color: 'text-cyan-400' },
  platinum: { label: 'Platine', emoji: '⚪', color: 'text-gray-300' },
  gold: { label: 'Or', emoji: '🥇', color: 'text-yellow-400' },
  silver: { label: 'Argent', emoji: '🥈', color: 'text-gray-400' },
  bronze: { label: 'Bronze', emoji: '🥉', color: 'text-orange-400' },
  prospect: { label: 'Prospect', emoji: '👋', color: 'text-creme/60' },
};

export const ACTIVITY_LABELS: Record<ActivityStatus, { label: string; emoji: string; color: string }> = {
  active: { label: 'Actif', emoji: '🟢', color: 'text-green-400' },
  engaged: { label: 'Engagé', emoji: '🔵', color: 'text-blue-400' },
  at_risk: { label: 'À Risque', emoji: '🟡', color: 'text-yellow-400' },
  dormant: { label: 'Dormant', emoji: '🔴', color: 'text-red-400' },
  new: { label: 'Nouveau', emoji: '✨', color: 'text-purple-400' },
};
