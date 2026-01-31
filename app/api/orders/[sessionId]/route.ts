import { NextRequest, NextResponse } from "next/server";
import { getOrderBySessionId } from "@/lib/orders";

/**
 * API Route: GET /api/orders/[sessionId]
 * Récupère une commande par son ID de session Stripe
 * Utilisé sur la page /success pour afficher les détails de la commande
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params;

    if (!sessionId) {
      return NextResponse.json(
        { error: "Session ID manquant" },
        { status: 400 }
      );
    }

    // Récupérer la commande depuis PostgreSQL
    const order = await getOrderBySessionId(sessionId);

    if (!order) {
      return NextResponse.json(
        { error: "Commande introuvable" },
        { status: 404 }
      );
    }

    // Retourner les informations de la commande
    return NextResponse.json({
      id: order.id,
      stripeSessionId: order.stripeSessionId,
      status: order.status,
      totalAmount: order.totalAmount,
      createdAt: order.createdAt,
      paidAt: order.paidAt,
      items: order.items,
      customerEmail: order.customerEmail,
    });
  } catch (error) {
    console.error("❌ Erreur lors de la récupération de la commande:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
