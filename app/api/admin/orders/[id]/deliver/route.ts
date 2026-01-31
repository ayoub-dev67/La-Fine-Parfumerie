/**
 * API ADMIN - MARQUER COMMANDE COMME LIVRÉE
 * POST /api/admin/orders/[id]/deliver
 *
 * @security
 * - Requiert authentification ADMIN
 * - Met à jour le statut de la commande
 * - Envoie automatiquement l'email de confirmation de livraison
 * - Programme un email de demande d'avis (7 jours après)
 */

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  sendDeliveryConfirmation,
  scheduleReviewRequestEmail,
} from "@/lib/email";

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

    // 2. Vérifier que la commande existe et est expédiée
    const existingOrder = await prisma.order.findUnique({
      where: { id: params.id },
      select: { id: true, status: true },
    });

    if (!existingOrder) {
      return NextResponse.json(
        { error: "Commande non trouvée" },
        { status: 404 }
      );
    }

    if (existingOrder.status !== "SHIPPED") {
      return NextResponse.json(
        { error: "La commande doit être expédiée avant d'être marquée comme livrée" },
        { status: 400 }
      );
    }

    // 3. Mettre à jour la commande
    const order = await prisma.order.update({
      where: { id: params.id },
      data: {
        status: "DELIVERED",
        deliveredAt: new Date(),
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
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

    console.log(`✅ Commande #${order.id} marquée comme livrée`);

    // 4. Envoyer l'email de confirmation de livraison
    if (order.user) {
      // Formater les items pour l'email
      const emailItems = order.items.map((item) => ({
        id: item.id,
        name: item.product.name,
        brand: item.product.brand || "",
        volume: item.product.volume || "",
        quantity: item.quantity,
        price: Number(item.product.price),
        productId: item.product.id,
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

      // Envoi de l'email de livraison (asynchrone)
      sendDeliveryConfirmation(emailOrder, emailCustomer, order.user.id).catch(
        (error) => {
          console.error("❌ Erreur envoi email livraison:", error);
        }
      );

      // 5. Programmer l'email de demande d'avis (7 jours après)
      scheduleReviewRequestEmail(
        order.id,
        order.user.id,
        order.user.email
      ).catch((error) => {
        console.error("❌ Erreur programmation email avis:", error);
      });

      console.log(`📅 Email de demande d'avis programmé pour dans 7 jours`);
    }

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        status: order.status,
        deliveredAt: order.deliveredAt,
      },
    });
  } catch (error) {
    console.error("❌ Erreur marquage livraison:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
