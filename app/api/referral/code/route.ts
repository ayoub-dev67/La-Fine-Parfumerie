/**
 * API Code de Parrainage
 * GET /api/referral/code - Récupère ou crée le code de l'utilisateur
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getOrCreateReferralCode, getReferralStats } from '@/lib/referral';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const code = await getOrCreateReferralCode(session.user.id);
    const stats = await getReferralStats(session.user.id);

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://lafineparfumerie.fr';
    const referralLink = `${baseUrl}?ref=${code}`;

    return NextResponse.json({
      code,
      link: referralLink,
      ...stats.stats,
      referrals: stats.referrals.map((r) => ({
        id: r.id,
        status: r.status,
        reward: r.reward,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        referee: r.referee
          ? {
              name: r.referee.name || r.referee.email?.split('@')[0],
              joinedAt: r.referee.createdAt,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error('[REFERRAL API] Erreur GET code:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
