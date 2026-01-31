/**
 * PAGE 404 - RESSOURCE NON TROUVÉE
 * Page affichée quand une URL n'existe pas
 */

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center space-y-8">
        {/* Numéro 404 stylisé */}
        <div>
          <h1 className="font-serif text-8xl md:text-9xl text-[#c5a059] mb-4 tracking-tighter">
            404
          </h1>
          <div className="w-24 h-px bg-[#c5a059] mx-auto mb-6" />
        </div>

        {/* Message */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl md:text-3xl text-white">
            Page introuvable
          </h2>
          <p className="text-gray-400 max-w-sm mx-auto">
            La page que vous recherchez n&apos;existe pas ou a été déplacée.
            Explorez notre collection de parfums d&apos;exception.
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
          <Link
            href="/"
            className="px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors shadow-lg shadow-[#c5a059]/20"
          >
            Retour à l&apos;accueil
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 bg-black border border-[#c5a059]/20 text-white rounded-lg hover:border-[#c5a059]/50 transition-colors font-semibold"
          >
            Voir la collection
          </Link>
        </div>

        {/* Suggestions */}
        <div className="pt-8 border-t border-gray-800">
          <p className="text-sm text-gray-500 mb-4">Pages populaires:</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/products?category=Signature"
              className="text-sm text-[#c5a059] hover:underline"
            >
              Signature Royale
            </Link>
            <span className="text-gray-700">•</span>
            <Link
              href="/products?category=Niche"
              className="text-sm text-[#c5a059] hover:underline"
            >
              Parfums Niche
            </Link>
            <span className="text-gray-700">•</span>
            <Link
              href="/orders"
              className="text-sm text-[#c5a059] hover:underline"
            >
              Mes commandes
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
