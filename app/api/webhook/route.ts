import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import {
  updateOrderStatus,
  InsufficientStockError,
  OrderNotFoundError,
} from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/email";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

/**
 * API Route pour recevoir les webhooks Stripe
 * POST /api/webhook
 *
 * @security
 * - Vérification cryptographique de la signature Stripe
 * - Validation du STRIPE_WEBHOOK_SECRET
 * - Gestion atomique des erreurs de stock
 * - Logging sécurisé (sans données sensibles)
 */
export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    console.error("❌ Webhook: Signature manquante");
    return NextResponse.json(
      { error: "Signature manquante" },
      { status: 400 }
    );
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error("❌ STRIPE_WEBHOOK_SECRET non configuré");
    return NextResponse.json(
      { error: "Configuration webhook manquante" },
      { status: 500 }
    );
  }

  let event: Stripe.Event;

  try {
    // Vérification de la signature Stripe
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (error) {
    console.error("❌ Erreur vérification signature webhook:", error);
    return NextResponse.json(
      { error: "Signature invalide" },
      { status: 400 }
    );
  }

  // Traitement des événements Stripe
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`✅ Webhook: Paiement réussi pour session ${session.id}`);

        // Mise à jour de la commande en "paid" + décrémentation stock
        const order = await updateOrderStatus(session.id, "paid");

        if (order) {
          console.log(`✅ Commande ${order.id} marquée comme PAYÉE`);
          console.log(`   Montant: ${order.totalAmount}€`);
          console.log(`   Articles: ${order.items.length}`);
          console.log(`   📉 Stocks mis à jour dans PostgreSQL`);

          // Incrémenter le compteur du code promo si utilisé
          const promoCodeUsed = session.metadata?.promoCode;
          if (promoCodeUsed) {
            try {
              await prisma.promoCode.update({
                where: { code: promoCodeUsed },
                data: { usedCount: { increment: 1 } },
              });
              console.log(`🏷️ Code promo ${promoCodeUsed} utilisé (compteur incrémenté)`);
            } catch (promoError) {
              console.error(`⚠️ Erreur mise à jour code promo:`, promoError);
            }
          }

          // Envoyer l'email de confirmation
          try {
            // Récupérer les informations complètes de la commande pour l'email
            const fullOrder = await prisma.order.findUnique({
              where: { id: order.id },
              include: {
                user: {
                  select: {
                    email: true,
                    name: true,
                  },
                },
                items: {
                  include: {
                    product: {
                      select: {
                        name: true,
                        brand: true,
                        volume: true,
                        price: true,
                      },
                    },
                  },
                },
              },
            });

            if (fullOrder && fullOrder.user) {
              // Formater les items pour l'email
              const emailItems = fullOrder.items.map((item) => ({
                id: item.id,
                name: item.product.name,
                brand: item.product.brand || "",
                volume: item.product.volume || "",
                quantity: item.quantity,
                price: Number(item.product.price),
              }));

              const emailOrder = {
                id: fullOrder.id,
                items: emailItems,
                totalAmount: Number(fullOrder.totalAmount),
                createdAt: fullOrder.createdAt,
              };

              const emailCustomer = {
                email: fullOrder.user.email,
                name: fullOrder.user.name,
              };

              // Envoi asynchrone (ne bloque pas le webhook)
              sendOrderConfirmation(emailOrder, emailCustomer).catch((error) => {
                console.error("❌ Erreur envoi email confirmation:", error);
              });

              console.log(`📧 Email de confirmation envoyé à ${fullOrder.user.email}`);
            }
          } catch (emailError) {
            // Ne pas faire échouer le webhook si l'email échoue
            console.error("❌ Erreur préparation email:", emailError);
          }
        } else {
          console.warn(`⚠️ Commande introuvable pour session ${session.id}`);
        }

        break;
      }

      case "checkout.session.expired": {
        const session = event.data.object as Stripe.Checkout.Session;
        console.log(`⏱️ Webhook: Session expirée ${session.id}`);

        // Mise à jour de la commande en "cancelled"
        await updateOrderStatus(session.id, "cancelled");
        break;
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log(`❌ Webhook: Paiement échoué ${paymentIntent.id}`);

        // Note: payment_intent n'a pas directement le session_id
        // En prod, on stockerait payment_intent_id dans la commande
        break;
      }

      default:
        console.log(`ℹ️ Webhook: Événement non géré: ${event.type}`);
    }

    // Réponse 200 obligatoire pour Stripe
    return NextResponse.json({ received: true });
  } catch (error) {
    // Gestion des erreurs spécifiques
    if (error instanceof InsufficientStockError) {
      // Stock insuffisant lors du paiement - situation critique
      console.error(
        `🚨 ALERTE STOCK: Produit ${error.productId} (${error.productName}) - ` +
        `demandé: ${error.requested}, disponible: ${error.available}`
      );
      // On retourne 200 pour éviter que Stripe retry (le problème est côté stock)
      return NextResponse.json({
        received: true,
        warning: "Stock insuffisant - commande non finalisée",
      });
    }

    if (error instanceof OrderNotFoundError) {
      console.warn(`⚠️ Commande introuvable pour session: ${error.sessionId}`);
      // Retour 200 car ce n'est pas une erreur de Stripe
      return NextResponse.json({
        received: true,
        warning: "Commande non trouvée",
      });
    }

    console.error("❌ Erreur traitement webhook:", error);
    return NextResponse.json(
      {
        error: "Erreur traitement webhook",
        // Ne pas exposer les détails d'erreur en production
        details: process.env.NODE_ENV === "development"
          ? (error instanceof Error ? error.message : "Erreur inconnue")
          : "Une erreur est survenue",
      },
      { status: 500 }
    );
  }
}
