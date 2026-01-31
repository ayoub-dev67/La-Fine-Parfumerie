import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/wishlist
 * Recupere la liste de souhaits de l'utilisateur connecte
 */
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifie" },
        { status: 401 }
      );
    }

    const wishlistItems = await prisma.wishlist.findMany({
      where: { userId: session.user.id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            price: true,
            image: true,
            volume: true,
            category: true,
            stock: true,
            isNew: true,
            isBestSeller: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      items: wishlistItems,
      count: wishlistItems.length,
    });
  } catch (error) {
    console.error("Erreur GET wishlist:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/wishlist
 * Ajoute un produit a la liste de souhaits
 */
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifie" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productId } = body;

    if (!productId || typeof productId !== "number") {
      return NextResponse.json(
        { error: "productId invalide" },
        { status: 400 }
      );
    }

    // Verifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return NextResponse.json(
        { error: "Produit non trouve" },
        { status: 404 }
      );
    }

    // Ajouter a la wishlist (upsert pour eviter les doublons)
    const wishlistItem = await prisma.wishlist.upsert({
      where: {
        userId_productId: {
          userId: session.user.id,
          productId: productId,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        productId: productId,
      },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            brand: true,
            price: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      item: wishlistItem,
      message: "Produit ajoute aux favoris",
    });
  } catch (error) {
    console.error("Erreur POST wishlist:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/wishlist
 * Supprime un produit de la liste de souhaits
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifie" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const productId = parseInt(searchParams.get("productId") || "");

    if (isNaN(productId)) {
      return NextResponse.json(
        { error: "productId invalide" },
        { status: 400 }
      );
    }

    // Supprimer de la wishlist
    await prisma.wishlist.deleteMany({
      where: {
        userId: session.user.id,
        productId: productId,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Produit retire des favoris",
    });
  } catch (error) {
    console.error("Erreur DELETE wishlist:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
