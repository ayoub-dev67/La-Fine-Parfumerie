import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * API Route pour vérifier la validité d'un token de reset
 * GET /api/auth/verify-reset-token?token=xxx
 *
 * @security
 * - Vérifie l'existence et l'expiration du token
 * - Ne révèle pas d'informations sur l'email associé
 */

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ valid: false });
    }

    // Chercher le token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      select: { expires: true },
    });

    if (!resetToken) {
      return NextResponse.json({ valid: false });
    }

    // Vérifier l'expiration
    if (new Date() > resetToken.expires) {
      // Nettoyer le token expiré
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return NextResponse.json({ valid: false });
    }

    return NextResponse.json({ valid: true });
  } catch (error) {
    console.error("❌ Erreur verify-reset-token:", error);
    return NextResponse.json({ valid: false });
  }
}
