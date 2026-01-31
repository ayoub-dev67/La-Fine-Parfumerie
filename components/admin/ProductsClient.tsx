'use client';

/**
 * CLIENT PRODUCTS MANAGEMENT
 * Gestion avancée des produits avec bulk actions
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ExportButton } from './ExportButton';
import { ImportProducts } from './ImportProducts';

interface Product {
  id: number;
  name: string;
  brand: string | null;
  description: string;
  price: number;
  volume: string | null;
  image: string;
  category: string;
  subcategory: string | null;
  stock: number;
  isFeatured: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  createdAt: string;
}

const CATEGORY_OPTIONS = [
  { value: '', label: 'Toutes catégories' },
  { value: 'Signature', label: 'Signature' },
  { value: 'Niche', label: 'Niche' },
  { value: 'Femme', label: 'Femme' },
  { value: 'Homme', label: 'Homme' },
  { value: 'Coffret', label: 'Coffret' },
];

const BULK_ACTIONS = [
  { value: '', label: 'Action groupée...' },
  { value: 'setFeatured', label: '⭐ Mettre en avant' },
  { value: 'unsetFeatured', label: '✖️ Retirer mise en avant' },
  { value: 'setNew', label: '🆕 Marquer comme nouveau' },
  { value: 'unsetNew', label: '✖️ Retirer badge nouveau' },
  { value: 'setBestSeller', label: '🔥 Marquer best-seller' },
  { value: 'unsetBestSeller', label: '✖️ Retirer badge best-seller' },
  { value: 'setCategory', label: '📁 Changer catégorie' },
  { value: 'adjustPrice', label: '💰 Ajuster prix' },
  { value: 'delete', label: '🗑️ Supprimer' },
];

export default function ProductsClient() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    stockFilter: '',
    badgeFilter: '',
  });
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkData, setBulkData] = useState({
    category: 'Signature',
    priceType: 'percent' as 'percent' | 'fixed',
    priceValue: 0,
  });
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.category) params.set('category', filters.category);

      const response = await fetch(`/api/admin/products?${params}`);
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || data);
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filtrage local
  const filteredProducts = products.filter((p) => {
    if (filters.search) {
      const search = filters.search.toLowerCase();
      if (
        !p.name.toLowerCase().includes(search) &&
        !p.brand?.toLowerCase().includes(search)
      ) {
        return false;
      }
    }
    if (filters.category && p.category !== filters.category) return false;
    if (filters.stockFilter === 'low' && p.stock > 10) return false;
    if (filters.stockFilter === 'out' && p.stock > 0) return false;
    if (filters.badgeFilter === 'featured' && !p.isFeatured) return false;
    if (filters.badgeFilter === 'new' && !p.isNew) return false;
    if (filters.badgeFilter === 'bestseller' && !p.isBestSeller) return false;
    return true;
  });

  const handleSelectAll = () => {
    if (selectedProducts.length === filteredProducts.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(filteredProducts.map((p) => p.id));
    }
  };

  const handleSelectProduct = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    // Confirmation pour suppression
    if (bulkAction === 'delete') {
      if (!confirm(`Supprimer ${selectedProducts.length} produit(s) ?`)) return;
    }

    setActionLoading(true);

    try {
      const payload: Record<string, unknown> = {
        productIds: selectedProducts,
        action: bulkAction,
      };

      // Ajouter les données spécifiques
      if (bulkAction === 'setCategory') {
        payload.data = { category: bulkData.category };
      } else if (bulkAction === 'adjustPrice') {
        payload.data = { type: bulkData.priceType, value: bulkData.priceValue };
      }

      const response = await fetch('/api/admin/products/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        alert(result.message + (result.warning ? `\n${result.warning}` : ''));
        setSelectedProducts([]);
        setBulkAction('');
        setShowBulkModal(false);
        fetchProducts();
      } else {
        alert(result.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur bulk action:', error);
      alert('Erreur lors de la mise à jour');
    } finally {
      setActionLoading(false);
    }
  };

  const needsModal = ['setCategory', 'adjustPrice'].includes(bulkAction);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#c5a059] font-serif">Produits</h1>
          <p className="text-gray-400 mt-1">{products.length} produit(s) au total</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <ExportButton />
          <ImportProducts onSuccess={fetchProducts} />
          <Link
            href="/admin/products/new"
            className="px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors shadow-lg shadow-[#c5a059]/20"
          >
            ➕ Ajouter
          </Link>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Rechercher par nom ou marque..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white placeholder-gray-500 focus:border-[#c5a059] focus:outline-none"
          />
        </div>
        <select
          value={filters.category}
          onChange={(e) => setFilters({ ...filters, category: e.target.value })}
          className="px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white focus:border-[#c5a059] focus:outline-none"
        >
          {CATEGORY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={filters.stockFilter}
          onChange={(e) => setFilters({ ...filters, stockFilter: e.target.value })}
          className="px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white focus:border-[#c5a059] focus:outline-none"
        >
          <option value="">Tous stocks</option>
          <option value="low">Stock faible</option>
          <option value="out">Rupture</option>
        </select>
        <select
          value={filters.badgeFilter}
          onChange={(e) => setFilters({ ...filters, badgeFilter: e.target.value })}
          className="px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white focus:border-[#c5a059] focus:outline-none"
        >
          <option value="">Tous badges</option>
          <option value="featured">⭐ En avant</option>
          <option value="new">🆕 Nouveau</option>
          <option value="bestseller">🔥 Best-seller</option>
        </select>
      </div>

      {/* Bulk Actions Bar */}
      {selectedProducts.length > 0 && (
        <div className="flex items-center gap-4 p-4 bg-[#c5a059]/10 border border-[#c5a059]/30 rounded-lg">
          <span className="text-[#c5a059] font-semibold">
            {selectedProducts.length} sélectionné(s)
          </span>
          <select
            value={bulkAction}
            onChange={(e) => setBulkAction(e.target.value)}
            className="px-3 py-2 bg-black border border-gray-700 rounded text-white"
          >
            {BULK_ACTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {bulkAction && (
            <>
              {needsModal ? (
                <button
                  onClick={() => setShowBulkModal(true)}
                  className="px-4 py-2 bg-[#c5a059] text-black rounded font-semibold hover:bg-[#d4b068] transition-colors"
                >
                  Continuer
                </button>
              ) : (
                <button
                  onClick={handleBulkAction}
                  disabled={actionLoading}
                  className="px-4 py-2 bg-[#c5a059] text-black rounded font-semibold hover:bg-[#d4b068] transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Chargement...' : 'Appliquer'}
                </button>
              )}
            </>
          )}
          <button
            onClick={() => setSelectedProducts([])}
            className="ml-auto text-gray-400 hover:text-white"
          >
            Désélectionner
          </button>
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
                      checked={
                        selectedProducts.length === filteredProducts.length &&
                        filteredProducts.length > 0
                      }
                      onChange={handleSelectAll}
                      className="w-4 h-4 rounded border-gray-600 bg-black text-[#c5a059] focus:ring-[#c5a059]"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">Image</th>
                  <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">Produit</th>
                  <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">Catégorie</th>
                  <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">Prix</th>
                  <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">Stock</th>
                  <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">Badges</th>
                  <th className="px-6 py-4 text-right text-[#c5a059] font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-400">
                      Aucun produit trouvé
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => (
                    <tr key={product.id} className="hover:bg-[#c5a059]/5 transition-colors">
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          checked={selectedProducts.includes(product.id)}
                          onChange={() => handleSelectProduct(product.id)}
                          className="w-4 h-4 rounded border-gray-600 bg-black text-[#c5a059] focus:ring-[#c5a059]"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <Image
                          src={product.image}
                          alt={product.name}
                          width={48}
                          height={48}
                          className="object-cover rounded-lg border border-[#c5a059]/20"
                        />
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-semibold text-white">{product.name}</p>
                          <p className="text-sm text-gray-400">{product.brand}</p>
                          <p className="text-xs text-gray-500">{product.volume}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{product.category}</td>
                      <td className="px-6 py-4 text-[#c5a059] font-semibold">
                        {Number(product.price).toFixed(2)}€
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded text-sm font-medium ${
                            product.stock === 0
                              ? 'bg-red-500/20 text-red-400'
                              : product.stock < 5
                                ? 'bg-orange-500/20 text-orange-400'
                                : product.stock < 10
                                  ? 'bg-yellow-500/20 text-yellow-400'
                                  : 'bg-green-500/20 text-green-400'
                          }`}
                        >
                          {product.stock}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-1">
                          {product.isFeatured && <span title="En avant">⭐</span>}
                          {product.isNew && <span title="Nouveau">🆕</span>}
                          {product.isBestSeller && <span title="Best-seller">🔥</span>}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={`/admin/products/${product.id}/edit`}
                            className="text-[#c5a059] hover:text-[#d4b068] font-medium transition-colors"
                          >
                            ✏️ Éditer
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal for bulk actions needing data */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0a0a0a] border border-[#c5a059]/30 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-[#c5a059] mb-4">
              {bulkAction === 'setCategory' && 'Changer la catégorie'}
              {bulkAction === 'adjustPrice' && 'Ajuster les prix'}
            </h3>

            {bulkAction === 'setCategory' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Nouvelle catégorie
                  </label>
                  <select
                    value={bulkData.category}
                    onChange={(e) => setBulkData({ ...bulkData, category: e.target.value })}
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white"
                  >
                    {CATEGORY_OPTIONS.filter((o) => o.value).map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {bulkAction === 'adjustPrice' && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Type d&apos;ajustement</label>
                  <select
                    value={bulkData.priceType}
                    onChange={(e) =>
                      setBulkData({
                        ...bulkData,
                        priceType: e.target.value as 'percent' | 'fixed',
                      })
                    }
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white"
                  >
                    <option value="percent">Pourcentage (%)</option>
                    <option value="fixed">Montant fixe (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Valeur ({bulkData.priceType === 'percent' ? '%' : '€'})
                  </label>
                  <input
                    type="number"
                    value={bulkData.priceValue}
                    onChange={(e) =>
                      setBulkData({ ...bulkData, priceValue: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="Ex: 10 pour +10% ou -5 pour -5€"
                    className="w-full px-4 py-2 bg-black border border-gray-700 rounded text-white placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Positif pour augmenter, négatif pour diminuer
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowBulkModal(false)}
                className="flex-1 px-4 py-2 border border-gray-700 rounded text-gray-400 hover:text-white transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleBulkAction}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-[#c5a059] text-black rounded font-semibold hover:bg-[#d4b068] transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Chargement...' : 'Appliquer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
