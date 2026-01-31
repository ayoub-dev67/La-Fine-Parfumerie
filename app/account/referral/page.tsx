import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { ReferralCard } from '@/components/ReferralCard';
import { REFERRAL_CONFIG } from '@/lib/referral';

export const metadata: Metadata = {
  title: 'Programme de Parrainage | La Fine Parfumerie',
  description: 'Parrainez vos amis et gagnez des réductions.',
};

export default async function ReferralPage() {
  const session = await auth();

  if (!session) {
    redirect('/auth/signin?callbackUrl=/account/referral');
  }

  return (
    <div className="min-h-screen bg-noir py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-or text-sm uppercase tracking-widest mb-4">
            Partagez la passion
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-creme mb-6">
            Programme de Parrainage
          </h1>
          <div className="w-16 h-px bg-or mx-auto" />
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Carte de parrainage */}
          <ReferralCard />

          {/* Comment ça marche */}
          <div className="bg-noir/50 rounded-xl p-6 border border-or/20">
            <h2 className="text-xl font-bold text-or mb-6">Comment ça marche ?</h2>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-or/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-or font-bold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-creme mb-1">Partagez votre code</h3>
                  <p className="text-sm text-creme/60">
                    Copiez votre code unique ou partagez votre lien avec vos amis
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-or/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-or font-bold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-creme mb-1">Votre ami s&apos;inscrit</h3>
                  <p className="text-sm text-creme/60">
                    Votre ami utilise votre code et reçoit <span className="text-or">{REFERRAL_CONFIG.REWARD_AMOUNT}€</span> de réduction
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-or/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-or font-bold">3</span>
                </div>
                <div>
                  <h3 className="font-semibold text-creme mb-1">Vous êtes récompensé</h3>
                  <p className="text-sm text-creme/60">
                    Dès sa première commande (min. {REFERRAL_CONFIG.MIN_ORDER_AMOUNT}€), vous recevez{' '}
                    <span className="text-or">{REFERRAL_CONFIG.REWARD_AMOUNT}€</span> + <span className="text-or">{REFERRAL_CONFIG.REFERRAL_POINTS} points</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Avantages */}
            <div className="mt-8 p-4 bg-gradient-to-r from-or/10 to-transparent rounded-lg">
              <h3 className="font-semibold text-or mb-3">Vos avantages</h3>
              <ul className="text-sm text-creme/70 space-y-2">
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-or" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{REFERRAL_CONFIG.REWARD_AMOUNT}€ de réduction par parrainage réussi</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-or" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>{REFERRAL_CONFIG.REFERRAL_POINTS} points fidélité bonus</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-or" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Parrainages illimités</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
