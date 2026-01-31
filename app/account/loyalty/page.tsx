import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { LoyaltyCard } from '@/components/LoyaltyCard';
import { TIERS, POINTS_CONFIG } from '@/lib/loyalty';

export const metadata: Metadata = {
  title: 'Programme Fidélité | La Fine Parfumerie',
  description: 'Gérez vos points fidélité et découvrez vos avantages exclusifs.',
};

export default async function LoyaltyPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin?callbackUrl=/account/loyalty');
  }

  return (
    <div className="min-h-screen bg-noir py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-or text-sm uppercase tracking-widest mb-4">
            Programme Exclusif
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-creme mb-6">
            Programme Fidélité
          </h1>
          <div className="w-16 h-px bg-or mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Carte fidélité */}
          <LoyaltyCard />

          {/* Comment ça marche */}
          <div className="bg-noir/50 rounded-xl p-6 border border-or/20">
            <h2 className="text-xl font-bold text-or mb-6">Comment ça marche ?</h2>

            <div className="space-y-6 text-creme/80">
              {/* Gagner des points */}
              <div>
                <h3 className="font-semibold text-or mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-or/20 flex items-center justify-center text-xs text-or">1</span>
                  Gagner des points
                </h3>
                <ul className="text-sm space-y-2 ml-8 text-creme/70">
                  <li className="flex justify-between">
                    <span>Achat</span>
                    <span className="text-or">1€ = {POINTS_CONFIG.PURCHASE_MULTIPLIER} points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Parrainage</span>
                    <span className="text-or">+{POINTS_CONFIG.REFERRAL_BONUS} points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Avis produit</span>
                    <span className="text-or">+{POINTS_CONFIG.REVIEW_BONUS} points</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Anniversaire</span>
                    <span className="text-or">+{POINTS_CONFIG.BIRTHDAY_BONUS} points</span>
                  </li>
                </ul>
              </div>

              {/* Utiliser les points */}
              <div>
                <h3 className="font-semibold text-or mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-or/20 flex items-center justify-center text-xs text-or">2</span>
                  Utiliser vos points
                </h3>
                <p className="text-sm ml-8 text-creme/70">
                  {POINTS_CONFIG.REDEEM_RATE} points = 1€ de réduction sur votre prochaine commande
                  <br />
                  <span className="text-creme/50">(Minimum 1000 points)</span>
                </p>
              </div>

              {/* Les tiers */}
              <div>
                <h3 className="font-semibold text-or mb-3 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-or/20 flex items-center justify-center text-xs text-or">3</span>
                  Les statuts
                </h3>
                <ul className="text-sm space-y-3 ml-8">
                  {Object.entries(TIERS).map(([key, tier]) => (
                    <li key={key} className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span>{tier.emoji}</span>
                        <span className="text-creme/70">{tier.name}</span>
                        <span className="text-creme/40 text-xs">
                          ({tier.min.toLocaleString()} pts)
                        </span>
                      </div>
                      <span className="text-or font-medium">
                        {tier.discount > 0 ? `-${tier.discount}%` : '-'}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Avantages supplémentaires */}
        <div className="mt-12 bg-gradient-to-r from-or/10 to-transparent rounded-xl p-8 border border-or/20">
          <h2 className="text-2xl font-bold text-or mb-6 text-center">
            Avantages Exclusifs
          </h2>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div className="p-4">
              <div className="text-3xl mb-3">🎁</div>
              <h3 className="font-semibold text-creme mb-2">Offres Exclusives</h3>
              <p className="text-sm text-creme/60">
                Accès prioritaire aux ventes privées et nouveautés
              </p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-3">🚚</div>
              <h3 className="font-semibold text-creme mb-2">Livraison Offerte</h3>
              <p className="text-sm text-creme/60">
                Livraison gratuite dès le statut Argent
              </p>
            </div>
            <div className="p-4">
              <div className="text-3xl mb-3">✨</div>
              <h3 className="font-semibold text-creme mb-2">Échantillons</h3>
              <p className="text-sm text-creme/60">
                Échantillons surprise dans chaque commande
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
