"use client";

/**
 * PAGE D'ERREUR AUTH
 * Affiche les erreurs d'authentification de manière élégante
 */

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  // Messages d'erreur selon le code
  const getErrorDetails = (errorCode: string | null) => {
    switch (errorCode) {
      case "Configuration":
        return {
          title: "Erreur de configuration",
          message: "Le serveur d'authentification n'est pas correctement configuré. Veuillez contacter l'administrateur.",
        };
      case "AccessDenied":
        return {
          title: "Accès refusé",
          message: "Vous n'avez pas la permission d'accéder à cette ressource.",
        };
      case "Verification":
        return {
          title: "Vérification impossible",
          message: "Le lien de vérification est invalide ou a expiré.",
        };
      case "OAuthSignin":
      case "OAuthCallback":
      case "OAuthCreateAccount":
      case "OAuthAccountNotLinked":
        return {
          title: "Erreur OAuth",
          message: "Un problème est survenu lors de la connexion avec votre compte externe. Essayez une autre méthode de connexion.",
        };
      case "EmailCreateAccount":
      case "EmailSignin":
        return {
          title: "Erreur email",
          message: "Un problème est survenu avec l'authentification par email.",
        };
      case "CredentialsSignin":
        return {
          title: "Identifiants incorrects",
          message: "L'email ou le mot de passe que vous avez entré est incorrect.",
        };
      case "SessionRequired":
        return {
          title: "Connexion requise",
          message: "Vous devez être connecté pour accéder à cette page.",
        };
      default:
        return {
          title: "Erreur d'authentification",
          message: "Une erreur inattendue s'est produite. Veuillez réessayer.",
        };
    }
  };

  const { title, message } = getErrorDetails(error);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 py-12">
      {/* Fond décoratif */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="font-serif text-3xl text-amber-500">
              La Fine Parfumerie
            </h1>
          </Link>
        </div>

        {/* Carte d'erreur */}
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-red-500/20 rounded-lg p-8 text-center">
          {/* Icône */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Titre */}
          <h2 className="text-xl font-semibold text-white mb-2">{title}</h2>

          {/* Message */}
          <p className="text-gray-400 mb-8">{message}</p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/auth/signin"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors"
            >
              Réessayer
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-white font-medium rounded-lg transition-colors"
            >
              Retour à l&apos;accueil
            </Link>
          </div>

          {/* Code d'erreur pour debug */}
          {error && process.env.NODE_ENV === "development" && (
            <p className="mt-6 text-xs text-gray-600">
              Code erreur: {error}
            </p>
          )}
        </div>
      </motion.div>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-amber-500">Chargement...</div>
      </div>
    }>
      <AuthErrorContent />
    </Suspense>
  );
}
