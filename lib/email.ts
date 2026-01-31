/**
 * SERVICE D'ENVOI D'EMAILS
 * Utilise Resend pour envoyer les emails transactionnels
 * Avec logging en base de données pour l'historique
 *
 * @requires resend
 * @requires RESEND_API_KEY dans .env.local
 */

import { Resend } from "resend";
import { render } from "@react-email/components";
import { prisma } from "./prisma";
import { EmailType, EmailStatus, Prisma } from "@prisma/client";

// Templates
import OrderConfirmation from "@/emails/OrderConfirmation";
import OrderShipped from "@/emails/OrderShipped";
import WelcomeEmail from "@/emails/WelcomeEmail";
import PasswordResetEmail from "@/emails/PasswordResetEmail";
import DeliveryConfirmed from "@/emails/DeliveryConfirmed";
import ReviewRequest from "@/emails/ReviewRequest";

// Initialisation de Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Configuration de l'expéditeur
const FROM_EMAIL = process.env.NODE_ENV === "production"
  ? "La Fine Parfumerie <noreply@lafineparfumerie.com>"
  : "La Fine Parfumerie <onboarding@resend.dev>";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

// ============================================
// TYPES
// ============================================

interface OrderItem {
  id: string;
  name: string;
  brand: string;
  volume: string;
  quantity: number;
  price: number;
  productId?: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalAmount: number;
  createdAt: Date;
}

interface Customer {
  email: string;
  name?: string | null;
}

interface EmailResponse {
  success: boolean;
  data?: { id: string };
  error?: unknown;
}

interface LogEmailParams {
  to: string;
  subject: string;
  type: EmailType;
  resendId?: string;
  status?: EmailStatus;
  error?: string;
  userId?: string;
  orderId?: string;
  metadata?: Record<string, unknown>;
}

// ============================================
// LOGGING HELPER
// ============================================

/**
 * Enregistre un email dans la base de données
 */
