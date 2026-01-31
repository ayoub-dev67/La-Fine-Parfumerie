/**
 * API ROUTES - GESTION AVIS INDIVIDUEL
 * DELETE /api/reviews/[id] - Supprimer un avis (admin ou auteur)
 * PATCH  /api/reviews/[id] - Modifier un avis (auteur uniquement)
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

// Schéma de validation pour la modification d'un avis
const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),
  title: z.string().max(100).optional().nullable(),
  comment: z.string().min(10).max(1000).optional(),
});

// DELETE - Supprimer un avis
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Récupérer l'avis
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Avis non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier les permissions (auteur ou admin)
    const isAuthor = review.userId === session.user.id;
    const isAdmin = session.user.role === "ADMIN";

    if (!isAuthor && !isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé à supprimer cet avis" },
        { status: 403 }
      );
    }

    // Supprimer l'avis
    await prisma.review.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Avis supprimé" });
  } catch (error) {
    console.error("Erreur DELETE review:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'avis" },
      { status: 500 }
    );
  }
}

// PATCH - Modifier un avis (auteur uniquement)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Vérifier l'authentification
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Authentification requise" },
        { status: 401 }
      );
    }

    const { id } = await params;

    // Récupérer l'avis
    const review = await prisma.review.findUnique({
      where: { id },
    });

    if (!review) {
      return NextResponse.json(
        { error: "Avis non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que c'est l'auteur
    if (review.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Non autorisé à modifier cet avis" },
        { status: 403 }
      );
    }

    // Valider les données
    const body = await request.json();
    const parsed = updateReviewSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Données invalides", details: parsed.error.issues },
        { status: 400 }
      );
    }

    // Mettre à jour l'avis
    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        ...(parsed.data.rating !== undefined && { rating: parsed.data.rating }),
        ...(parsed.data.title !== undefined && { title: parsed.data.title }),
        ...(parsed.data.comment !== undefined && { comment: parsed.data.comment }),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(updatedReview);
  } catch (error) {
    console.error("Erreur PATCH review:", error);
    return NextResponse.json(
      { error: "Erreur lors de la modification de l'avis" },
      { status: 500 }
    );
  }
}
