import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

/**
 * API Route pour demander un reset de mot de passe
 * POST /api/auth/forgot-password
 *
 * @security
 * - Toujours retourner succès pour éviter l'énumération d'emails
 * - Token sécurisé généré avec crypto
 * - Expiration du token après 1 heure
 */

const forgotPasswordSchema = z.object({
  email: z.string().email("Email invalide"),
});

// Durée de validité du token (1 heure)
const TOKEN_EXPIRY_HOURS = 1;

export async function POST(request: NextRequest) {
  try {
    // 1. Valider l'email
    const body = await request.json();
    const validation = forgotPasswordSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Email invalide" },
        { status: 400 }
      );
    }

    const { email } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, password: true },
    });

    // Toujours retourner succès (sécurité contre l'énumération)
    if (!user) {
      console.log(`ℹ️ Password reset demandé pour email inconnu: ${normalizedEmail}`);
      return NextResponse.json({ message: "Email envoyé si le compte existe" });
    }

    // Vérifier que l'utilisateur utilise l'auth par mot de passe
    if (!user.password) {
      console.log(`ℹ️ Password reset demandé pour compte OAuth: ${normalizedEmail}`);
      return NextResponse.json({ message: "Email envoyé si le compte existe" });
    }

    // 3. Supprimer les anciens tokens pour cet email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // 4. Générer un nouveau token sécurisé
    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

    // 5. Sauvegarder le token
    await prisma.passwordResetToken.create({
      data: {
        email: normalizedEmail,
        token,
        expires,
      },
    });

    // 6. Construire le lien de reset
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const resetUrl = `${baseUrl}/auth/reset-password/${token}`;

    // 7. Récupérer le nom de l'utilisateur pour l'email
    const userWithName = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true },
    });

    // 8. Envoyer l'email de réinitialisation
    const emailResult = await sendPasswordResetEmail(
      { email: normalizedEmail, name: userWithName?.name },
      token,
      userWithName?.id
    );

    if (emailResult.success) {
      console.log(`📧 Email de réinitialisation envoyé à ${normalizedEmail}`);
    } else {
      console.error(`❌ Échec envoi email reset à ${normalizedEmail}`);
    }

    // En dev, on log aussi le lien pour faciliter les tests
    if (process.env.NODE_ENV === "development") {
      console.log(`🔐 Lien de réinitialisation pour ${normalizedEmail}:`);
      console.log(`   ${resetUrl}`);
    }

    return NextResponse.json({
      message: "Email envoyé si le compte existe",
      // En dev uniquement, pour faciliter les tests
      ...(process.env.NODE_ENV === "development" && { resetUrl }),
    });
  } catch (error) {
    console.error("❌ Erreur forgot-password:", error);

    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
