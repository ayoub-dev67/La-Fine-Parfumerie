/**
 * API TEST - ENVOI D'EMAILS
 * GET /api/test-email?to=email@example.com&type=welcome|order|shipping
 *
 * Route de test pour vérifier l'envoi d'emails
 * À DÉSACTIVER EN PRODUCTION
 */

import { NextRequest, NextResponse } from "next/server";
import {
  sendOrderConfirmation,
  sendShippingNotification,
  sendWelcomeEmail,
  sendTestEmail,
} from "@/lib/email";

export async function GET(request: NextRequest) {
  // Désactiver en production
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json(
      { error: "Route désactivée en production" },
      { status: 403 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const to = searchParams.get("to") || "test@example.com";
    const type = searchParams.get("type") || "welcome";

    // Données de test
    const testOrder = {
      id: "TEST-" + Date.now(),
      items: [
        {
          id: "1",
          name: "Alexandria II",
          brand: "Xerjoff",
          volume: "50ml",
          quantity: 1,
          price: 89.99,
        },
        {
          id: "2",
          name: "Gold Intensitive",
          brand: "Montale",
          volume: "100ml",
          quantity: 2,
          price: 69.99,
        },
      ],
      totalAmount: 229.97,
      createdAt: new Date(),
    };

    const testCustomer = {
      email: to,
      name: "Test User",
    };

    let result;

    // Envoyer l'email selon le type
    switch (type) {
      case "order":
      case "confirmation":
        result = await sendOrderConfirmation(testOrder, testCustomer);
        break;

      case "shipping":
      case "shipped":
        result = await sendShippingNotification(
          testOrder,
          testCustomer,
          "1234567890ABCD",
          "Colissimo"
        );
        break;

      case "welcome":
      case "bienvenue":
        result = await sendWelcomeEmail(testCustomer);
        break;

      case "test":
        result = await sendTestEmail(to);
        break;

      default:
        return NextResponse.json(
          { error: "Type invalide. Utilisez: welcome, order, shipping, ou test" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: result.success,
      type,
      to,
      data: result.data,
      error: result.error,
    });
  } catch (error) {
    console.error("❌ Erreur test email:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
