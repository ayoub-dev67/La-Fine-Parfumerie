'use client';

/**
 * GESTION DES STOCKS
 * Alertes, ajustements et import/export
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface StockProduct {
  id: number;
  name: string;
  brand: string | null;
  image: string;
  stock: number;
  price: number;
}

interface StockMovement {
  id: string;
  date: string;
  productId: number;
  productName: string;
  productBrand: string | null;
  quantity: number;
  type: 'SALE' | 'ADJUSTMENT';
  orderId?: string;
}

interface StockData {
  alerts: {
    outOfStock: StockProduct[];
    lowStock: StockProduct[];
  };
  movements: StockMovement[];
  stats: {
    totalProducts: number;
    totalUnits: number;
    averageStock: number;
    stockValue: number;
    outOfStockCount: number;
    lowStockCount: number;
  };
}

interface StockManagerProps {
  compact?: boolean;
}

export default function StockManager({ compact = false }: StockManagerProps) {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjustingProduct, setAdjustingProduct] = useState<StockProduct | null>(null);
  const [adjustment, setAdjustment] = useState({ value: 0, reason: '' });
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchStock();
  }, []);

  const fetchStock = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stock?threshold=5');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error('Erreur chargement stock:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async () => {
    if (!adjustingProduct) return;

    try {
      const res = await fetch('/api/admin/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: adjustingProduct.id,
          adjustment: adjustment.value,
          reason: adjustment.reason,
        }),
      });

      const result = await res.json();
      if (result.success) {
        alert(`Stock mis à jour: ${result.product.previousStock} → ${result.product.newStock}`);
        setAdjustingProduct(null);
        setAdjustment({ value: 0, reason: '' });
        fetchStock();
      } else {
        alert(result.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur ajustement stock:', error);
      alert('Erreur lors de la mise à jour');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/admin/products/import', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        alert(`Import réussi!\n${result.created} créé(s), ${result.updated} mis à jour\n${result.errors.length} erreur(s)`);
        fetchStock();
      } else {
        alert(result.error || 'Erreur import');
      }
    } catch (error) {
      console.error('Erreur import:', error);
      alert('Erreur lors de l\'import');
    } finally {
      setImporting(false);
      e.target.value = '';
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(value);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="w-8 h-8 border-2 border-[#c5a059]/30 border-t-[#c5a059] rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-8 text-gray-400">
        Erreur lors du chargement des données
      </div>
    );
  }

  // Mode compact pour le dashboard
  if (compact) {
    return (
      <div className="space-y-4">
        {/* Alertes */}
        {data.alerts.outOfStock.length > 0 && (
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <h4 className="text-red-400 font-semibold mb-2 flex items-center gap-2">
              <span>🚨</span> Rupture de stock ({data.alerts.outOfStock.length})
            </h4>
            <div className="space-y-2">
              {data.alerts.outOfStock.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center gap-2 text-sm text-gray-300">
                  <span className="text-red-400">•</span>
                  {product.name} {product.brand && `(${product.brand})`}
                </div>
              ))}
              {data.alerts.outOfStock.length > 3 && (
                <p className="text-xs text-gray-500">
                  +{data.alerts.outOfStock.length - 3} autre(s)
                </p>
              )}
            </div>
          </div>
        )}

        {data.alerts.lowStock.length > 0 && (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <h4 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
              <span>⚠️</span> Stock faible ({data.alerts.lowStock.length})
            </h4>
            <div className="space-y-2">
              {data.alerts.lowStock.slice(0, 3).map((product) => (
                <div key={product.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-300">{product.name}</span>
                  <span className="text-yellow-400 font-semibold">{product.stock} unités</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.alerts.outOfStock.length === 0 && data.alerts.lowStock.length === 0 && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-center">
            <span className="text-green-400">✅ Tous les stocks sont OK</span>
          </div>
        )}
      </div>
    );
  }

  // Mode complet
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#c5a059]">Gestion des stocks</h2>
          <p className="text-gray-400">
            {data.stats.totalProducts} produits • {data.stats.totalUnits} unités totales
          </p>
        </div>
        <div className="flex gap-2">
          <a
            href="/api/admin/products/export"
            className="px-4 py-2 bg-[#c5a059]/20 text-[#c5a059] rounded-lg hover:bg-[#c5a059]/30 transition-colors flex items-center gap-2"
          >
            📤 Exporter
          </a>
          <label className="px-4 py-2 bg-[#c5a059] text-black rounded-lg hover:bg-[#d4b068] transition-colors cursor-pointer flex items-center gap-2">
            📥 Importer
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              disabled={importing}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-4">
          <p className="text-gray-400 text-xs">Valeur stock</p>
          <p className="text-xl font-bold text-[#c5a059]">{formatCurrency(data.stats.stockValue)}</p>
        </div>
        <div className="bg-black border border-[#c5a059]/20 rounded-lg p-4">
          <p className="text-gray-400 text-xs">Stock moyen</p>
          <p className="text-xl font-bold text-white">{data.stats.averageStock} unités</p>
        </div>
        <div className="bg-black border border-red-500/20 rounded-lg p-4">
          <p className="text-gray-400 text-xs">En rupture</p>
          <p className="text-xl font-bold text-red-400">{data.stats.outOfStockCount}</p>
        </div>
        <div className="bg-black border border-yellow-500/20 rounded-lg p-4">
          <p className="text-gray-400 text-xs">Stock faible (&lt;5)</p>
          <p className="text-xl font-bold text-yellow-400">{data.stats.lowStockCount}</p>
        </div>
      </div>

      {/* Alertes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ruptures */}
        <div className="bg-black border border-red-500/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-red-400 mb-4 flex items-center gap-2">
            <span>🚨</span> Ruptures de stock ({data.alerts.outOfStock.length})
          </h3>
          {data.alerts.outOfStock.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucune rupture</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.alerts.outOfStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-red-500/5 rounded-lg"
                >
                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                    <Image src={product.image} alt={product.name} width={40} height={40} className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    {product.brand && <p className="text-gray-500 text-xs">{product.brand}</p>}
                  </div>
                  <button
                    onClick={() => setAdjustingProduct(product)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded text-xs hover:bg-red-500/30 transition-colors"
                  >
                    Ajuster
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stock faible */}
        <div className="bg-black border border-yellow-500/20 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <span>⚠️</span> Stock faible ({data.alerts.lowStock.length})
          </h3>
          {data.alerts.lowStock.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Aucun produit en stock faible</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {data.alerts.lowStock.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 bg-yellow-500/5 rounded-lg"
                >
                  <div className="w-10 h-10 rounded overflow-hidden bg-gray-800 flex-shrink-0">
                    <Image src={product.image} alt={product.name} width={40} height={40} className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                    {product.brand && <p className="text-gray-500 text-xs">{product.brand}</p>}
                  </div>
                  <span className="text-yellow-400 font-semibold">{product.stock}</span>
                  <button
                    onClick={() => setAdjustingProduct(product)}
                    className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs hover:bg-yellow-500/30 transition-colors"
                  >
                    Ajuster
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mouvements récents */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-4">Mouvements récents (ventes)</h3>
        {data.movements.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Aucun mouvement récent</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-800">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Date</th>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Produit</th>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Quantité</th>
                  <th className="px-4 py-2 text-left text-gray-400 text-sm">Commande</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {data.movements.slice(0, 20).map((movement) => (
                  <tr key={movement.id}>
                    <td className="px-4 py-2 text-gray-300 text-sm">
                      {new Date(movement.date).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-white text-sm">{movement.productName}</p>
                      {movement.productBrand && (
                        <p className="text-gray-500 text-xs">{movement.productBrand}</p>
                      )}
                    </td>
                    <td className="px-4 py-2">
                      <span className={`font-semibold ${movement.quantity < 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {movement.quantity > 0 ? '+' : ''}{movement.quantity}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-500 text-sm">
                      {movement.orderId ? `#${movement.orderId.slice(0, 8).toUpperCase()}` : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal ajustement */}
      {adjustingProduct && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#c5a059]/30 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">
              Ajuster le stock
            </h3>
            <div className="flex items-center gap-3 mb-4 p-3 bg-black rounded-lg">
              <div className="w-12 h-12 rounded overflow-hidden bg-gray-800">
                <Image src={adjustingProduct.image} alt={adjustingProduct.name} width={48} height={48} className="object-cover" />
              </div>
              <div>
                <p className="text-white font-medium">{adjustingProduct.name}</p>
                <p className="text-gray-500 text-sm">Stock actuel: {adjustingProduct.stock}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Ajustement (+ ou -)</label>
                <input
                  type="number"
                  value={adjustment.value}
                  onChange={(e) => setAdjustment({ ...adjustment, value: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white"
                  placeholder="Ex: +10 ou -5"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Nouveau stock: {adjustingProduct.stock + adjustment.value}
                </p>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Raison (optionnel)</label>
                <input
                  type="text"
                  value={adjustment.reason}
                  onChange={(e) => setAdjustment({ ...adjustment, reason: e.target.value })}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white"
                  placeholder="Ex: Réassort, Inventaire..."
                />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setAdjustingProduct(null);
                  setAdjustment({ value: 0, reason: '' });
                }}
                className="flex-1 px-4 py-2 border border-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleAdjustStock}
                disabled={adjustment.value === 0 || adjustingProduct.stock + adjustment.value < 0}
                className="flex-1 px-4 py-2 bg-[#c5a059] text-black rounded font-semibold hover:bg-[#d4b068] transition-colors disabled:opacity-50"
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