async function logEmail(params: LogEmailParams): Promise<void> {
  try {
    await prisma.emailLog.create({
      data: {
        to: params.to,
        subject: params.subject,
        type: params.type,
        resendId: params.resendId,
        status: params.status || "SENT",
        error: params.error,
        userId: params.userId,
        orderId: params.orderId,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });
  } catch (error) {
    console.error("❌ Erreur logging email:", error);
  }
}

// ============================================
// EMAIL: CONFIRMATION DE COMMANDE
// ============================================

/**
 * Envoie un email de confirmation de commande
 * Appelé après un paiement réussi
 */
export async function sendOrderConfirmation(
  order: Order,
  customer: Customer,
  userId?: string
): Promise<EmailResponse> {
  const subject = `Confirmation de commande #${order.id}`;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY n'est pas défini");
      return { success: false, error: "API key manquante" };
    }

    console.log(`📧 Envoi email confirmation commande #${order.id} à ${customer.email}`);

    const emailHtml = await render(
      OrderConfirmation({
        orderNumber: order.id,
        customerName: customer.name || "Cher client",
        items: order.items,
        totalAmount: order.totalAmount,
        orderDate: new Date(order.createdAt).toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Erreur envoi email confirmation:", error);
      await logEmail({
        to: customer.email,
        subject,
        type: "ORDER_CONFIRMATION",
        status: "FAILED",
        error: JSON.stringify(error),
        userId,
        orderId: order.id,
      });
      return { success: false, error };
    }

    console.log(`✅ Email confirmation envoyé avec succès (ID: ${data?.id})`);
    await logEmail({
      to: customer.email,
      subject,
      type: "ORDER_CONFIRMATION",
      resendId: data?.id,
      userId,
      orderId: order.id,
    });

    return { success: true, data };
  } catch (error) {
    console.error("❌ Erreur critique envoi email confirmation:", error);
    await logEmail({
      to: customer.email,
      subject,
      type: "ORDER_CONFIRMATION",
      status: "FAILED",
      error: error instanceof Error ? error.message : "Erreur inconnue",
      userId,
      orderId: order.id,
    });
    return { success: false, error };
  }
}

// ============================================
// EMAIL: NOTIFICATION D'EXPÉDITION
// ============================================

/**
 * Envoie un email de notification d'expédition
 * Appelé quand l'admin marque la commande comme expédiée
 */
export async function sendShippingNotification(
  order: Order,
  customer: Customer,
  trackingNumber: string,
  carrier: string,
  userId?: string
): Promise<EmailResponse> {
  const subject = `Votre commande #${order.id} a été expédiée 📦`;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY n'est pas défini");
      return { success: false, error: "API key manquante" };
    }

    console.log(`📧 Envoi email expédition commande #${order.id} à ${customer.email}`);

    const emailHtml = await render(
      OrderShipped({
        orderNumber: order.id,
        customerName: customer.name || "Cher client",
        trackingNumber,
        carrier,
        estimatedDelivery: "2-3 jours ouvrés",
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Erreur envoi email expédition:", error);
      await logEmail({
        to: customer.email,
        subject,
        type: "SHIPPING",
        status: "FAILED",
        error: JSON.stringify(error),
        userId,
        orderId: order.id,
        metadata: { trackingNumber, carrier },
      });
      return { success: false, error };
    }

    console.log(`✅ Email expédition envoyé avec succès (ID: ${data?.id})`);
    await logEmail({
      to: customer.email,
      subject,
      type: "SHIPPING",
      resendId: data?.id,
      userId,
      orderId: order.id,
      metadata: { trackingNumber, carrier },
    });

    return { success: true, data };
  } catch (error) {
    console.error("❌ Erreur critique envoi email expédition:", error);
    await logEmail({
      to: customer.email,
      subject,
      type: "SHIPPING",
      status: "FAILED",
      error: error instanceof Error ? error.message : "Erreur inconnue",
      userId,
      orderId: order.id,
    });
    return { success: false, error };
  }
}

// ============================================
// EMAIL: BIENVENUE
// ============================================

/**
 * Envoie un email de bienvenue
 * Appelé lors de la création d'un compte
 */
export async function sendWelcomeEmail(
  customer: Customer,
  userId?: string,
  promoCode: string = "BIENVENUE10"
): Promise<EmailResponse> {
  const subject = "Bienvenue à La Fine Parfumerie ✨";

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY n'est pas défini");
      return { success: false, error: "API key manquante" };
    }

    console.log(`📧 Envoi email bienvenue à ${customer.email}`);

    const emailHtml = await render(
      WelcomeEmail({
        customerName: customer.name || "Cher client",
        promoCode,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Erreur envoi email bienvenue:", error);
      await logEmail({
        to: customer.email,
        subject,
        type: "WELCOME",
        status: "FAILED",
        error: JSON.stringify(error),
        userId,
      });
      return { success: false, error };
    }

    console.log(`✅ Email bienvenue envoyé avec succès (ID: ${data?.id})`);
    await logEmail({
      to: customer.email,
      subject,
      type: "WELCOME",
      resendId: data?.id,
      userId,
    });

    return { success: true, data };
  } catch (error) {
    console.error("❌ Erreur critique envoi email bienvenue:", error);
    await logEmail({
      to: customer.email,
      subject,
      type: "WELCOME",
      status: "FAILED",
      error: error instanceof Error ? error.message : "Erreur inconnue",
      userId,
    });
    return { success: false, error };
  }
}

// ============================================
// EMAIL: RÉINITIALISATION MOT DE PASSE
// ============================================

/**
 * Envoie un email de réinitialisation de mot de passe
 */
export async function sendPasswordResetEmail(
  customer: Customer,
  resetToken: string,
  userId?: string
): Promise<EmailResponse> {
  const subject = "Réinitialisation de votre mot de passe";
  const resetUrl = `${BASE_URL}/reset-password?token=${resetToken}`;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY n'est pas défini");
      return { success: false, error: "API key manquante" };
    }

    console.log(`📧 Envoi email reset password à ${customer.email}`);

    const emailHtml = await render(
      PasswordResetEmail({
        customerName: customer.name || "Cher client",
        resetUrl,
        expiresIn: "1 heure",
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Erreur envoi email reset password:", error);
      await logEmail({
        to: customer.email,
        subject,
        type: "PASSWORD_RESET",
        status: "FAILED",
        error: JSON.stringify(error),
        userId,
      });
      return { success: false, error };
    }

    console.log(`✅ Email reset password envoyé avec succès (ID: ${data?.id})`);
    await logEmail({
      to: customer.email,
      subject,
      type: "PASSWORD_RESET",
      resendId: data?.id,
      userId,
    });

    return { success: true, data };
  } catch (error) {
    console.error("❌ Erreur critique envoi email reset password:", error);
    await logEmail({
      to: customer.email,
      subject,
      type: "PASSWORD_RESET",
      status: "FAILED",
      error: error instanceof Error ? error.message : "Erreur inconnue",
      userId,
    });
    return { success: false, error };
  }
}

// ============================================
// EMAIL: LIVRAISON CONFIRMÉE
// ============================================

/**
 * Envoie un email de confirmation de livraison
 */
export async function sendDeliveryConfirmation(
  order: Order,
  customer: Customer,
  userId?: string
): Promise<EmailResponse> {
  const subject = `Votre commande #${order.id} a été livrée 🎉`;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY n'est pas défini");
      return { success: false, error: "API key manquante" };
    }

    console.log(`📧 Envoi email livraison commande #${order.id} à ${customer.email}`);

    const emailHtml = await render(
      DeliveryConfirmed({
        orderNumber: order.id,
        customerName: customer.name || "Cher client",
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          volume: item.volume,
          quantity: item.quantity,
        })),
        deliveryDate: new Date().toLocaleDateString("fr-FR", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Erreur envoi email livraison:", error);
      await logEmail({
        to: customer.email,
        subject,
        type: "DELIVERY",
        status: "FAILED",
        error: JSON.stringify(error),
        userId,
        orderId: order.id,
      });
      return { success: false, error };
    }

    console.log(`✅ Email livraison envoyé avec succès (ID: ${data?.id})`);
    await logEmail({
      to: customer.email,
      subject,
      type: "DELIVERY",
      resendId: data?.id,
      userId,
      orderId: order.id,
    });

    return { success: true, data };
  } catch (error) {
    console.error("❌ Erreur critique envoi email livraison:", error);
    await logEmail({
      to: customer.email,
      subject,
      type: "DELIVERY",
      status: "FAILED",
      error: error instanceof Error ? error.message : "Erreur inconnue",
      userId,
      orderId: order.id,
    });
    return { success: false, error };
  }
}

