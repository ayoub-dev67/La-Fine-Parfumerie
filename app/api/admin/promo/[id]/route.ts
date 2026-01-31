import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour modifier un code promo
const UpdatePromoCodeSchema = z.object({
  code: z.string().min(3).toUpperCase().optional(),
  discountPercent: z.number().min(0).max(100).optional().nullable(),
  discountAmount: z.number().min(0).optional().nullable(),
  minPurchase: z.number().min(0).optional().nullable(),
  maxUses: z.number().int().min(1).optional().nullable(),
  validFrom: z.string().optional(),
  validUntil: z.string().optional().nullable(),
  isActive: z.boolean().optional(),
});

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
 * GET /api/admin/promo/[id]
 * Récupérer un code promo par ID (admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await checkAdmin();
  if ("error" in authCheck) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    );
  }

  try {
    const { id } = await params;

    const promoCode = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!promoCode) {
      return NextResponse.json(
        { error: "Code promo non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error("Erreur récupération code promo:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/promo/[id]
 * Modifier un code promo existant (admin only)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await checkAdmin();
  if ("error" in authCheck) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    );
  }

  try {
    const { id } = await params;
    const body = await request.json();

    // Validation
    const validation = UpdatePromoCodeSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Données invalides", details: validation.error.issues },
        { status: 400 }
      );
    }

    const data = validation.data;

    // Vérifier que le code existe
    const existing = await prisma.promoCode.findUnique({
      where: { id },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Code promo non trouvé" },
        { status: 404 }
      );
    }

    // Si on change le code, vérifier qu'il n'existe pas déjà
    if (data.code && data.code !== existing.code) {
      const duplicate = await prisma.promoCode.findUnique({
        where: { code: data.code },
      });
      if (duplicate) {
        return NextResponse.json(
          { error: "Ce code promo existe déjà" },
          { status: 409 }
        );
      }
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {};

    if (data.code !== undefined) updateData.code = data.code;
    if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
    if (data.discountAmount !== undefined) updateData.discountAmount = data.discountAmount;
    if (data.minPurchase !== undefined) updateData.minPurchase = data.minPurchase;
    if (data.maxUses !== undefined) updateData.maxUses = data.maxUses;
    if (data.validFrom !== undefined) updateData.validFrom = new Date(data.validFrom);
    if (data.validUntil !== undefined) updateData.validUntil = data.validUntil ? new Date(data.validUntil) : null;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Mettre à jour le code promo
    const promoCode = await prisma.promoCode.update({
      where: { id },
      data: updateData,
    });

    console.log(`📝 Code promo mis à jour: ${promoCode.code}`);

    return NextResponse.json(promoCode);
  } catch (error) {
    console.error("Erreur mise à jour code promo:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du code promo" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/promo/[id]
 * Supprimer un code promo (admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await checkAdmin();
  if ("error" in authCheck) {
    return NextResponse.json(
      { error: authCheck.error },
      { status: authCheck.status }
    );
  }

  try {
    const { id } = await params;

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
