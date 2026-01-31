/**
 * Push Notifications - La Fine Parfumerie
 * Gestion des notifications push pour PWA
 */

import webpush from 'web-push';
import { prisma } from './prisma';

// Configurer VAPID (si les clés sont présentes)
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:contact@lafineparfumerie.fr',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

// Types de notifications
export interface PushNotification {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, unknown>;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

// Templates de notifications prédéfinis
export const NOTIFICATION_TEMPLATES = {
  ORDER_SHIPPED: (orderId: string, trackingNumber?: string) => ({
    title: '📦 Commande expédiée !',
    body: `Votre commande #${orderId.slice(0, 8)} est en route${trackingNumber ? ` - N° ${trackingNumber}` : ''}`,
    url: `/orders/${orderId}`,
    tag: `order-${orderId}`,
  }),

  ORDER_DELIVERED: (orderId: string) => ({
    title: '✅ Commande livrée !',
    body: `Votre commande #${orderId.slice(0, 8)} a été livrée. Laissez un avis !`,
    url: `/orders/${orderId}`,
    tag: `order-${orderId}`,
    actions: [
      { action: 'review', title: '⭐ Laisser un avis' },
    ],
  }),

  PRICE_DROP: (productName: string, productId: number, newPrice: number) => ({
    title: '🏷️ Prix en baisse !',
    body: `${productName} est maintenant à ${newPrice}€`,
    url: `/products/${productId}`,
    tag: `product-${productId}`,
  }),

  BACK_IN_STOCK: (productName: string, productId: number) => ({
    title: '🎉 De retour en stock !',
    body: `${productName} est à nouveau disponible`,
    url: `/products/${productId}`,
    tag: `product-${productId}`,
  }),

  PROMO: (code: string, discount: string) => ({
    title: '💝 Offre exclusive !',
    body: `${discount} avec le code ${code}`,
    url: '/products',
    tag: 'promo',
  }),

  LOYALTY_TIER_UP: (newTier: string) => ({
    title: '🎊 Nouveau statut !',
    body: `Félicitations ! Vous êtes maintenant ${newTier}`,
    url: '/account/loyalty',
    tag: 'loyalty',
  }),
};

/**
 * Envoie une notification push à un utilisateur
 */
export async function sendPushNotification(
  userId: string,
  notification: PushNotification
): Promise<{ success: number; failed: number }> {
  // Vérifier que VAPID est configuré
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('[PUSH] VAPID keys not configured');
    return { success: 0, failed: 0 };
  }

  // Récupérer les subscriptions de l'utilisateur
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return { success: 0, failed: 0 };
  }

  let success = 0;
  let failed = 0;

  const payload = JSON.stringify({
    ...notification,
    icon: notification.icon || '/icons/icon-192x192.png',
    badge: notification.badge || '/icons/icon-72x72.png',
  });

  const promises = subscriptions.map(async (sub) => {
    try {
      const subscription = JSON.parse(sub.subscription);
      await webpush.sendNotification(subscription, payload);
      success++;
    } catch (error: unknown) {
      const err = error as { statusCode?: number };
      console.error('[PUSH] Error sending notification:', err);

      // Si erreur 410 (Gone) ou 404 (Not Found), supprimer la subscription
      if (err.statusCode === 410 || err.statusCode === 404) {
        await prisma.pushSubscription.delete({
          where: { id: sub.id },
        }).catch(() => {}); // Ignorer si déjà supprimé
      }

      failed++;
    }
  });

  await Promise.all(promises);

  return { success, failed };
}

/**
 * Envoie une notification à plusieurs utilisateurs
 */
export async function sendBulkPushNotification(
  userIds: string[],
  notification: PushNotification
): Promise<{ success: number; failed: number }> {
  let totalSuccess = 0;
  let totalFailed = 0;

  for (const userId of userIds) {
    const result = await sendPushNotification(userId, notification);
    totalSuccess += result.success;
    totalFailed += result.failed;
  }

  return { success: totalSuccess, failed: totalFailed };
}

/**
 * Envoie une notification à tous les utilisateurs abonnés
 */
export async function sendBroadcastNotification(
  notification: PushNotification
): Promise<{ success: number; failed: number }> {
  const subscriptions = await prisma.pushSubscription.findMany({
    select: { userId: true },
    distinct: ['userId'],
  });

  const userIds = subscriptions.map((s) => s.userId);
  return sendBulkPushNotification(userIds, notification);
}

/**
 * Vérifie si un utilisateur a des subscriptions push actives
 */
export async function hasActivePushSubscription(userId: string): Promise<boolean> {
  const count = await prisma.pushSubscription.count({
    where: { userId },
  });
  return count > 0;
}

/**
 * Supprime toutes les subscriptions d'un utilisateur
 */
export async function removeAllPushSubscriptions(userId: string): Promise<void> {
  await prisma.pushSubscription.deleteMany({
    where: { userId },
  });
}
