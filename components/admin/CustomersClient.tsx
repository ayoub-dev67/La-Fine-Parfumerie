'use client';

/**
 * GESTION CLIENTS - COMPOSANT CLIENT
 * Liste avec filtres VIP, stats et exports
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Customer {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  role: string;
  createdAt: string;
  totalSpent: number;
  orderCount: number;
  averageCart: number;
  lastOrderDate: string | null;
  reviewCount: number;
  wishlistCount: number;
  isVip: boolean;
  isNew: boolean;
  isInactive: boolean;
}

interface CustomersData {
  customers: Customer[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  stats: {
    totalCustomers: number;
    vipCount: number;
    newCount: number;
    inactiveCount: number;
    totalRevenue: number;
    averageLifetimeValue: number;
  };
}

const FILTER_OPTIONS = [
  { value: 'all', label: 'Tous', icon: '👥' },
  { value: 'vip', label: 'VIP (>500€)', icon: '💎' },
  { value: 'new', label: 'Nouveaux (<30j)', icon: '✨' },
  { value: 'inactive', label: 'Inactifs (>90j)', icon: '😴' },
];

const SORT_OPTIONS = [
  { value: 'totalSpent', label: 'Total dépensé' },
  { value: 'orderCount', label: 'Nb commandes' },
  { value: 'createdAt', label: 'Date inscription' },
  { value: 'name', label: 'Nom' },
];

export default function CustomersClient() {
  const [data, setData] = useState<CustomersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    filter: 'all',
    search: '',
    sortBy: 'totalSpent',
    sortOrder: 'desc' as 'asc' | 'desc',
    page: 1,
  });

  useEffect(() => {
    fetchCustomers();
  }, [filters]);

  const fetchCustomers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set('filter', filters.filter);
    if (filters.search) params.set('search', filters.search);
    params.set('sortBy', filters.sortBy);
    params.set('sortOrder', filters.sortOrder);
    params.set('page', filters.page.toString());
    params.set('limit', '20');

    try {
      const res = await fetch(`/api/admin/customers?${params}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Erreur chargement clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    params.set('filter', filters.filter);
    if (filters.search) params.set('search', filters.search);
    params.set('sortBy', filters.sortBy);
    params.set('sortOrder', filters.sortOrder);
    params.set('export', 'true');

    window.open(`/api/admin/customers?${params}`, '_blank');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  const toggleSort = (field: string) => {
    if (filters.sortBy === field) {
      setFilters({
        ...filters,
        sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc',
        page: 1,
      });
    } else {
      setFilters({ ...filters, sortBy: field, sortOrder: 'desc', page: 1 });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#c5a059] font-serif">Clients</h1>
          <p className="text-gray-400 mt-1">
            {data?.stats.totalCustomers || 0} client(s) au total
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-[#c5a059]/20 text-[#c5a059] rounded-lg hover:bg-[#c5a059]/30 transition-colors flex items-center gap-2"
        >
          📥 Exporter CSV
        </button>
      </div>

      {/* Stats globales */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-4">
          <p className="text-gray-400 text-xs">Total clients</p>
          <p className="text-2xl font-bold text-white">{data?.stats.totalCustomers || 0}</p>
        </div>
        <div className="bg-black border border-yellow-500/20 rounded-lg p-4">
          <p className="text-gray-400 text-xs">Clients VIP</p>
          <p className="text-2xl font-bold text-yellow-400">{data?.stats.vipCount || 0}</p>
        </div>
        <div className="bg-black border border-green-500/20 rounded-lg p-4">
          <p className="text-gray-400 text-xs">Nouveaux (&lt;30j)</p>
          <p className="text-2xl font-bold text-green-400">{data?.stats.newCount || 0}</p>
        </div>
        <div className="bg-black border border-red-500/20 rounded-lg p-4">
          <p className="text-gray-400 text-xs">Inactifs (&gt;90j)</p>
          <p className="text-2xl font-bold text-red-400">{data?.stats.inactiveCount || 0}</p>
        </div>
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-4">
          <p className="text-gray-400 text-xs">CA total</p>
          <p className="text-xl font-bold text-[#c5a059]">
            {formatCurrency(data?.stats.totalRevenue || 0)}
          </p>
        </div>
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-4">
          <p className="text-gray-400 text-xs">Valeur vie moy.</p>
          <p className="text-xl font-bold text-[#c5a059]">
            {formatCurrency(data?.stats.averageLifetimeValue || 0)}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-4 items-end">
        {/* Filtres rapides */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setFilters({ ...filters, filter: opt.value, page: 1 })}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                filters.filter === opt.value
                  ? 'bg-[#c5a059] text-black'
                  : 'bg-black border border-gray-700 text-gray-400 hover:border-[#c5a059]/50'
              }`}
            >
              {opt.icon} {opt.label}
            </button>
          ))}
        </div>

        {/* Recherche */}
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Rechercher par nom ou email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#c5a059] focus:outline-none"
          />
        </div>

        {/* Tri */}
        <select
          value={filters.sortBy}
          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value, page: 1 })}
          className="px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-[#c5a059] focus:outline-none"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Trier par: {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() => setFilters({ ...filters, sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })}
          className="px-4 py-2 bg-black border border-gray-700 rounded-lg text-white hover:border-[#c5a059]/50"
        >
          {filters.sortOrder === 'desc' ? '↓ Desc' : '↑ Asc'}
        </button>
      </div>

      {/* Tableau */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-2 border-[#c5a059]/30 border-t-[#c5a059] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#c5a059]/10 border-b border-[#c5a059]/20">
                <tr>
                  <th className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm">Client</th>
                  <th className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm">Statut</th>
                  <th
                    className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm cursor-pointer hover:text-white"
                    onClick={() => toggleSort('orderCount')}
                  >
                    Commandes {filters.sortBy === 'orderCount' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th
                    className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm cursor-pointer hover:text-white"
                    onClick={() => toggleSort('totalSpent')}
                  >
                    Total dépensé {filters.sortBy === 'totalSpent' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                  <th className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm">Panier moy.</th>
                  <th className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm">Dernière commande</th>
                  <th
                    className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm cursor-pointer hover:text-white"
                    onClick={() => toggleSort('createdAt')}
                  >
                    Inscrit le {filters.sortBy === 'createdAt' && (filters.sortOrder === 'desc' ? '↓' : '↑')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Aucun client trouvé
                    </td>
                  </tr>
                ) : (
                  data?.customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-[#c5a059]/5 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#c5a059]/20 rounded-full flex items-center justify-center overflow-hidden">
                            {customer.image ? (
                              <Image
                                src={customer.image}
                                alt={customer.name || 'User'}
                                width={40}
                                height={40}
                                className="object-cover"
                              />
                            ) : (
                              <span className="text-[#c5a059] font-semibold">
                                {customer.name?.[0]?.toUpperCase() || customer.email[0].toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-white flex items-center gap-2">
                              {customer.name || 'Non renseigné'}
                              {customer.isVip && <span className="text-yellow-400">💎</span>}
                            </p>
                            <p className="text-xs text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {customer.role === 'ADMIN' && (
                            <span className="px-2 py-0.5 rounded text-xs bg-blue-500/20 text-blue-400">
                              Admin
                            </span>
                          )}
                          {customer.isVip && (
                            <span className="px-2 py-0.5 rounded text-xs bg-yellow-500/20 text-yellow-400">
                              VIP
                            </span>
                          )}
                          {customer.isNew && (
                            <span className="px-2 py-0.5 rounded text-xs bg-green-500/20 text-green-400">
                              Nouveau
                            </span>
                          )}
                          {customer.isInactive && (
                            <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">
                              Inactif
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white font-semibold">{customer.orderCount}</span>
                      </td>
                      <td className="px-4 py-3 text-[#c5a059] font-semibold">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="px-4 py-3 text-gray-300">
                        {customer.orderCount > 0 ? formatCurrency(customer.averageCart) : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {customer.lastOrderDate
                          ? new Date(customer.lastOrderDate).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                            })
                          : 'Jamais'}
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {new Date(customer.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
            disabled={filters.page <= 1}
            className="px-4 py-2 bg-black border border-gray-700 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#c5a059] transition-colors"
          >
            ← Précédent
          </button>
          <span className="px-4 py-2 text-gray-400">
            Page {filters.page} / {data.pagination.totalPages}
          </span>
          <button
            onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
            disabled={filters.page >= data.pagination.totalPages}
            className="px-4 py-2 bg-black border border-gray-700 rounded text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-[#c5a059] transition-colors"
          >
            Suivant →
          </button>
        </div>
      )}
    </div>
  );
}
