/**
 * Wishlist Share API
 * POST - Generate or toggle share link
 * DELETE - Remove share link
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { nanoid } from 'nanoid';

// Generate or toggle share link
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body; // 'generate' | 'toggle'

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { wishlistShareId: true, wishlistPublic: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    if (action === 'toggle') {
      // Toggle visibility
      const updated = await prisma.user.update({
        where: { id: session.user.id },
        data: { wishlistPublic: !user.wishlistPublic },
        select: { wishlistShareId: true, wishlistPublic: true }
      });

      return NextResponse.json({
        shareId: updated.wishlistShareId,
        isPublic: updated.wishlistPublic,
        message: updated.wishlistPublic ? 'Wishlist partagée' : 'Wishlist privée'
      });
    }

    // Generate new share ID
    const shareId = nanoid(12);

    const updated = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        wishlistShareId: shareId,
        wishlistPublic: true
      },
      select: { wishlistShareId: true, wishlistPublic: true }
    });

    return NextResponse.json({
      shareId: updated.wishlistShareId,
      isPublic: updated.wishlistPublic,
      shareUrl: `${process.env.NEXT_PUBLIC_BASE_URL || ''}/wishlist/${updated.wishlistShareId}`,
      message: 'Lien de partage généré'
    });

  } catch (error) {
    console.error('Error sharing wishlist:', error);
    return NextResponse.json(
      { error: 'Erreur lors du partage' },
      { status: 500 }
    );
  }
}

// Get current share status
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { wishlistShareId: true, wishlistPublic: true }
    });

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 });
    }

    return NextResponse.json({
      shareId: user.wishlistShareId,
      isPublic: user.wishlistPublic,
      shareUrl: user.wishlistShareId
        ? `${process.env.NEXT_PUBLIC_BASE_URL || ''}/wishlist/${user.wishlistShareId}`
        : null
    });

  } catch (error) {
    console.error('Error getting share status:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération' },
      { status: 500 }
    );
  }
}

// Remove share link
export async function DELETE() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        wishlistShareId: null,
        wishlistPublic: false
      }
    });

    return NextResponse.json({
      message: 'Lien de partage supprimé'
    });

  } catch (error) {
    console.error('Error removing share link:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la suppression' },
      { status: 500 }
    );
  }
}