// ============================================
// EMAIL: DEMANDE D'AVIS
// ============================================

/**
 * Envoie un email de demande d'avis
 * Appelé 7 jours après la livraison
 */
export async function sendReviewRequest(
  order: Order,
  customer: Customer,
  userId?: string,
  promoCode?: string
): Promise<EmailResponse> {
  const subject = `Que pensez-vous de votre commande #${order.id} ? ⭐`;

  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY n'est pas défini");
      return { success: false, error: "API key manquante" };
    }

    console.log(`📧 Envoi email demande avis commande #${order.id} à ${customer.email}`);

    const emailHtml = await render(
      ReviewRequest({
        orderNumber: order.id,
        customerName: customer.name || "Cher client",
        items: order.items.map((item) => ({
          id: item.id,
          name: item.name,
          brand: item.brand,
          productId: item.productId || 0,
        })),
        promoCode,
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: customer.email,
      subject,
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Erreur envoi email demande avis:", error);
      await logEmail({
        to: customer.email,
        subject,
        type: "REVIEW_REQUEST",
        status: "FAILED",
        error: JSON.stringify(error),
        userId,
        orderId: order.id,
      });
      return { success: false, error };
    }

    console.log(`✅ Email demande avis envoyé avec succès (ID: ${data?.id})`);
    await logEmail({
      to: customer.email,
      subject,
      type: "REVIEW_REQUEST",
      resendId: data?.id,
      userId,
      orderId: order.id,
    });

    return { success: true, data };
  } catch (error) {
    console.error("❌ Erreur critique envoi email demande avis:", error);
    await logEmail({
      to: customer.email,
      subject,
      type: "REVIEW_REQUEST",
      status: "FAILED",
      error: error instanceof Error ? error.message : "Erreur inconnue",
      userId,
      orderId: order.id,
    });
    return { success: false, error };
  }
}

// ============================================
// EMAIL DE TEST
// ============================================

/**
 * Envoie un email de test
 * Utile pour vérifier la configuration
 */
export async function sendTestEmail(to: string): Promise<EmailResponse> {
  try {
    if (!process.env.RESEND_API_KEY) {
      console.error("❌ RESEND_API_KEY n'est pas défini");
      return { success: false, error: "API key manquante" };
    }

    console.log(`📧 Envoi email de test à ${to}`);

    const emailHtml = await render(
      WelcomeEmail({
        customerName: "Test User",
        promoCode: "TEST10",
      })
    );

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject: "Test - La Fine Parfumerie",
      html: emailHtml,
    });

    if (error) {
      console.error("❌ Erreur envoi email de test:", error);
      return { success: false, error };
    }

    console.log(`✅ Email de test envoyé avec succès (ID: ${data?.id})`);
    return { success: true, data };
  } catch (error) {
    console.error("❌ Erreur critique envoi email de test:", error);
    return { success: false, error };
  }
}

// ============================================
// PROGRAMMATION D'EMAILS
// ============================================

/**
 * Programme un email de demande d'avis 7 jours après livraison
 */
export async function scheduleReviewRequestEmail(
  orderId: string,
  userId: string,
  customerEmail: string
): Promise<void> {
  try {
    // Calculer la date d'envoi (7 jours après)
    const scheduledAt = new Date();
    scheduledAt.setDate(scheduledAt.getDate() + 7);

    await prisma.scheduledEmail.create({
      data: {
        to: customerEmail,
        type: "REVIEW_REQUEST",
        scheduledAt,
        orderId,
        userId,
        metadata: { promoCode: "AVIS10" },
      },
    });

    console.log(`📅 Email demande avis programmé pour ${scheduledAt.toLocaleDateString()}`);
  } catch (error) {
    console.error("❌ Erreur programmation email avis:", error);
  }
}

