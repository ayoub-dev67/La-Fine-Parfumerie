/**
 * API Utilisation Points Fidélité
 * POST /api/loyalty/redeem - Utilise des points pour une réduction
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { redeemPoints } from '@/lib/loyalty';
import { z } from 'zod';

const redeemSchema = z.object({
  points: z
    .number()
    .min(1000, 'Minimum 1000 points requis')
    .multipleOf(100, 'Les points doivent être un multiple de 100'),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Non authentifié' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const parsed = redeemSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { points } = parsed.data;

    const result = await redeemPoints(session.user.id, points);

    return NextResponse.json({
      success: true,
      discount: result.discount,
      remainingPoints: result.remainingPoints,
      message: `Réduction de ${result.discount}€ appliquée !`,
    });
  } catch (error) {
    console.error('[LOYALTY API] Erreur POST redeem:', error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
