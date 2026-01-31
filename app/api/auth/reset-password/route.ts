import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

/**
 * API Route pour réinitialiser le mot de passe
 * POST /api/auth/reset-password
 *
 * @security
 * - Validation du token
 * - Vérification de l'expiration
 * - Hash bcrypt du nouveau mot de passe
 * - Suppression du token après utilisation
 */

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token requis"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères")
    .max(100, "Mot de passe trop long")
    .regex(
      /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Le mot de passe doit contenir une majuscule, une minuscule et un chiffre"
    ),
});

export async function POST(request: NextRequest) {
  try {
    // 1. Valider les données
    const body = await request.json();
    const validation = resetPasswordSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { token, password } = validation.data;

    // 2. Trouver le token et vérifier sa validité
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 400 }
      );
    }

    // 3. Vérifier l'expiration
    if (new Date() > resetToken.expires) {
      // Supprimer le token expiré
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id },
      });

      return NextResponse.json(
        { error: "Ce lien a expiré. Veuillez en demander un nouveau." },
        { status: 400 }
      );
    }

    // 4. Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email: resetToken.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // 5. Hasher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // 6. Mettre à jour le mot de passe
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    // 7. Supprimer le token utilisé
    await prisma.passwordResetToken.delete({
      where: { id: resetToken.id },
    });

    console.log(`✅ Mot de passe réinitialisé pour: ${user.email}`);

    return NextResponse.json({
      message: "Mot de passe modifié avec succès",
    });
  } catch (error) {
    console.error("❌ Erreur reset-password:", error);

    return NextResponse.json(
      { error: "Une erreur est survenue" },
      { status: 500 }
    );
  }
}
