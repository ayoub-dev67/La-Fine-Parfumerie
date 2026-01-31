/**
 * API ADMIN - MARQUER COMMANDE COMME EXPÉDIÉE
 * POST /api/admin/orders/[id]/ship
 *
 * @security
 * - Requiert authentification ADMIN
 * - Met à jour le statut de la commande
 * - Envoie automatiquement l'email de notification
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendShippingNotification } from "@/lib/email";
import { z } from "zod";

// Schéma de validation
const shipOrderSchema = z.object({
  trackingNumber: z
    .string()
    .min(5, "Numéro de suivi trop court")
    .max(50, "Numéro de suivi trop long"),
  carrier: z
    .string()
    .min(2, "Nom du transporteur requis")
    .max(50, "Nom du transporteur trop long"),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Vérification de l'authentification
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 401 }
      );
    }

    // 2. Validation des données
    const body = await request.json();
    const validation = shipOrderSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json({ error: errors }, { status: 400 });
    }

    const { trackingNumber, carrier } = validation.data;

    // 3. Vérifier que la commande existe
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    // 4. Mettre à jour la commande
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "SHIPPED",
        trackingNumber,
        carrier,
        shippedAt: new Date(),
      },
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

    console.log(`✅ Commande #${order.id} marquée comme expédiée`);

    // 5. Envoyer l'email de notification
    if (order.user) {
      // Formater les items pour l'email
      const emailItems = order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        brand: item.product.brand || "",
        volume: item.product.volume || "",
        quantity: item.quantity,
        price: Number(item.product.price),
      }));

      const emailOrder = {
        id: order.id,
        items: emailItems,
        totalAmount: Number(order.totalAmount),
        createdAt: order.createdAt,
      };

      const emailCustomer = {
        email: order.user.email,
        name: order.user.name,
      };

      // Envoi asynchrone (ne bloque pas la réponse)
      sendShippingNotification(
        emailOrder,
        emailCustomer,
        trackingNumber,
        carrier
      ).catch((error) => {
        console.error("❌ Erreur envoi email expédition:", error);
      });
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        carrier: order.carrier,
        shippedAt: order.shippedAt,
      },
    });
  } catch (error) {
    console.error("❌ Erreur marquage expédition:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
