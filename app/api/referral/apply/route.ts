/**
 * API Appliquer Code de Parrainage
 * POST /api/referral/apply - Applique un code pour un utilisateur
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { applyReferralCode } from '@/lib/referral';
import { z } from 'zod';

const applySchema = z.object({
  code: z.string().min(6).max(10),
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
    const parsed = applySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Code invalide' },
        { status: 400 }
      );
    }

    const result = await applyReferralCode(session.user.id, parsed.data.code);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: result.message,
      discount: result.discount,
    });
  } catch (error) {
    console.error('[REFERRAL API] Erreur POST apply:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
