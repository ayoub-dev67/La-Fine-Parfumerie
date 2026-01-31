'use client';

/**
 * Page Admin - Clients VIP
 * Détection, segmentation et insights clients
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  SEGMENT_LABELS,
  ACTIVITY_LABELS,
  VIPSegment,
  ActivityStatus,
} from '@/lib/vip-detection';
import { LoyaltyTier } from '@prisma/client';

interface VIPCustomer {
  id: string;
  email: string;
  name: string | null;
  totalSpent: number;
  orderCount: number;
  avgOrderValue: number;
  lastOrderDate: string | null;
  daysSinceLastOrder: number | null;
  segment: VIPSegment;
  activityStatus: ActivityStatus;
  vipScore: number;
  loyaltyTier: LoyaltyTier | null;
  loyaltyPoints: number;
  reviewCount: number;
  wishlistCount: number;
  createdAt: string;
}

interface VIPStats {
  totalVIP: number;
  bySegment: Record<VIPSegment, number>;
  byActivity: Record<ActivityStatus, number>;
  totalRevenue: number;
  avgOrderValue: number;
  avgOrdersPerCustomer: number;
}

type ViewMode = 'all' | 'top' | 'at-risk';
type SortBy = 'score' | 'spent' | 'orders' | 'recency';

export default function VIPPage() {
  const [customers, setCustomers] = useState<VIPCustomer[]>([]);
  const [stats, setStats] = useState<VIPStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<ViewMode>('all');
  const [segmentFilter, setSegmentFilter] = useState<VIPSegment | ''>('');
  const [activityFilter, setActivityFilter] = useState<ActivityStatus | ''>('');
  const [sortBy, setSortBy] = useState<SortBy>('score');

  useEffect(() => {
    fetchData();
  }, [view, segmentFilter, activityFilter, sortBy]);

  async function fetchData() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('view', view);
      if (segmentFilter) params.set('segment', segmentFilter);
      if (activityFilter) params.set('activity', activityFilter);
      params.set('sortBy', sortBy);

      const response = await fetch(`/api/admin/vip?${params}`);
      if (response.ok) {
        const data = await response.json();
        setCustomers(data.customers);
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-or">Clients VIP</h1>
        <p className="text-creme/60 mt-1">
          Détection automatique et segmentation des clients premium
        </p>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Clients VIP"
            value={stats.totalVIP}
            icon="👑"
            subtext={`sur ${Object.values(stats.bySegment).reduce((a, b) => a + b, 0)} total`}
          />
          <StatCard
            label="Revenu Total"
            value={`${stats.totalRevenue.toLocaleString('fr-FR')} €`}
            icon="💰"
          />
          <StatCard
            label="Panier Moyen"
            value={`${stats.avgOrderValue.toFixed(0)} €`}
            icon="🛒"
          />
          <StatCard
            label="Commandes/Client"
            value={stats.avgOrdersPerCustomer.toFixed(1)}
            icon="📦"
          />
        </div>
      )}

      {/* Segment & Activity Distribution */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Par Segment */}
          <div className="bg-noir border border-or/20 rounded-lg p-4">
            <h3 className="text-lg font-serif text-or mb-4">Par Segment</h3>
            <div className="space-y-3">
              {(Object.keys(SEGMENT_LABELS) as VIPSegment[]).map((segment) => {
                const label = SEGMENT_LABELS[segment];
                const count = stats.bySegment[segment];
                const total = Object.values(stats.bySegment).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={segment} className="flex items-center gap-3">
                    <span className="text-xl">{label.emoji}</span>
                    <span className={`w-20 ${label.color}`}>{label.label}</span>
                    <div className="flex-1 h-2 bg-noir rounded-full overflow-hidden">
                      <div
                        className="h-full bg-or"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-creme/60 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Par Activité */}
          <div className="bg-noir border border-or/20 rounded-lg p-4">
            <h3 className="text-lg font-serif text-or mb-4">Par Activité</h3>
            <div className="space-y-3">
              {(Object.keys(ACTIVITY_LABELS) as ActivityStatus[]).map((status) => {
                const label = ACTIVITY_LABELS[status];
                const count = stats.byActivity[status];
                const total = Object.values(stats.byActivity).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={status} className="flex items-center gap-3">
                    <span className="text-xl">{label.emoji}</span>
                    <span className={`w-20 ${label.color}`}>{label.label}</span>
                    <div className="flex-1 h-2 bg-noir rounded-full overflow-hidden">
                      <div
                        className="h-full bg-or"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-creme/60 w-12 text-right">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 bg-noir border border-or/20 rounded-lg p-4">
        {/* View Mode */}
        <div className="flex gap-2">
          <button
            onClick={() => setView('all')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'all'
                ? 'bg-or text-noir'
                : 'bg-noir border border-or/30 text-creme hover:border-or'
            }`}
          >
            Tous
          </button>
          <button
            onClick={() => setView('top')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'top'
                ? 'bg-or text-noir'
                : 'bg-noir border border-or/30 text-creme hover:border-or'
            }`}
          >
            👑 Top VIP
          </button>
          <button
            onClick={() => setView('at-risk')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              view === 'at-risk'
                ? 'bg-or text-noir'
                : 'bg-noir border border-or/30 text-creme hover:border-or'
            }`}
          >
            ⚠️ À Risque
          </button>
        </div>

        <div className="h-8 w-px bg-or/20" />

        {/* Segment Filter */}
        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value as VIPSegment | '')}
          className="bg-noir border border-or/30 rounded-lg px-3 py-2 text-creme"
        >
          <option value="">Tous segments</option>
          {(Object.keys(SEGMENT_LABELS) as VIPSegment[]).map((segment) => (
            <option key={segment} value={segment}>
              {SEGMENT_LABELS[segment].emoji} {SEGMENT_LABELS[segment].label}
            </option>
          ))}
        </select>

        {/* Activity Filter */}
        <select
          value={activityFilter}
          onChange={(e) => setActivityFilter(e.target.value as ActivityStatus | '')}
          className="bg-noir border border-or/30 rounded-lg px-3 py-2 text-creme"
        >
          <option value="">Toutes activités</option>
          {(Object.keys(ACTIVITY_LABELS) as ActivityStatus[]).map((status) => (
            <option key={status} value={status}>
              {ACTIVITY_LABELS[status].emoji} {ACTIVITY_LABELS[status].label}
            </option>
          ))}
        </select>

        {/* Sort By */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          className="bg-noir border border-or/30 rounded-lg px-3 py-2 text-creme"
        >
          <option value="score">Trier par Score</option>
          <option value="spent">Trier par Dépenses</option>
          <option value="orders">Trier par Commandes</option>
          <option value="recency">Trier par Récence</option>
        </select>
      </div>

      {/* Customer List */}
      <div className="bg-noir border border-or/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-or"></div>
          </div>
        ) : customers.length === 0 ? (
          <div className="p-8 text-center text-creme/40">
            Aucun client trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-noir/50">
                <tr className="text-left text-creme/60 text-sm">
                  <th className="p-4">Client</th>
                  <th className="p-4">Segment</th>
                  <th className="p-4">Activité</th>
                  <th className="p-4">Score VIP</th>
                  <th className="p-4">Dépenses</th>
                  <th className="p-4">Commandes</th>
                  <th className="p-4">Fidélité</th>
                  <th className="p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-or/10">
                {customers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-or/5">
                    <td className="p-4">
                      <div>
                        <p className="text-creme font-medium">
                          {customer.name || 'Sans nom'}
                        </p>
                        <p className="text-creme/50 text-sm">{customer.email}</p>
                      </div>
                    </td>
                    <td className="p-4">
                      <span
                        className={`flex items-center gap-2 ${
                          SEGMENT_LABELS[customer.segment].color
                        }`}
                      >
                        <span>{SEGMENT_LABELS[customer.segment].emoji}</span>
                        <span>{SEGMENT_LABELS[customer.segment].label}</span>
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`flex items-center gap-2 ${
                          ACTIVITY_LABELS[customer.activityStatus].color
                        }`}
                      >
                        <span>{ACTIVITY_LABELS[customer.activityStatus].emoji}</span>
                        <span className="text-sm">
                          {customer.daysSinceLastOrder !== null
                            ? `${customer.daysSinceLastOrder}j`
                            : 'Jamais'}
                        </span>
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-noir rounded-full overflow-hidden">
                          <div
                            className="h-full bg-or"
                            style={{ width: `${Math.min(100, customer.vipScore / 5)}%` }}
                          />
                        </div>
                        <span className="text-creme font-mono">{customer.vipScore}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="text-creme font-medium">
                        {customer.totalSpent.toLocaleString('fr-FR')} €
                      </p>
                      <p className="text-creme/50 text-xs">
                        Moy: {customer.avgOrderValue.toFixed(0)} €
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-creme">{customer.orderCount}</p>
                    </td>
                    <td className="p-4">
                      {customer.loyaltyTier ? (
                        <div>
                          <span className="text-sm">
                            {customer.loyaltyTier === 'PLATINUM' && '💎'}
                            {customer.loyaltyTier === 'GOLD' && '🥇'}
                            {customer.loyaltyTier === 'SILVER' && '🥈'}
                            {customer.loyaltyTier === 'BRONZE' && '🥉'}{' '}
                            {customer.loyaltyTier}
                          </span>
                          <p className="text-creme/50 text-xs">
                            {customer.loyaltyPoints.toLocaleString()} pts
                          </p>
                        </div>
                      ) : (
                        <span className="text-creme/40">-</span>
                      )}
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/admin/customers/${customer.id}`}
                        className="px-3 py-1 bg-or/10 border border-or/30 rounded text-or text-sm hover:bg-or/20 transition-colors"
                      >
                        Voir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  subtext,
}: {
  label: string;
  value: string | number;
  icon: string;
  subtext?: string;
}) {
  return (
    <div className="bg-noir border border-or/20 rounded-lg p-4">
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">{icon}</span>
        <span className="text-creme/60 text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-creme">{value}</p>
      {subtext && <p className="text-xs text-creme/40 mt-1">{subtext}</p>}
    </div>
  );
}
