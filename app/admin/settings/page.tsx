/**
 * PARAMÈTRES ADMIN
 * Configuration de la boutique
 */

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#c5a059] font-serif">
          Paramètres
        </h1>
        <p className="text-gray-400 mt-1">Configuration de votre boutique</p>
      </div>

      {/* Informations générales */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c5a059] mb-4">
          Informations générales
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom de la boutique
            </label>
            <input
              type="text"
              defaultValue="La Fine Parfumerie"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Email de contact
            </label>
            <input
              type="email"
              defaultValue="contact@lafineparfumerie.com"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Téléphone
            </label>
            <input
              type="tel"
              defaultValue="+33 1 23 45 67 89"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Livraison */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c5a059] mb-4">Livraison</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Frais de livraison standard
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                defaultValue="4.90"
                className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
              />
              <span className="text-gray-400">€</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Livraison gratuite à partir de
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                step="0.01"
                defaultValue="50.00"
                className="flex-1 px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
              />
              <span className="text-gray-400">€</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Délai de livraison estimé
            </label>
            <input
              type="text"
              defaultValue="2-4 jours ouvrés"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Paiement */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c5a059] mb-4">Paiement</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-gray-800">
            <div>
              <p className="font-semibold text-white">Stripe</p>
              <p className="text-sm text-gray-400">
                Paiements par carte bancaire
              </p>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
              ✅ Activé
            </span>
          </div>
          <div className="p-4 bg-[#0a0a0a] rounded-lg border border-gray-800">
            <p className="text-sm text-gray-400 mb-2">
              Clé publique Stripe
            </p>
            <input
              type="text"
              value="pk_test_***"
              disabled
              className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-gray-500 text-sm"
            />
          </div>
        </div>
      </div>

      {/* Emails */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c5a059] mb-4">
          Emails transactionnels
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-gray-800">
            <div>
              <p className="font-semibold text-white">Resend</p>
              <p className="text-sm text-gray-400">
                Service d'envoi d'emails
              </p>
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded text-sm font-medium">
              ✅ Activé
            </span>
          </div>
          <div>
            <label className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-lg border border-gray-800 cursor-pointer hover:border-[#c5a059]/40 transition-colors">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-gray-600 text-[#c5a059] focus:ring-[#c5a059]"
              />
              <div>
                <p className="text-white font-medium">
                  Confirmation de commande
                </p>
                <p className="text-sm text-gray-400">
                  Envoyer un email après paiement
                </p>
              </div>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-lg border border-gray-800 cursor-pointer hover:border-[#c5a059]/40 transition-colors">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-gray-600 text-[#c5a059] focus:ring-[#c5a059]"
              />
              <div>
                <p className="text-white font-medium">
                  Notification d'expédition
                </p>
                <p className="text-sm text-gray-400">
                  Envoyer un email avec le tracking
                </p>
              </div>
            </label>
          </div>
          <div>
            <label className="flex items-center gap-3 p-4 bg-[#0a0a0a] rounded-lg border border-gray-800 cursor-pointer hover:border-[#c5a059]/40 transition-colors">
              <input
                type="checkbox"
                defaultChecked
                className="w-5 h-5 rounded border-gray-600 text-[#c5a059] focus:ring-[#c5a059]"
              />
              <div>
                <p className="text-white font-medium">Email de bienvenue</p>
                <p className="text-sm text-gray-400">
                  Envoyer un email aux nouveaux clients
                </p>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* SEO et Analytics */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c5a059] mb-4">
          SEO & Analytics
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Google Analytics ID
            </label>
            <input
              type="text"
              placeholder="G-XXXXXXXXXX"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Meta description par défaut
            </label>
            <textarea
              rows={3}
              defaultValue="La Fine Parfumerie - Découvrez notre collection exclusive de parfums de luxe, fragrances signature et coffrets cadeaux."
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Bouton de sauvegarde */}
      <div className="flex justify-end">
        <button
          disabled
          className="px-8 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#c5a059]/20"
        >
          💾 Sauvegarder les paramètres
        </button>
      </div>

      <p className="text-xs text-gray-500 text-center">
        Note: Cette page est actuellement en mode lecture seule. Les
        fonctionnalités de modification seront ajoutées prochainement.
      </p>
    </div>
  );
}
