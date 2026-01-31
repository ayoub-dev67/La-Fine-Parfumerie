import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour créer/modifier un code promo
const PromoCodeSchema = z.object({
  code: z.string().min(3, "Le code doit faire au moins 3 caractères").toUpperCase(),
  discountPercent: z.number().min(0).max(100).optional().nullable(),
  discountAmount: z.number().min(0).optional().nullable(),
  minPurchase: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
}).refine(
  (data) => data.discountPercent || data.discountAmount,
  { message: "Vous devez spécifier une réduction en % ou en €" }
);

/**
 * Middleware de vérification admin
 */
async function checkAdmin() {
  const session = await auth();
  if (!session?.user) {
    return { error: "Non authentifié", status: 401 };
  }
  if (session.user.role !== "ADMIN") {
    return { error: "Accès refusé - Admin requis", status: 403 };
  }
  return { user: session.user };
}

/**
 * GET /api/admin/promo
 * Liste tous les codes promo (admin only)
 */
export async function GET() {
  const authCheck = await checkAdmin();
  if ("error" in authCheck) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    );
  }

  try {
    const promoCodes = await prisma.promoCode.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(promoCodes);
  } catch (error) {
    console.error("Erreur récupération codes promo:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/promo
 * Créer un nouveau code promo (admin only)
 */
export async function POST(request: NextRequest) {
  const authCheck = await checkAdmin();
  if ("error" in authCheck) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    );
  }

  try {
    const body = await request.json();

    // Validation
    const validation = PromoCodeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Vérifier que le code n'existe pas déjà
    const existing = await prisma.promoCode.findUnique({
      where: { code: data.code },
    });

    if (existing) {
      return NextResponse.json(
        { error: "Ce code promo existe déjà" },
        { status: 409 }
      );
    }

    // Créer le code promo
    const promoCode = await prisma.promoCode.create({
      data: {
        code: data.code,
        discountPercent: data.discountPercent || null,
        discountAmount: data.discountAmount || null,
        minPurchase: data.minPurchase || null,
        maxUses: data.maxUses || null,
        validFrom: data.validFrom ? new Date(data.validFrom) : new Date(),
        validUntil: data.validUntil ? new Date(data.validUntil) : null,
        isActive: data.isActive ?? true,
      },
    });

    console.log(`✅ Code promo créé: ${promoCode.code}`);

    return NextResponse.json(promoCode, { status: 201 });
  } catch (error) {
    console.error("Erreur création code promo:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du code promo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/promo
 * Supprimer un code promo (admin only)
 * Body: { id: string }
 */
export async function DELETE(request: NextRequest) {
  const authCheck = await checkAdmin();
  if ("error" in authCheck) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    );
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID du code promo requis" },
        { status: 400 }
      );
    }

    // Vérifier que le code existe
    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: "Code promo non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le code
    await prisma.promoCode.delete({
      where: { id },
    });

    console.log(`🗑️ Code promo supprimé: ${promoCode.code}`);

    return NextResponse.json({ success: true, deleted: promoCode.code });
  } catch (error) {
    console.error("Erreur suppression code promo:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du code promo" },
      { status: 500 }
    );
  }
}
