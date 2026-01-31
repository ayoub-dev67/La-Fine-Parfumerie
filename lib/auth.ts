/**
 * CONFIGURATION NEXTAUTH.JS V5
 * Authentification hybride : Google OAuth + Email/Password
 *
 * @security
 * - Credentials provider avec bcrypt pour les mots de passe
 * - JWT strategy pour les sessions
 * - Callbacks pour enrichir les tokens avec le rôle utilisateur
 */

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { z } from "zod";

// Debug au démarrage du serveur
console.log("🔐 NextAuth Configuration Check:");
console.log("   GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID ? `✅ (${process.env.GOOGLE_CLIENT_ID.substring(0, 15)}...)` : "❌ MANQUANT");
console.log("   GOOGLE_CLIENT_SECRET:", process.env.GOOGLE_CLIENT_SECRET ? "✅ Défini" : "❌ MANQUANT");
console.log("   NEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Défini" : "❌ MANQUANT");
console.log("   AUTH_SECRET:", process.env.AUTH_SECRET ? "✅ Défini" : "(non requis si NEXTAUTH_SECRET)");
console.log("   NEXTAUTH_URL:", process.env.NEXTAUTH_URL || "❌ MANQUANT");

// Schéma de validation pour les credentials
const credentialsSchema = z.object({
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Mot de passe trop court"),
});

// Configuration NextAuth
const authConfig: NextAuthConfig = {
  // Adapter pour OAuth (crée les users en DB)
  adapter: PrismaAdapter(prisma),

  // Trusthost pour éviter les erreurs de vérification
  trustHost: true,

  providers: [
    // ============================================
    // 1. GOOGLE OAUTH (Méthode principale - 80% des utilisateurs)
    // ============================================
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      // Permet de lier un compte Google à un compte existant
      allowDangerousEmailAccountLinking: true,
      // Force l'affichage du sélecteur de compte à chaque connexion
      authorization: {
        params: {
          prompt: "select_account",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // ============================================
    // 2. EMAIL + MOT DE PASSE (Alternative - 20%)
    // ============================================
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        // Validation avec Zod
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          console.warn("❌ Auth: Validation échouée", parsed.error.issues);
          return null;
        }

        const { email, password } = parsed.data;

        // Recherche de l'utilisateur
        const user = await prisma.user.findUnique({
          where: { email: email.toLowerCase() },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            image: true,
          },
        });

        if (!user) {
          console.warn(`❌ Auth: Utilisateur non trouvé: ${email}`);
          return null;
        }

        // Vérifier que l'utilisateur a un mot de passe (pas OAuth-only)
        if (!user.password) {
          console.warn(`❌ Auth: Compte OAuth uniquement: ${email}`);
          return null;
        }

        // Vérification du mot de passe
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
          console.warn(`❌ Auth: Mot de passe incorrect pour: ${email}`);
          return null;
        }

        console.log(`✅ Auth: Connexion réussie pour: ${email}`);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],

  // ============================================
  // CALLBACKS
  // ============================================
  callbacks: {
    // Callback signIn pour gérer les erreurs OAuth
    async signIn({ user, account, profile }) {
      // Debug
      console.log("🔑 SignIn callback:", {
        provider: account?.provider,
        email: user?.email,
        hasProfile: !!profile
      });

      // Permettre toujours credentials
      if (account?.provider === "credentials") {
        return true;
      }

      // Pour OAuth, vérifier que l'email existe
      if (account?.provider === "google") {
        if (!user.email) {
          console.error("❌ OAuth: Pas d'email fourni par Google");
          return "/auth/error?error=OAuthCallback";
        }
        console.log("✅ OAuth Google: Email validé:", user.email);
        return true;
      }

      return true;
    },

    // Enrichir le JWT avec les données utilisateur
    async jwt({ token, user, account }) {
      // Première connexion - user est défini
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role || "USER";
        console.log("🎫 JWT créé pour:", user.email);
      }

      // Si c'est une connexion OAuth, récupérer le rôle depuis la DB
      if (account?.provider === "google" && token.email) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email },
            select: { id: true, role: true },
          });
          if (dbUser) {
            token.id = dbUser.id;
            token.role = dbUser.role;
            console.log("🎫 JWT enrichi avec rôle:", dbUser.role);
          }
        } catch (error) {
          console.error("❌ Erreur récupération rôle:", error);
        }
      }

      return token;
    },

    // Enrichir la session avec les données du JWT
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },

    // Callback redirect pour éviter les boucles infinies
    async redirect({ url, baseUrl }) {
      console.log("🔄 Redirect:", { url, baseUrl });

      // Si l'URL est relative, la préfixer avec baseUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`;
      }
      // Si l'URL est sur le même domaine, l'autoriser
      if (url.startsWith(baseUrl)) {
        return url;
      }
      // Sinon, rediriger vers l'accueil
      return baseUrl;
    },
  },

  // ============================================
  // PAGES PERSONNALISÉES
  // ============================================
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },

  // ============================================
  // SESSION
  // ============================================
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 jours
  },

  // ============================================
  // DEBUG (développement uniquement)
  // ============================================
  debug: process.env.NODE_ENV === "development",
};

// ============================================
// TYPES ÉTENDUS POUR TYPESCRIPT
// ============================================
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
      role: string;
    };
  }

  interface User {
    role?: string;
  }

  interface JWT {
    id?: string;
    role?: string;
  }
}

// ============================================
// EXPORT NEXTAUTH
// ============================================
export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
