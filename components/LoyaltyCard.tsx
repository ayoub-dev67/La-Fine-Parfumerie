'use client';

/**
 * LoyaltyCard - Affiche le statut fidélité de l'utilisateur
 */

import { useEffect, useState } from 'react';
import { TIERS, POINTS_CONFIG } from '@/lib/loyalty';

interface LoyaltyData {
  points: number;
  tier: keyof typeof TIERS;
  tierInfo: (typeof TIERS)[keyof typeof TIERS];
  nextTier: (typeof TIERS)[keyof typeof TIERS] | null;
  history: Array<{
    id: string;
    amount: number;
    reason: string;
    createdAt: string;
    order?: { id: string; totalAmount: number } | null;
  }>;
}

const REASON_LABELS: Record<string, string> = {
  PURCHASE: 'Achat',
  REDEEM: 'Utilisation',
  BONUS: 'Bonus',
  REFERRAL: 'Parrainage',
  REVIEW: 'Avis produit',
  BIRTHDAY: 'Anniversaire',
};

export function LoyaltyCard() {
  const [loyalty, setLoyalty] = useState<LoyaltyData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState(1000);

  useEffect(() => {
    fetchBalance();
  }, []);

  async function fetchBalance() {
    try {
      const res = await fetch('/api/loyalty/balance');
      const data = await res.json();
      setLoyalty(data);
    } catch (error) {
      console.error('Erreur chargement fidélité:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleRedeem() {
    if (!loyalty || redeemAmount > loyalty.points) return;

    setRedeeming(true);
    try {
      const res = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ points: redeemAmount }),
      });

      const data = await res.json();

      if (data.success) {
        alert(`${data.message} Vous avez maintenant ${data.remainingPoints} points.`);
        fetchBalance();
      } else {
        alert(data.error || 'Erreur lors de l\'utilisation des points');
      }
    } catch (error) {
      console.error('Erreur redeem:', error);
      alert('Erreur lors de l\'utilisation des points');
    } finally {
      setRedeeming(false);
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-noir to-gray-900 rounded-xl p-6 border border-or/20 animate-pulse">
        <div className="h-8 bg-or/20 rounded w-1/2 mb-4" />
        <div className="h-12 bg-or/10 rounded w-1/3 mb-4" />
        <div className="h-4 bg-creme/10 rounded w-full" />
      </div>
    );
  }

  if (!loyalty) {
    return (
      <div className="bg-gradient-to-br from-noir to-gray-900 rounded-xl p-6 border border-or/20 text-center">
        <p className="text-creme/60">Connectez-vous pour voir votre statut fidélité</p>
      </div>
    );
  }

  const progress = loyalty.nextTier
    ? ((loyalty.points - TIERS[loyalty.tier].min) /
        (loyalty.nextTier.min - TIERS[loyalty.tier].min)) *
      100
    : 100;

  const canRedeem = loyalty.points >= 1000;
  const maxRedeem = Math.floor(loyalty.points / 100) * 100;

  return (
    <div className="bg-gradient-to-br from-noir to-gray-900 rounded-xl p-6 border border-or/20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-or">Programme Fidélité</h3>
          <p className="text-creme/70 text-sm">
            Statut : {loyalty.tierInfo.emoji} {loyalty.tierInfo.name}
          </p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-or">
            {loyalty.points.toLocaleString()}
          </div>
          <div className="text-xs text-creme/50">points</div>
        </div>
      </div>

      {/* Barre de progression vers prochain tier */}
      {loyalty.nextTier && (
        <div className="mb-6">
          <div className="flex justify-between text-xs text-creme/60 mb-1">
            <span>{loyalty.tierInfo.emoji} {loyalty.tierInfo.name}</span>
            <span>{loyalty.nextTier.emoji} {loyalty.nextTier.name}</span>
          </div>
          <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-or to-yellow-500 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <p className="text-xs text-creme/50 mt-1 text-center">
            Plus que {(loyalty.nextTier.min - loyalty.points).toLocaleString()} points pour {loyalty.nextTier.name}
          </p>
        </div>
      )}

      {/* Avantages actuels */}
      <div className="bg-noir/50 rounded-lg p-4 mb-6">
        <p className="text-sm text-creme/80">
          Réduction permanente :{' '}
          <span className="text-or font-bold">{loyalty.tierInfo.discount}%</span>
        </p>
        <p className="text-xs text-creme/50 mt-1">
          1€ dépensé = {POINTS_CONFIG.PURCHASE_MULTIPLIER} points
          • {POINTS_CONFIG.REDEEM_RATE} points = 1€ de réduction
        </p>
      </div>

      {/* Utiliser des points */}
      {canRedeem && (
        <div className="bg-noir/30 rounded-lg p-4 mb-6">
          <h4 className="text-sm font-semibold text-or mb-3">Utiliser vos points</h4>
          <div className="flex items-center gap-3">
            <select
              value={redeemAmount}
              onChange={(e) => setRedeemAmount(parseInt(e.target.value))}
              className="flex-1 bg-noir border border-or/30 rounded-lg px-3 py-2 text-creme focus:border-or focus:outline-none"
              disabled={redeeming}
            >
              {Array.from({ length: Math.floor(maxRedeem / 1000) }, (_, i) => (i + 1) * 1000)
                .filter((v) => v <= maxRedeem)
                .map((points) => (
                  <option key={points} value={points}>
                    {points.toLocaleString()} pts = {points / POINTS_CONFIG.REDEEM_RATE}€
                  </option>
                ))}
            </select>
            <button
              onClick={handleRedeem}
              disabled={redeeming || redeemAmount > loyalty.points}
              className="px-4 py-2 bg-or text-noir font-semibold rounded-lg hover:bg-or/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {redeeming ? '...' : 'Utiliser'}
            </button>
          </div>
        </div>
      )}

      {/* Historique récent */}
      {loyalty.history && loyalty.history.length > 0 && (
        <div>
          <h4 className="text-sm font-semibold text-creme/80 mb-3">Historique récent</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {loyalty.history.map((h) => (
              <div
                key={h.id}
                className="flex justify-between items-center text-sm py-2 border-b border-or/10 last:border-0"
              >
                <div>
                  <span className="text-creme/70">{REASON_LABELS[h.reason] || h.reason}</span>
                  <span className="text-xs text-creme/40 ml-2">
                    {new Date(h.createdAt).toLocaleDateString('fr-FR')}
                  </span>
                </div>
                <span
                  className={`font-medium ${
                    h.amount > 0 ? 'text-green-400' : 'text-red-400'
                  }`}
                >
                  {h.amount > 0 ? '+' : ''}
                  {h.amount.toLocaleString()} pts
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
