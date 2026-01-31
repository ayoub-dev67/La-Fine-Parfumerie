import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schéma de validation
const ValidatePromoSchema = z.object({
  code: z.string().min(1, "Code promo requis").toUpperCase(),
  cartTotal: z.number().positive("Montant du panier invalide"),
});

/**
 * API Route pour valider un code promo
 * POST /api/promo/validate
 *
 * Vérifie :
 * - Le code existe et est actif
 * - La période de validité
 * - Le nombre d'utilisations max
 * - Le montant minimum d'achat
 *
 * Retourne la réduction calculée si valide
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation des données
    const validation = ValidatePromoSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.issues },
        { status: 400 }
      );
    }

    const { code, cartTotal } = validation.data;

    // Recherche du code promo
    const promoCode = await prisma.promoCode.findUnique({
      where: { code: code.toUpperCase() },
    });

    // Code inexistant
    if (!promoCode) {
      return NextResponse.json(
        { error: "Code promo invalide", valid: false },
        { status: 404 }
      );
    }

    // Code désactivé
    if (!promoCode.isActive) {
      return NextResponse.json(
        { error: "Ce code promo n'est plus actif", valid: false },
        { status: 400 }
      );
    }

    // Vérification de la période de validité
    const now = new Date();

    if (promoCode.validFrom > now) {
      return NextResponse.json(
        { error: "Ce code promo n'est pas encore valide", valid: false },
        { status: 400 }
      );
    }

    if (promoCode.validUntil && promoCode.validUntil < now) {
      return NextResponse.json(
        { error: "Ce code promo a expiré", valid: false },
        { status: 400 }
      );
    }

    // Vérification du nombre d'utilisations
    if (promoCode.maxUses !== null && promoCode.usedCount >= promoCode.maxUses) {
      return NextResponse.json(
        { error: "Ce code promo a atteint sa limite d'utilisation", valid: false },
        { status: 400 }
      );
    }

    // Vérification du montant minimum
    if (promoCode.minPurchase !== null && cartTotal < promoCode.minPurchase) {
      return NextResponse.json(
        {
          error: `Montant minimum requis: ${promoCode.minPurchase.toFixed(2)} €`,
          valid: false,
          minPurchase: promoCode.minPurchase,
        },
        { status: 400 }
      );
    }

    // Calcul de la réduction
    let discountAmount = 0;
    let discountType: "percent" | "fixed" = "fixed";

    if (promoCode.discountPercent) {
      discountAmount = (cartTotal * promoCode.discountPercent) / 100;
      discountType = "percent";
    } else if (promoCode.discountAmount) {
      discountAmount = promoCode.discountAmount;
      discountType = "fixed";
    }

    // La réduction ne peut pas dépasser le total du panier
    discountAmount = Math.min(discountAmount, cartTotal);

    // Code valide - retourner les détails
    return NextResponse.json({
      valid: true,
      code: promoCode.code,
      discountType,
      discountPercent: promoCode.discountPercent,
      discountFixed: promoCode.discountAmount,
      discountAmount: Math.round(discountAmount * 100) / 100,
      newTotal: Math.round((cartTotal - discountAmount) * 100) / 100,
      message: discountType === "percent"
        ? `-${promoCode.discountPercent}% appliqué`
        : `-${promoCode.discountAmount?.toFixed(2)} € appliqué`,
    });

  } catch (error) {
    console.error("Erreur validation code promo:", error);
    return NextResponse.json(
      { error: "Erreur lors de la validation du code promo" },
      { status: 500 }
    );
  }
}
