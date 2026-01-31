import { NextRequest, NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/orders";
import { sendOrderConfirmation } from "@/lib/email";
import { prisma } from "@/lib/prisma";

/**
 * ENDPOINT DE TEST - SIMULATION WEBHOOK STRIPE
 *
 * ⚠️ DÉVELOPPEMENT SEULEMENT ⚠️
 * Permet de simuler le webhook Stripe en local
 *
 * Usage: POST /api/test-webhook
 * Body: { "sessionId": "cs_test_xxx" }
 */
export async function POST(request: NextRequest) {
  // Bloquer en production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Endpoint désactivé en production" },
      { status: 403 }
    );
  }

  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId requis" },
        { status: 400 }
      );
    }

    console.log(`🧪 [TEST WEBHOOK] Simulation paiement pour session: ${sessionId}`);

    // Mise à jour de la commande en "paid"
    const order = await updateOrderStatus(sessionId, "paid");

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    console.log(`✅ [TEST WEBHOOK] Commande ${order.id} marquée comme PAYÉE`);

    // Envoyer l'email de confirmation
    try {
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

        await sendOrderConfirmation(emailOrder, emailCustomer);
        console.log(`📧 [TEST WEBHOOK] Email envoyé à ${fullOrder.user.email}`);
      }
    } catch (emailError) {
      console.error("❌ [TEST WEBHOOK] Erreur email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Commande mise à jour avec succès",
      orderId: order.id,
      status: order.status,
    });
  } catch (error) {
    console.error("❌ [TEST WEBHOOK] Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur lors du traitement",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}

// GET pour afficher les instructions
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Endpoint désactivé en production" },
      { status: 403 }
    );
  }

  return NextResponse.json({
    message: "Endpoint de test pour simuler le webhook Stripe",
    usage: "POST /api/test-webhook",
    body: {
      sessionId: "cs_test_xxx (ID de session Stripe)"
    },
    example: `
      fetch('/api/test-webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'cs_test_xxx' })
      })
    `,
    note: "⚠️ Développement seulement - Désactivé en production"
  });
}