/**
 * Traite les emails programmés en attente
 * À appeler via un cron job ou une API route
 */
export async function processScheduledEmails(): Promise<{
  processed: number;
  errors: number;
}> {
  let processed = 0;
  let errors = 0;

  try {
    // Récupérer les emails à envoyer
    const pendingEmails = await prisma.scheduledEmail.findMany({
      where: {
        status: "PENDING",
        scheduledAt: {
          lte: new Date(),
        },
      },
      include: {
        order: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
            user: true,
          },
        },
      },
      take: 50, // Limite par batch
    });

    for (const scheduledEmail of pendingEmails) {
      try {
        if (scheduledEmail.type === "REVIEW_REQUEST" && scheduledEmail.order) {
          const order = scheduledEmail.order;
          const customer = {
            email: scheduledEmail.to,
            name: order.user?.name,
          };

          const orderData: Order = {
            id: order.id,
            items: order.items.map((item) => ({
              id: item.id,
              name: item.product.name,
              brand: item.product.brand || "",
              volume: item.product.volume || "",
              quantity: item.quantity,
              price: Number(item.price),
              productId: item.productId,
            })),
            totalAmount: Number(order.totalAmount),
            createdAt: order.createdAt,
          };

          const metadata = scheduledEmail.metadata as { promoCode?: string } | null;
          const result = await sendReviewRequest(
            orderData,
            customer,
            scheduledEmail.userId || undefined,
            metadata?.promoCode
          );

          if (result.success) {
            await prisma.scheduledEmail.update({
              where: { id: scheduledEmail.id },
              data: {
                status: "SENT",
                sentAt: new Date(),
              },
            });
            processed++;
          } else {
            await prisma.scheduledEmail.update({
              where: { id: scheduledEmail.id },
              data: {
                status: "FAILED",
                error: JSON.stringify(result.error),
              },
            });
            errors++;
          }
        }
      } catch (error) {
        console.error(`❌ Erreur traitement email programmé ${scheduledEmail.id}:`, error);
        await prisma.scheduledEmail.update({
          where: { id: scheduledEmail.id },
          data: {
            status: "FAILED",
            error: error instanceof Error ? error.message : "Erreur inconnue",
          },
        });
        errors++;
      }
    }

    console.log(`📧 Emails programmés traités: ${processed} succès, ${errors} erreurs`);
  } catch (error) {
    console.error("❌ Erreur traitement emails programmés:", error);
  }

  return { processed, errors };
}

// ============================================
// RÉCUPÉRATION STATISTIQUES
// ============================================

/**
 * Récupère les statistiques d'emails
 */
export async function getEmailStats(): Promise<{
  total: number;
  byType: Record<string, number>;
  byStatus: Record<string, number>;
  last24h: number;
  last7days: number;
}> {
  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [total, byType, byStatus, last24h, last7days] = await Promise.all([
    prisma.emailLog.count(),
    prisma.emailLog.groupBy({
      by: ["type"],
      _count: true,
    }),
    prisma.emailLog.groupBy({
      by: ["status"],
      _count: true,
    }),
    prisma.emailLog.count({
      where: { createdAt: { gte: yesterday } },
    }),
    prisma.emailLog.count({
      where: { createdAt: { gte: lastWeek } },
    }),
  ]);

  return {
    total,
    byType: Object.fromEntries(byType.map((t) => [t.type, t._count])),
    byStatus: Object.fromEntries(byStatus.map((s) => [s.status, s._count])),
    last24h,
    last7days,
  };
}

/**
 * Récupère l'historique des emails avec pagination
 */
export async function getEmailHistory(
  page: number = 1,
  limit: number = 20,
  filters?: {
    type?: EmailType;
    status?: EmailStatus;
    email?: string;
  }
): Promise<{
  emails: Array<{
    id: string;
    to: string;
    subject: string;
    type: EmailType;
    status: EmailStatus;
    createdAt: Date;
    resendId: string | null;
  }>;
  total: number;
  pages: number;
}> {
  const where: {
    type?: EmailType;
    status?: EmailStatus;
    to?: { contains: string; mode: "insensitive" };
  } = {};

  if (filters?.type) where.type = filters.type;
  if (filters?.status) where.status = filters.status;
  if (filters?.email) where.to = { contains: filters.email, mode: "insensitive" };

  const [emails, total] = await Promise.all([
    prisma.emailLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        to: true,
        subject: true,
        type: true,
        status: true,
        createdAt: true,
        resendId: true,
      },
    }),
    prisma.emailLog.count({ where }),
  ]);

  return {
    emails,
    total,
    pages: Math.ceil(total / limit),
  };
}
