'use client';

/**
 * CLIENT ORDERS MANAGEMENT
 * Gestion avancée des commandes avec filtres, bulk actions, export
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Order {
  id: string;
  customer: {
    id?: string;
    name: string;
    email?: string;
    image?: string | null;
  };
  items: Array<{
    id: string;
    productId: number;
    name: string;
    brand: string | null;
    image: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  status: string;
  trackingNumber: string | null;
  carrier: string | null;
  createdAt: string;
}

interface OrdersData {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
  };
  statusCounts: Record<string, number>;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tous les statuts', color: 'bg-gray-500/20 text-gray-400' },
  { value: 'PENDING', label: 'En attente', color: 'bg-yellow-500/20 text-yellow-400' },
  { value: 'PAID', label: 'Payé', color: 'bg-blue-500/20 text-blue-400' },
  { value: 'SHIPPED', label: 'Expédié', color: 'bg-purple-500/20 text-purple-400' },
  { value: 'DELIVERED', label: 'Livré', color: 'bg-green-500/20 text-green-400' },
  { value: 'CANCELLED', label: 'Annulé', color: 'bg-red-500/20 text-red-400' },
];

export default function OrdersClient() {
  const [data, setData] = useState<OrdersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    dateFrom: '',
    dateTo: '',
    page: 1,
  });
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({ trackingNumber: '', carrier: 'Colissimo' });

  useEffect(() => {
    fetchOrders();
  }, [filters]);

  const fetchOrders = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    params.set('page', filters.page.toString());
    params.set('limit', '20');

    try {
      const res = await fetch(`/api/admin/orders?${params}`);
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Erreur chargement commandes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const params = new URLSearchParams();
    if (filters.status !== 'all') params.set('status', filters.status);
    if (filters.search) params.set('search', filters.search);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    params.set('export', 'true');

    window.open(`/api/admin/orders?${params}`, '_blank');
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === data?.orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(data?.orders.map((o) => o.id) || []);
    }
  };

  const handleSelectOrder = (orderId: string) => {
    if (selectedOrders.includes(orderId)) {
      setSelectedOrders(selectedOrders.filter((id) => id !== orderId));
    } else {
      setSelectedOrders([...selectedOrders, orderId]);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedOrders.length === 0) return;

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderIds: selectedOrders,
          action: bulkAction,
          data: bulkAction === 'markAsShipped' ? bulkData : undefined,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`${result.updatedCount} commande(s) mise(s) à jour`);
        setSelectedOrders([]);
        setBulkAction('');
        setShowBulkModal(false);
        fetchOrders();
      } else {
        alert(result.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur bulk action:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const getStatusBadge = (status: string) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    return option?.color || 'bg-gray-500/20 text-gray-400';
  };

  const getStatusLabel = (status: string) => {
    const option = STATUS_OPTIONS.find((o) => o.value === status);
    return option?.label || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#c5a059] font-serif">Commandes</h1>
          <p className="text-gray-400 mt-1">
            {data?.pagination.totalItems || 0} commande(s) au total
          </p>
        </div>
        <button
          onClick={handleExport}
          className="px-4 py-2 bg-[#c5a059]/20 text-[#c5a059] rounded-lg hover:bg-[#c5a059]/30 transition-colors flex items-center gap-2"
        >
          📥 Exporter CSV
        </button>
      </div>

      {/* Stats par statut */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUS_OPTIONS.map((status) => (
          <button
            key={status.value}
            onClick={() => setFilters({ ...filters, status: status.value, page: 1 })}
            className={`p-3 rounded-lg border transition-all ${
              filters.status === status.value
                ? 'border-[#c5a059] bg-[#c5a059]/10'
                : 'border-gray-800 bg-black hover:border-gray-700'
            }`}
          >
            <p className="text-gray-400 text-xs">{status.label}</p>
            <p className="text-xl font-bold text-white">
              {status.value === 'all'
                ? data?.pagination.totalItems || 0
                : data?.statusCounts[status.value] || 0}
            </p>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-500 mb-1">Recherche</label>
          <input
            type="text"
            placeholder="ID, nom ou email..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value, page: 1 })}
            className="w-full px-4 py-2 bg-black border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-[#c5a059] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Du</label>
          <input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value, page: 1 })}
            className="px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-[#c5a059] focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs text-gray-500 mb-1">Au</label>
          <input
            type="date"
            value={filters.dateTo}
            onChange={(e) => setFilters({ ...filters, dateTo: e.target.value, page: 1 })}
            className="px-4 py-2 bg-black border border-gray-700 rounded-lg text-white focus:border-[#c5a059] focus:outline-none"
          />
        </div>
        <button
          onClick={() => setFilters({ status: 'all', search: '', dateFrom: '', dateTo: '', page: 1 })}
          className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
        >
          Réinitialiser
        </button>
      </div>

      {/* Bulk actions */}
      {selectedOrders.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-lg">
          <span className="text-[#c5a059] font-semibold">
            {selectedOrders.length} sélectionnée(s)
          </span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-3 py-2 bg-black border border-gray-700 rounded text-white"
          >
            <option value="">Action groupée...</option>
            <option value="markAsShipped">Marquer comme expédié</option>
            <option value="markAsDelivered">Marquer comme livré</option>
            <option value="cancel">Annuler</option>
          </select>
          {bulkAction === 'markAsShipped' && (
            <button
              onClick={() => setShowBulkModal(true)}
              className="px-4 py-2 bg-[#c5a059] text-black rounded font-semibold hover:bg-[#d4b068] transition-colors"
            >
              Continuer
            </button>
          )}
          {bulkAction && bulkAction !== 'markAsShipped' && (
            <button
              onClick={handleBulkAction}
              className="px-4 py-2 bg-[#c5a059] text-black rounded font-semibold hover:bg-[#d4b068] transition-colors"
            >
              Appliquer
            </button>
          )}
        </div>
      )}

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
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedOrders.length === data?.orders.length && data?.orders.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-600 bg-black text-[#c5a059] focus:ring-[#c5a059]"
                    />
                  </th>
                  <th className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm">Commande</th>
                  <th className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm">Client</th>
                  <th className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm">Date</th>
                  <th className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm">Montant</th>
                  <th className="px-4 py-3 text-left text-[#c5a059] font-semibold text-sm">Statut</th>
                  <th className="px-4 py-3 text-right text-[#c5a059] font-semibold text-sm">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data?.orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                      Aucune commande trouvée
                    </td>
                  </tr>
                ) : (
                  data?.orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#c5a059]/5 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => handleSelectOrder(order.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-black text-[#c5a059] focus:ring-[#c5a059]"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <p className="font-mono text-sm text-white">
                          #{order.id.slice(0, 8).toUpperCase()}
                        </p>
                        <p className="text-xs text-gray-500">
                          {order.items.length} article(s)
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-white font-medium">{order.customer.name}</p>
                        <p className="text-xs text-gray-500">{order.customer.email}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-300 text-sm">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3 text-[#c5a059] font-semibold">
                        {order.totalAmount.toFixed(2)}€
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusBadge(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                        {order.trackingNumber && (
                          <p className="text-xs text-gray-500 mt-1">
                            📦 {order.carrier}: {order.trackingNumber}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-[#c5a059] hover:text-[#d4b068] font-medium text-sm transition-colors"
                        >
                          Détails →
                        </Link>
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

      {/* Modal bulk ship */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#c5a059]/30 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">
              Marquer {selectedOrders.length} commande(s) comme expédiées
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Transporteur</label>
                <select
                  value={bulkData.carrier}
                  onChange={(e) => setBulkData({ ...bulkData, carrier: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white"
                >
                  <option value="Colissimo">Colissimo</option>
                  <option value="Chronopost">Chronopost</option>
                  <option value="DHL">DHL</option>
                  <option value="UPS">UPS</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">
                  N° de suivi (optionnel - même pour toutes)
                </label>
                <input
                  type="text"
                  value={bulkData.trackingNumber}
                  onChange={(e) => setBulkData({ ...bulkData, trackingNumber: e.target.value })}
                  placeholder="Laisser vide pour saisir individuellement"
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 px-4 py-2 border border-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleBulkAction}
                className="flex-1 px-4 py-2 bg-[#c5a059] text-black rounded font-semibold hover:bg-[#d4b068] transition-colors"
              >
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
