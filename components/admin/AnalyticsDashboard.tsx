'use client';

/**
 * AnalyticsDashboard - Dashboard avec tous les graphiques
 */

import { useState, useEffect } from 'react';
import { SalesChart } from './SalesChart';
import { OrdersChart } from './OrdersChart';
import { TopProductsChart } from './TopProductsChart';
import { CustomersChart } from './CustomersChart';

interface AnalyticsData {
  salesData: Array<{ date: string; revenue: number; orders: number }>;
  statusData: Array<{ status: string; count: number; fill: string }>;
  topProductsData: Array<{ name: string; brand: string; quantity: number; revenue: number }>;
  customersData: Array<{ name: string; value: number; fill: string }>;
  summary: {
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    newCustomers: number;
    returningCustomers: number;
  };
}

export function AnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  async function fetchAnalytics() {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics?period=${period}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Erreur chargement analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-or">Analytics</h2>
          <div className="h-10 w-48 bg-noir/50 rounded-lg animate-pulse" />
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-noir/50 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-96 bg-noir/50 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-creme/50">
        Erreur lors du chargement des analytics
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header avec sélecteur de période */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-or">Analytics</h2>
        <div className="flex gap-2">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                period === p
                  ? 'bg-or text-noir'
                  : 'bg-noir/50 text-creme hover:bg-noir/70 border border-or/20'
              }`}
            >
              {p === 'day' ? '30 jours' : p === 'week' ? '12 semaines' : '12 mois'}
            </button>
          ))}
        </div>
      </div>

      {/* Statistiques résumées */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-noir/50 rounded-xl p-4 border border-or/20">
          <p className="text-sm text-creme/60 mb-1">Chiffre d&apos;affaires</p>
          <p className="text-2xl font-bold text-or">
            {data.summary.totalRevenue.toLocaleString('fr-FR')}€
          </p>
        </div>
        <div className="bg-noir/50 rounded-xl p-4 border border-or/20">
          <p className="text-sm text-creme/60 mb-1">Commandes</p>
          <p className="text-2xl font-bold text-creme">{data.summary.totalOrders}</p>
        </div>
        <div className="bg-noir/50 rounded-xl p-4 border border-or/20">
          <p className="text-sm text-creme/60 mb-1">Panier moyen</p>
          <p className="text-2xl font-bold text-green-400">
            {data.summary.avgOrderValue.toFixed(2)}€
          </p>
        </div>
        <div className="bg-noir/50 rounded-xl p-4 border border-or/20">
          <p className="text-sm text-creme/60 mb-1">Clients</p>
          <p className="text-2xl font-bold text-blue-400">
            {data.summary.newCustomers + data.summary.returningCustomers}
          </p>
        </div>
      </div>

      {/* Graphiques */}
      <div className="grid lg:grid-cols-2 gap-6">
        <SalesChart data={data.salesData} period={period} />
        <OrdersChart data={data.statusData} />
        <TopProductsChart data={data.topProductsData} />
        <CustomersChart data={data.customersData} />
      </div>
    </div>
  );
}
