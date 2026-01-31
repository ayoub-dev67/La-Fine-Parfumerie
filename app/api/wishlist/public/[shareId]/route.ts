/**
 * Public Wishlist API
 * GET - Get wishlist by share ID (public access)
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    if (!shareId) {
      return NextResponse.json(
        { error: 'ID de partage manquant' },
        { status: 400 }
      );
    }

    // Find user with this share ID
    const user = await prisma.user.findUnique({
      where: { wishlistShareId: shareId },
      select: {
        id: true,
        name: true,
        image: true,
        wishlistPublic: true,
        wishlist: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                price: true,
                image: true,
                volume: true,
                stock: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Wishlist non trouvée' },
        { status: 404 }
      );
    }

    // Check if wishlist is public
    if (!user.wishlistPublic) {
      return NextResponse.json(
        { error: 'Cette wishlist n\'est pas publique' },
        { status: 403 }
      );
    }

    // Format response
    const products = user.wishlist.map(item => ({
      ...item.product,
      addedAt: item.createdAt
    }));

    return NextResponse.json({
      owner: {
        name: user.name || 'Utilisateur',
        image: user.image
      },
      products,
      totalItems: products.length,
      totalValue: products.reduce((sum, p) => sum + Number(p.price), 0)
    });

  } catch (error) {
    console.error('Error fetching public wishlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}
