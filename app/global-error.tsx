'use client';

/**
 * GLOBAL ERROR BOUNDARY
 * Capture les erreurs au niveau du layout root
 */

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        section: 'global-error-boundary',
        digest: error.digest,
      },
      level: 'fatal',
    });
  }, [error]);

  return (
    <html lang="fr">
      <body className="bg-[#0a0a0a] min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-4xl font-serif text-[#c5a059] mb-4">
            Erreur Critique
          </h1>
          <p className="text-gray-400 mb-8">
            Une erreur inattendue s&apos;est produite.
          </p>
          <button
            onClick={reset}
            className="px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors"
          >
            Réessayer
          </button>
          {error.digest && (
            <p className="text-xs text-gray-600 mt-4">
              Référence: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
