/**
 * Système de Parrainage - La Fine Parfumerie
 * Gestion des codes et récompenses
 */

import { prisma } from './prisma';
import { ReferralStatus } from '@prisma/client';
import { addBonusPoints } from './loyalty';
import crypto from 'crypto';

// Configuration
export const REFERRAL_CONFIG = {
  REWARD_AMOUNT: 10, // 10€ de réduction pour parrain et filleul
  MIN_ORDER_AMOUNT: 50, // Commande minimum pour valider le parrainage
  REFERRAL_POINTS: 500, // Points fidélité bonus
};

/**
 * Génère un code de parrainage unique basé sur l'userId
 */
export function generateReferralCode(userId: string): string {
  const hash = crypto.createHash('md5').update(userId + Date.now().toString()).digest('hex');
  return hash.slice(0, 8).toUpperCase();
}

/**
 * Crée ou récupère le code de parrainage d'un utilisateur
 */
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  // Chercher un code existant
  const existing = await prisma.referral.findFirst({
    where: {
      referrerId: userId,
      refereeId: null, // Code non utilisé
    },
    select: { code: true },
  });

  if (existing) {
    return existing.code;
  }

  // Créer un nouveau code
  let code = generateReferralCode(userId);
  let attempts = 0;

  // S'assurer que le code est unique
  while (attempts < 10) {
    const exists = await prisma.referral.findUnique({
      where: { code },
    });

    if (!exists) break;

    code = generateReferralCode(userId + attempts);
    attempts++;
  }

  await prisma.referral.create({
    data: {
      referrerId: userId,
      code,
      reward: REFERRAL_CONFIG.REWARD_AMOUNT,
    },
  });

  return code;
}

/**
 * Applique un code de parrainage pour un nouvel utilisateur
 */
export async function applyReferralCode(
  refereeId: string,
  code: string
): Promise<{ success: boolean; message: string; discount?: number }> {
  const normalizedCode = code.toUpperCase().trim();

  // Vérifier que l'utilisateur n'a pas déjà utilisé un code
  const alreadyReferred = await prisma.referral.findFirst({
    where: { refereeId },
  });

  if (alreadyReferred) {
    return {
      success: false,
      message: 'Vous avez déjà utilisé un code de parrainage',
    };
  }

  // Trouver le code
  const referral = await prisma.referral.findUnique({
    where: { code: normalizedCode },
    include: { referrer: { select: { id: true, email: true } } },
  });

  if (!referral) {
    return {
      success: false,
      message: 'Code de parrainage invalide',
    };
  }

  // Vérifier que ce n'est pas son propre code
  if (referral.referrerId === refereeId) {
    return {
      success: false,
      message: 'Vous ne pouvez pas utiliser votre propre code',
    };
  }

  // Vérifier que le code n'a pas déjà été utilisé
  if (referral.refereeId) {
    return {
      success: false,
      message: 'Ce code a déjà été utilisé',
    };
  }

  // Lier le filleul au parrainage
  await prisma.referral.update({
    where: { id: referral.id },
    data: { refereeId },
  });

  return {
    success: true,
    message: `Code appliqué ! Vous recevrez ${REFERRAL_CONFIG.REWARD_AMOUNT}€ de réduction sur votre première commande.`,
    discount: REFERRAL_CONFIG.REWARD_AMOUNT,
  };
}

/**
 * Valide un parrainage après la première commande du filleul
 */
export async function completeReferral(
  refereeId: string,
  orderAmount: number
): Promise<boolean> {
  // Vérifier le montant minimum
  if (orderAmount < REFERRAL_CONFIG.MIN_ORDER_AMOUNT) {
    return false;
  }

  // Trouver le parrainage en attente
  const referral = await prisma.referral.findFirst({
    where: {
      refereeId,
      status: 'PENDING',
    },
  });

  if (!referral) {
    return false;
  }

  // Marquer comme complété
  await prisma.referral.update({
    where: { id: referral.id },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  // Récompenser le parrain avec des points fidélité
  await addBonusPoints(referral.referrerId, 'REFERRAL');

  return true;
}

/**
 * Récupère les statistiques de parrainage d'un utilisateur
 */
export async function getReferralStats(userId: string) {
  const referrals = await prisma.referral.findMany({
    where: { referrerId: userId },
    include: {
      referee: {
        select: { name: true, email: true, createdAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const completed = referrals.filter((r) => r.status === 'COMPLETED');
  const pending = referrals.filter((r) => r.status === 'PENDING' && r.refereeId);
  const available = referrals.filter((r) => !r.refereeId);

  return {
    referrals,
    stats: {
      total: referrals.length,
      completed: completed.length,
      pending: pending.length,
      available: available.length,
      totalReward: completed.reduce((sum, r) => sum + r.reward, 0),
    },
    code: available.length > 0 ? available[0].code : null,
  };
}

/**
 * Vérifie si un utilisateur a un parrainage en attente
 */
export async function getPendingReferral(userId: string) {
  return await prisma.referral.findFirst({
    where: {
      refereeId: userId,
      status: 'PENDING',
    },
    include: {
      referrer: {
        select: { name: true },
      },
    },
  });
}

/**
 * Génère le lien de parrainage complet
 */
export function getReferralLink(code: string, baseUrl: string): string {
  return `${baseUrl}?ref=${code}`;
}
