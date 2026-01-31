'use client';

/**
 * ERROR BOUNDARY - GESTION GLOBALE DES ERREURS
 * Intercepte les erreurs et affiche une page élégante
 * Intégré avec Sentry pour le tracking en production
 */

import { useEffect } from 'react';
import Link from 'next/link';
import * as Sentry from '@sentry/nextjs';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Envoyer l'erreur à Sentry pour le monitoring
    Sentry.captureException(error, {
      tags: {
        section: 'error-boundary',
        digest: error.digest,
      },
    });
    console.error('Error caught by boundary:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Icône d'erreur */}
        <div className="w-24 h-24 mx-auto border-2 border-[#c5a059]/30 rounded-full flex items-center justify-center">
          <svg
            className="w-12 h-12 text-[#c5a059]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Titre */}
        <div>
          <h1 className="font-serif text-4xl md:text-5xl text-[#c5a059] mb-4">
            Oups !
          </h1>
          <h2 className="text-xl font-semibold text-white mb-2">
            Une erreur est survenue
          </h2>
          <p className="text-gray-400">
            {error.message || "Nous rencontrons des difficultés techniques."}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors shadow-lg shadow-[#c5a059]/20"
          >
            Réessayer
          </button>
          <Link
            href="/"
            className="px-6 py-3 bg-black border border-[#c5a059]/20 text-white rounded-lg hover:border-[#c5a059]/50 transition-colors font-semibold"
          >
            Retour à l&apos;accueil
          </Link>
        </div>

        {/* Message de support */}
        <div className="pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500">
            Si le problème persiste, contactez-nous à{' '}
            <a
              href="mailto:contact@lafineparfumerie.fr"
              className="text-[#c5a059] hover:underline"
            >
              contact@lafineparfumerie.fr
            </a>
          </p>
          {error.digest && (
            <p className="text-xs text-gray-600 mt-2">
              Code erreur: {error.digest}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
