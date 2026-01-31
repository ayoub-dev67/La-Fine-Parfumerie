"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Page affichée quand l'utilisateur annule le paiement
 * Le panier est conservé pour permettre une nouvelle tentative
 */
export default function CancelPage() {
  const router = useRouter();

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white rounded-lg shadow-lg p-8 text-center">
        {/* Icône d'annulation */}
        <div className="mb-6">
          <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        {/* Message */}
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Paiement annulé
        </h1>
        <p className="text-gray-600 mb-6">
          Votre paiement a été annulé. Aucun montant n'a été débité.
        </p>

        {/* Informations */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
          <h3 className="font-semibold text-yellow-900 mb-2">
            Que s'est-il passé ?
          </h3>
          <p className="text-sm text-yellow-800 mb-2">
            Vous avez quitté la page de paiement Stripe sans finaliser votre achat.
          </p>
          <p className="text-sm text-yellow-800">
            Votre panier a été conservé. Vous pouvez réessayer quand vous le souhaitez.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={() => router.push("/checkout")}
            className="flex-1 bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors font-semibold"
          >
            Réessayer le paiement
          </button>
          <Link
            href="/products"
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-center"
          >
            Continuer mes achats
          </Link>
        </div>

        {/* Lien retour accueil */}
        <div className="mt-6">
          <Link
            href="/"
            className="text-purple-600 hover:underline text-sm"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
