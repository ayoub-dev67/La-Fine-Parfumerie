'use client';

/**
 * DASHBOARD CLIENT COMPONENT
 * Gère le fetching des données et l'affichage des graphiques
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import RevenueChart from './charts/RevenueChart';
import StatusPieChart from './charts/StatusPieChart';
import { TopProductsList } from './charts/TopProductsChart';

interface DashboardStats {
  summary: {
    totalRevenue: number;
    revenueChange: number;
    totalOrders: number;
    ordersChange: number;
    totalCustomers: number;
    customersChange: number;
    totalProducts: number;
    averageCart: number;
    conversionRate: number;
    newCustomers: number;
    returningCustomers: number;
  };
  chartData: Array<{ date: string; revenue: number; orders: number }>;
  topProducts: Array<{
    id: number;
    name: string;
    brand: string | null;
    image: string;
    totalSold: number;
    revenue: number;
  }>;
  lowStockProducts: Array<{
    id: number;
    name: string;
    brand: string | null;
    stock: number;
    image: string;
  }>;
  recentOrders: Array<{
    id: string;
    customer: string;
    total: number;
    status: string;
    itemCount: number;
    createdAt: string;
  }>;
  ordersByStatus: Array<{ status: string; count: number }>;
  categoryStats: Array<{ category: string; revenue: number; count: number }>;
}

export default function DashboardClient() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('month');
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  useEffect(() => {
    fetchStats();
  }, [period]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/stats?period=${period}`);
      const data = await res.json();
      setStats(data);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const formatChange = (value: number) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'En attente',
      PAID: 'Payé',
      SHIPPED: 'Expédié',
      DELIVERED: 'Livré',
      CANCELLED: 'Annulé',
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDING: 'bg-yellow-500/20 text-yellow-400',
      PAID: 'bg-blue-500/20 text-blue-400',
      SHIPPED: 'bg-purple-500/20 text-purple-400',
      DELIVERED: 'bg-green-500/20 text-green-400',
      CANCELLED: 'bg-red-500/20 text-red-400',
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#c5a059]/30 border-t-[#c5a059] rounded-full animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-12 text-gray-400">
        Erreur lors du chargement des statistiques
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header avec sélecteur de période */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#c5a059] font-serif">Dashboard</h1>
          <p className="text-gray-400 mt-1">Vue d&apos;ensemble de votre boutique</p>
        </div>
        <div className="flex items-center gap-2 bg-black border border-[#c5a059]/20 rounded-lg p-1">
          {(['day', 'week', 'month'] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-[#c5a059] text-black'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p === 'day' ? '30 jours' : p === 'week' ? '12 semaines' : '12 mois'}
            </button>
          ))}
        </div>
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Chiffre d'affaires"
          value={formatCurrency(stats.summary.totalRevenue)}
          change={stats.summary.revenueChange}
          icon="💰"
        />
        <KPICard
          title="Commandes"
          value={stats.summary.totalOrders.toString()}
          change={stats.summary.ordersChange}
          icon="📦"
        />
        <KPICard
          title="Clients"
          value={stats.summary.totalCustomers.toString()}
          change={stats.summary.customersChange}
          icon="👥"
        />
        <KPICard
          title="Panier moyen"
          value={formatCurrency(stats.summary.averageCart)}
          icon="🛒"
          subtext={`Taux conversion: ${stats.summary.conversionRate}%`}
        />
      </div>

      {/* Graphiques */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique CA */}
        <div className="lg:col-span-2 bg-black border border-[#c5a059]/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-white">Évolution du CA</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setChartType('area')}
                className={`p-2 rounded ${
                  chartType === 'area' ? 'bg-[#c5a059]/20 text-[#c5a059]' : 'text-gray-500'
                }`}
              >
                📈
              </button>
              <button
                onClick={() => setChartType('bar')}
                className={`p-2 rounded ${
                  chartType === 'bar' ? 'bg-[#c5a059]/20 text-[#c5a059]' : 'text-gray-500'
                }`}
              >
                📊
              </button>
            </div>
          </div>
          <RevenueChart data={stats.chartData} type={chartType} />
        </div>

        {/* Répartition statuts */}
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Statuts commandes</h2>
          <StatusPieChart data={stats.ordersByStatus} />
        </div>
      </div>

      {/* Produits et alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top produits */}
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Top produits</h2>
            <Link href="/admin/products" className="text-sm text-[#c5a059] hover:underline">
              Voir tous →
            </Link>
          </div>
          <TopProductsList products={stats.topProducts} />
        </div>

        {/* Alertes stock */}
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <span className="text-red-500">⚠️</span> Alertes stock
            </h2>
            <span className="text-sm text-red-400">
              {stats.lowStockProducts.length} produit(s)
            </span>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <div className="flex items-center justify-center h-[200px] text-gray-500">
              <div className="text-center">
                <span className="text-4xl block mb-2">✅</span>
                Tous les stocks sont OK
              </div>
            </div>
          ) : (
            <div className="space-y-3 max-h-[280px] overflow-y-auto">
              {stats.lowStockProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/admin/products/${product.id}/edit`}
                  className="flex items-center gap-3 p-3 bg-[#0a0a0a] rounded-lg border border-red-500/20 hover:border-red-500/40 transition-colors"
                >
                  <div className="relative w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    {product.brand && (
                      <p className="text-gray-500 text-xs">{product.brand}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-semibold ${
                    product.stock === 0
                      ? 'bg-red-500/20 text-red-400'
                      : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {product.stock === 0 ? 'Rupture' : `${product.stock} unités`}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Commandes récentes et stats clients */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Commandes récentes */}
        <div className="lg:col-span-2 bg-black border border-[#c5a059]/20 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Commandes récentes</h2>
            <Link href="/admin/orders" className="text-sm text-[#c5a059] hover:underline">
              Voir toutes →
            </Link>
          </div>
          {stats.recentOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">Aucune commande récente</div>
          ) : (
            <div className="space-y-3">
              {stats.recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/admin/orders/${order.id}`}
                  className="flex items-center justify-between p-4 bg-[#0a0a0a] rounded-lg border border-gray-800 hover:border-[#c5a059]/40 transition-colors"
                >
                  <div>
                    <p className="font-semibold text-white">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-400">{order.customer}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-[#c5a059]">
                      {formatCurrency(order.total)}
                    </p>
                    <span className={`text-xs px-2 py-1 rounded inline-block mt-1 ${getStatusColor(order.status)}`}>
                      {getStatusLabel(order.status)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Stats clients */}
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Clients</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <span className="text-gray-400">Nouveaux clients</span>
              <span className="text-white font-semibold">{stats.summary.newCustomers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <span className="text-gray-400">Clients fidèles</span>
              <span className="text-white font-semibold">{stats.summary.returningCustomers}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#0a0a0a] rounded-lg">
              <span className="text-gray-400">Total produits</span>
              <span className="text-white font-semibold">{stats.summary.totalProducts}</span>
            </div>
            <Link
              href="/admin/customers"
              className="block w-full text-center py-3 border border-[#c5a059]/30 rounded-lg text-[#c5a059] hover:bg-[#c5a059]/10 transition-colors"
            >
              Gérer les clients →
            </Link>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickAction
          href="/admin/products/new"
          icon="➕"
          title="Nouveau produit"
          description="Ajouter au catalogue"
        />
        <QuickAction
          href="/admin/promo"
          icon="🏷️"
          title="Codes promo"
          description="Gérer les remises"
        />
        <QuickAction
          href="/admin/emails"
          icon="📧"
          title="Emails"
          description="Historique envois"
        />
        <QuickAction
          href="/api/admin/products/export"
          icon="📥"
          title="Export produits"
          description="Télécharger CSV"
          external
        />
      </div>
    </div>
  );
}

// Composant KPI Card
function KPICard({
  title,
  value,
  change,
  icon,
  subtext,
}: {
  title: string;
  value: string;
  change?: number;
  icon: string;
  subtext?: string;
}) {
  return (
    <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-400 text-sm">{title}</p>
          <p className="text-2xl font-bold text-white mt-1">{value}</p>
          {change !== undefined && (
            <p className={`text-sm mt-1 ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}%
            </p>
          )}
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}

// Composant Quick Action
function QuickAction({
  href,
  icon,
  title,
  description,
  external,
}: {
  href: string;
  icon: string;
  title: string;
  description: string;
  external?: boolean;
}) {
  const Component = external ? 'a' : Link;
  const props = external ? { href, target: '_blank', rel: 'noopener noreferrer' } : { href };

  return (
    <Component
      {...props}
      className="p-4 bg-black border border-[#c5a059]/20 rounded-lg hover:border-[#c5a059]/50 transition-all hover:shadow-lg hover:shadow-[#c5a059]/10 group"
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl group-hover:scale-110 transition-transform">{icon}</span>
        <div>
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
      </div>
    </Component>
  );
}
