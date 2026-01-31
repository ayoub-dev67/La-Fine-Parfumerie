import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * API Route pour l'inscription par email/password
 * POST /api/auth/register
 *
 * @security
 * - Validation stricte des données avec Zod
 * - Hash bcrypt du mot de passe (12 rounds)
 * - Email normalisé en minuscules
 */

// Schéma de validation
const registerSchema = z.object({
  name: z
    .string()
    .min(2, "Le nom doit contenir au moins 2 caractères")
    .max(100, "Le nom est trop long"),
  email: z
    .string()
    .email("Email invalide")
    .max(255, "Email trop long"),
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
    // 1. Récupérer et valider les données
    const body = await request.json();
    const validation = registerSchema.safeParse(body);

    if (!validation.success) {
      const errors = validation.error.issues
        .map((err) => err.message)
        .join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    const { name, email, password } = validation.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 2. Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      // Message générique pour éviter l'énumération d'emails
      return NextResponse.json(
        { error: "Un compte avec cet email existe déjà" },
        { status: 409 }
      );
    }

    // 3. Hasher le mot de passe (12 rounds pour la sécurité)
    const hashedPassword = await bcrypt.hash(password, 12);

    // 4. Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        emailVerified: new Date(), // Marquer comme vérifié pour simplifier
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    console.log(`✅ Nouvel utilisateur créé: ${user.email}`);

    // Envoyer l'email de bienvenue (en arrière-plan)
    sendWelcomeEmail(
      { email: user.email, name: user.name },
      user.id,
      "BIENVENUE10"
    ).catch((error) => {
      console.error("❌ Erreur envoi email bienvenue:", error);
    });

    return NextResponse.json(
      {
        message: "Compte créé avec succès",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("❌ Erreur lors de l'inscription:", error);

    return NextResponse.json(
      { error: "Une erreur est survenue lors de la création du compte" },
      { status: 500 }
    );
  }
}
