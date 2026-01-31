/**
 * API Push Subscribe
 * POST /api/push/subscribe - Enregistre une subscription push
 * DELETE /api/push/subscribe - Supprime les subscriptions
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const subscription = await request.json();

    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Subscription invalide' },
        { status: 400 }
      );
    }

    // Vérifier si cette subscription existe déjà
    const existing = await prisma.pushSubscription.findFirst({
      where: {
        userId: session.user.id,
        subscription: {
          contains: subscription.endpoint,
        },
      },
    });

    if (existing) {
      // Mettre à jour la subscription existante
      await prisma.pushSubscription.update({
        where: { id: existing.id },
        data: { subscription: JSON.stringify(subscription) },
      });
    } else {
      // Créer nouvelle subscription
      await prisma.pushSubscription.create({
        data: {
          userId: session.user.id,
          subscription: JSON.stringify(subscription),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Notifications activées',
    });
  } catch (error) {
    console.error('[PUSH API] Erreur subscribe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Supprimer toutes les subscriptions de l'utilisateur
    await prisma.pushSubscription.deleteMany({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      success: true,
      message: 'Notifications désactivées',
    });
  } catch (error) {
    console.error('[PUSH API] Erreur unsubscribe:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// GET - Vérifie si l'utilisateur a des notifications actives
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ subscribed: false });
    }

    const count = await prisma.pushSubscription.count({
      where: { userId: session.user.id },
    });

    return NextResponse.json({
      subscribed: count > 0,
      count,
    });
  } catch (error) {
    console.error('[PUSH API] Erreur GET:', error);
    return NextResponse.json({ subscribed: false });
  }
}
