'use client';

/**
 * ReferralCard - Affiche le code de parrainage et les statistiques
 */

import { useEffect, useState } from 'react';
import { REFERRAL_CONFIG } from '@/lib/referral';

interface ReferralData {
  code: string;
  link: string;
  total: number;
  completed: number;
  pending: number;
  totalReward: number;
  referrals: Array<{
    id: string;
    status: string;
    reward: number;
    createdAt: string;
    completedAt: string | null;
    referee: {
      name: string;
      joinedAt: string;
    } | null;
  }>;
}

export function ReferralCard() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState<'code' | 'link' | null>(null);

  useEffect(() => {
    fetchReferralData();
  }, []);

  async function fetchReferralData() {
    try {
      const res = await fetch('/api/referral/code');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Erreur chargement parrainage:', error);
    } finally {
      setLoading(false);
    }
  }

  function copyToClipboard(text: string, type: 'code' | 'link') {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-noir to-gray-900 rounded-xl p-6 border border-or/20 animate-pulse">
        <div className="h-8 bg-or/20 rounded w-1/2 mb-4" />
        <div className="h-16 bg-or/10 rounded w-full mb-4" />
        <div className="h-12 bg-creme/10 rounded w-full" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-gradient-to-br from-noir to-gray-900 rounded-xl p-6 border border-or/20 text-center">
        <p className="text-creme/60">Impossible de charger les données</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-noir to-gray-900 rounded-xl p-6 border border-or/20">
      {/* Votre code */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-or mb-3">Votre Code de Parrainage</h3>
        <div className="bg-noir rounded-lg p-4 text-center border border-or/30">
          <div className="text-3xl font-mono font-bold text-or tracking-widest mb-2">
            {data.code}
          </div>
          <p className="text-xs text-creme/50">
            Partagez ce code avec vos amis
          </p>
        </div>
      </div>

      {/* Boutons de partage */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={() => copyToClipboard(data.code, 'code')}
          className={`py-3 px-4 rounded-lg font-medium transition-colors ${
            copied === 'code'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-or text-noir hover:bg-or/90'
          }`}
        >
          {copied === 'code' ? '✓ Copié !' : 'Copier le code'}
        </button>
        <button
          onClick={() => copyToClipboard(data.link, 'link')}
          className={`py-3 px-4 rounded-lg font-medium transition-colors ${
            copied === 'link'
              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
              : 'bg-noir border border-or/30 text-creme hover:border-or'
          }`}
        >
          {copied === 'link' ? '✓ Copié !' : 'Copier le lien'}
        </button>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center p-3 bg-noir/50 rounded-lg">
          <div className="text-2xl font-bold text-or">{data.completed}</div>
          <div className="text-xs text-creme/50">Validés</div>
        </div>
        <div className="text-center p-3 bg-noir/50 rounded-lg">
          <div className="text-2xl font-bold text-yellow-400">{data.pending}</div>
          <div className="text-xs text-creme/50">En attente</div>
        </div>
        <div className="text-center p-3 bg-noir/50 rounded-lg">
          <div className="text-2xl font-bold text-green-400">{data.totalReward}€</div>
          <div className="text-xs text-creme/50">Gagnés</div>
        </div>
      </div>

      {/* Liste des parrainages */}
      {data.referrals.length > 0 && data.referrals.some((r) => r.referee) && (
        <div>
          <h4 className="text-sm font-semibold text-creme/80 mb-3">Vos parrainages</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {data.referrals
              .filter((r) => r.referee)
              .map((r) => (
                <div
                  key={r.id}
                  className="flex justify-between items-center p-3 bg-noir/30 rounded-lg"
                >
                  <div>
                    <div className="text-creme text-sm">{r.referee?.name}</div>
                    <div className="text-xs text-creme/40">
                      {new Date(r.createdAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      r.status === 'COMPLETED'
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-yellow-500/20 text-yellow-400'
                    }`}
                  >
                    {r.status === 'COMPLETED' ? `+${r.reward}€` : 'En attente'}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Partage social */}
      <div className="mt-6 pt-6 border-t border-or/10">
        <p className="text-sm text-creme/60 mb-3">Partager sur :</p>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/?text=Découvre La Fine Parfumerie et profite de ${REFERRAL_CONFIG.REWARD_AMOUNT}€ avec mon code ${data.code} : ${data.link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 bg-[#25D366]/20 text-[#25D366] rounded-lg text-center text-sm hover:bg-[#25D366]/30 transition-colors"
          >
            WhatsApp
          </a>
          <a
            href={`mailto:?subject=Découvre La Fine Parfumerie&body=Je te recommande La Fine Parfumerie ! Utilise mon code ${data.code} pour ${REFERRAL_CONFIG.REWARD_AMOUNT}€ de réduction : ${data.link}`}
            className="flex-1 py-2 px-3 bg-creme/10 text-creme rounded-lg text-center text-sm hover:bg-creme/20 transition-colors"
          >
            Email
          </a>
          <a
            href={`https://twitter.com/intent/tweet?text=Découvre La Fine Parfumerie avec ${REFERRAL_CONFIG.REWARD_AMOUNT}€ de réduction : ${data.link}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 bg-[#1DA1F2]/20 text-[#1DA1F2] rounded-lg text-center text-sm hover:bg-[#1DA1F2]/30 transition-colors"
          >
            Twitter
          </a>
        </div>
      </div>
    </div>
  );
}
