'use client';

/**
 * Page Admin - Gestion Avancée du Stock
 * Alertes, historique et ajustements
 */

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MOVEMENT_LABELS } from '@/lib/stock-management';
import type { StockMovement } from '@prisma/client';

interface StockProduct {
  id: number;
  name: string;
  brand: string | null;
  stock: number;
  image: string;
  category: string;
}

interface StockMovementData {
  id: string;
  date: string;
  productId: number;
  productName: string;
  productBrand: string | null;
  productImage: string;
  quantity: number;
  type: StockMovement;
  reason: string | null;
  stockBefore: number;
  stockAfter: number;
  orderId: string | null;
}

interface StockStats {
  totalProducts: number;
  totalUnits: number;
  stockValue: number;
  outOfStockCount: number;
  criticalCount: number;
  lowStockCount: number;
  healthyCount: number;
}

interface StockData {
  alerts: {
    outOfStock: StockProduct[];
    lowStock: StockProduct[];
  };
  movements: StockMovementData[];
  stats: StockStats;
  thresholds: {
    LOW_STOCK_THRESHOLD: number;
    CRITICAL_STOCK_THRESHOLD: number;
    OUT_OF_STOCK_THRESHOLD: number;
  };
}

export default function StockPage() {
  const [data, setData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [adjusting, setAdjusting] = useState<number | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    action: 'add' as 'add' | 'set',
    quantity: 0,
    reason: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const response = await fetch('/api/admin/stock');
      if (response.ok) {
        setData(await response.json());
      }
    } catch (error) {
      console.error('Erreur:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleAdjust(productId: number) {
    try {
      const response = await fetch('/api/admin/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          action: adjustForm.action,
          quantity: adjustForm.quantity,
          reason: adjustForm.reason || 'Ajustement manuel',
        }),
      });

      if (response.ok) {
        setAdjusting(null);
        setAdjustForm({ action: 'add', quantity: 0, reason: '' });
        fetchData();
      } else {
        const error = await response.json();
        alert(error.error || 'Erreur');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de l\'ajustement');
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-or"></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 text-center text-red-400">
        Erreur lors du chargement des données
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-serif text-or">Gestion du Stock</h1>
          <p className="text-creme/60 mt-1">
            Alertes, historique et ajustements de stock
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Produits"
          value={data.stats.totalProducts}
          icon="📦"
        />
        <StatCard
          label="Unités en Stock"
          value={data.stats.totalUnits}
          icon="🔢"
        />
        <StatCard
          label="Valeur Stock"
          value={`${data.stats.stockValue.toLocaleString('fr-FR')} €`}
          icon="💰"
        />
        <StatCard
          label="Stock Sain"
          value={`${Math.round((data.stats.healthyCount / data.stats.totalProducts) * 100)}%`}
          icon="✅"
          subtext={`${data.stats.healthyCount} produits`}
        />
      </div>

      {/* Alert Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🚨</span>
            <div>
              <p className="text-red-400 font-medium">Rupture de Stock</p>
              <p className="text-2xl font-bold text-red-300">{data.stats.outOfStockCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <div>
              <p className="text-orange-400 font-medium">Stock Critique</p>
              <p className="text-2xl font-bold text-orange-300">{data.stats.criticalCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📉</span>
            <div>
              <p className="text-yellow-400 font-medium">Stock Faible</p>
              <p className="text-2xl font-bold text-yellow-300">{data.stats.lowStockCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertes - Produits */}
      {(data.alerts.outOfStock.length > 0 || data.alerts.lowStock.length > 0) && (
        <div className="bg-noir border border-or/20 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-or/20">
            <h2 className="text-lg font-serif text-or">Alertes Stock</h2>
          </div>
          <div className="divide-y divide-or/10">
            {[...data.alerts.outOfStock, ...data.alerts.lowStock].map((product) => (
              <div
                key={product.id}
                className="p-4 flex items-center justify-between hover:bg-or/5"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={48}
                    height={48}
                    className="rounded-lg object-cover"
                  />
                  <div>
                    <p className="font-medium text-creme">{product.name}</p>
                    <p className="text-sm text-creme/60">{product.brand}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p
                      className={`text-xl font-bold ${
                        product.stock === 0
                          ? 'text-red-400'
                          : product.stock <= 3
                            ? 'text-orange-400'
                            : 'text-yellow-400'
                      }`}
                    >
                      {product.stock}
                    </p>
                    <p className="text-xs text-creme/40">unités</p>
                  </div>

                  {adjusting === product.id ? (
                    <div className="flex items-center gap-2 bg-noir/80 p-2 rounded-lg border border-or/30">
                      <select
                        value={adjustForm.action}
                        onChange={(e) =>
                          setAdjustForm({ ...adjustForm, action: e.target.value as 'add' | 'set' })
                        }
                        className="bg-noir border border-or/30 rounded px-2 py-1 text-sm text-creme"
                      >
                        <option value="add">Ajouter</option>
                        <option value="set">Définir à</option>
                      </select>
                      <input
                        type="number"
                        value={adjustForm.quantity}
                        onChange={(e) =>
                          setAdjustForm({ ...adjustForm, quantity: parseInt(e.target.value) || 0 })
                        }
                        className="w-16 bg-noir border border-or/30 rounded px-2 py-1 text-sm text-creme"
                        min={0}
                      />
                      <input
                        type="text"
                        value={adjustForm.reason}
                        onChange={(e) => setAdjustForm({ ...adjustForm, reason: e.target.value })}
                        placeholder="Raison..."
                        className="w-32 bg-noir border border-or/30 rounded px-2 py-1 text-sm text-creme"
                      />
                      <button
                        onClick={() => handleAdjust(product.id)}
                        className="px-3 py-1 bg-or text-noir rounded text-sm font-medium hover:bg-or/90"
                      >
                        OK
                      </button>
                      <button
                        onClick={() => setAdjusting(null)}
                        className="px-2 py-1 text-creme/60 hover:text-creme"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setAdjusting(product.id)}
                      className="px-4 py-2 bg-or/10 border border-or/30 rounded-lg text-or hover:bg-or/20 transition-colors"
                    >
                      Réapprovisionner
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Historique des Mouvements */}
      <div className="bg-noir border border-or/20 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-or/20">
          <h2 className="text-lg font-serif text-or">Historique des Mouvements</h2>
          <p className="text-sm text-creme/60">30 derniers mouvements de stock</p>
        </div>

        {data.movements.length === 0 ? (
          <div className="p-8 text-center text-creme/40">
            Aucun mouvement de stock enregistré
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-noir/50">
                <tr className="text-left text-creme/60 text-sm">
                  <th className="p-4">Date</th>
                  <th className="p-4">Produit</th>
                  <th className="p-4">Type</th>
                  <th className="p-4">Mouvement</th>
                  <th className="p-4">Stock</th>
                  <th className="p-4">Raison</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-or/10">
                {data.movements.map((movement) => {
                  const label = MOVEMENT_LABELS[movement.type];
                  return (
                    <tr key={movement.id} className="hover:bg-or/5">
                      <td className="p-4 text-creme/70 text-sm">
                        {new Date(movement.date).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Image
                            src={movement.productImage}
                            alt={movement.productName}
                            width={32}
                            height={32}
                            className="rounded"
                          />
                          <div>
                            <p className="text-creme text-sm">{movement.productName}</p>
                            <p className="text-creme/50 text-xs">{movement.productBrand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={`${label.color} flex items-center gap-1`}>
                          <span>{label.emoji}</span>
                          <span className="text-sm">{label.label}</span>
                        </span>
                      </td>
                      <td className="p-4">
                        <span
                          className={`font-mono font-bold ${
                            movement.quantity > 0 ? 'text-green-400' : 'text-red-400'
                          }`}
                        >
                          {movement.quantity > 0 ? '+' : ''}
                          {movement.quantity}
                        </span>
                      </td>
                      <td className="p-4 text-creme/70 text-sm">
                        {movement.stockBefore} → {movement.stockAfter}
                      </td>
                      <td className="p-4 text-creme/50 text-sm">
                        {movement.reason || '-'}
                        {movement.orderId && (
                          <Link
                            href={`/admin/orders/${movement.orderId}`}
                            className="ml-2 text-or hover:underline"
                          >
                            Voir commande
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
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
