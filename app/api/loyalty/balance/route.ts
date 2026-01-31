/**
 * API Solde Fidélité
 * GET /api/loyalty/balance - Récupère le solde et l'historique
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getLoyaltyBalance } from '@/lib/loyalty';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const balance = await getLoyaltyBalance(session.user.id);

    return NextResponse.json(balance);
  } catch (error) {
    console.error('[LOYALTY API] Erreur GET balance:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
