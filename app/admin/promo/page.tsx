"use client";

/**
 * GESTION CODES PROMO - ADMIN
 * Liste, création, modification et suppression des codes promo
 * Design noir/or luxe
 */

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface PromoCode {
  id: string;
  code: string;
  discountPercent: number | null;
  discountAmount: number | null;
  minPurchase: number | null;
  maxUses: number | null;
  usedCount: number;
  validFrom: string;
  validUntil: string | null;
  isActive: boolean;
  createdAt: string;
}

interface FormData {
  code: string;
  discountType: "percent" | "fixed";
  discountValue: string;
  minPurchase: string;
  maxUses: string;
  validFrom: string;
  validUntil: string;
  isActive: boolean;
}

const initialFormData: FormData = {
  code: "",
  discountType: "percent",
  discountValue: "",
  minPurchase: "",
  maxUses: "",
  validFrom: new Date().toISOString().split("T")[0],
  validUntil: "",
  isActive: true,
};

export default function AdminPromoPage() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Fetch promo codes
  const fetchPromoCodes = async () => {
    try {
      const response = await fetch("/api/admin/promo");
      if (!response.ok) throw new Error("Erreur lors du chargement");
      const data = await response.json();
      setPromoCodes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  // Open modal for new code
  const handleNew = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setFormError(null);
    setShowModal(true);
  };

  // Open modal for editing
  const handleEdit = (promo: PromoCode) => {
    setFormData({
      code: promo.code,
      discountType: promo.discountPercent ? "percent" : "fixed",
      discountValue: String(promo.discountPercent || promo.discountAmount || ""),
      minPurchase: promo.minPurchase ? String(promo.minPurchase) : "",
      maxUses: promo.maxUses ? String(promo.maxUses) : "",
      validFrom: new Date(promo.validFrom).toISOString().split("T")[0],
      validUntil: promo.validUntil
        ? new Date(promo.validUntil).toISOString().split("T")[0]
        : "",
      isActive: promo.isActive,
    });
    setEditingId(promo.id);
    setFormError(null);
    setShowModal(true);
  };

  // Submit form (create or update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);

    try {
      const payload = {
        code: formData.code.toUpperCase(),
        discountPercent:
          formData.discountType === "percent"
            ? parseFloat(formData.discountValue)
            : null,
        discountAmount:
          formData.discountType === "fixed"
            ? parseFloat(formData.discountValue)
            : null,
        minPurchase: formData.minPurchase
          ? parseFloat(formData.minPurchase)
          : null,
        maxUses: formData.maxUses ? parseInt(formData.maxUses) : null,
        validFrom: formData.validFrom,
        validUntil: formData.validUntil || null,
        isActive: formData.isActive,
      };

      const url = editingId
        ? `/api/admin/promo/${editingId}`
        : "/api/admin/promo";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'enregistrement");
      }

      await fetchPromoCodes();
      setShowModal(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete promo code
  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/promo/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Erreur lors de la suppression");
      }

      await fetchPromoCodes();
      setDeleteConfirm(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  // Toggle active status
  const handleToggleActive = async (promo: PromoCode) => {
    try {
      const response = await fetch(`/api/admin/promo/${promo.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !promo.isActive }),
      });

      if (!response.ok) throw new Error("Erreur lors de la mise à jour");

      await fetchPromoCodes();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    }
  };

  // Check if promo is expired
  const isExpired = (validUntil: string | null) => {
    if (!validUntil) return false;
    return new Date(validUntil) < new Date();
  };

  // Check if promo has reached max uses
  const isMaxedOut = (promo: PromoCode) => {
    if (!promo.maxUses) return false;
    return promo.usedCount >= promo.maxUses;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-[#c5a059]/30 border-t-[#c5a059] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#c5a059] font-serif">
            Codes Promo
          </h1>
          <p className="text-gray-400 mt-1">{promoCodes.length} code(s) promo</p>
        </div>
        <button
          type="button"
          onClick={handleNew}
          className="px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors shadow-lg shadow-[#c5a059]/20"
        >
          + Nouveau code
        </button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-4 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#c5a059]/10 border-b border-[#c5a059]/20">
              <tr>
                <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">
                  Code
                </th>
                <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">
                  Reduction
                </th>
                <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">
                  Conditions
                </th>
                <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">
                  Utilisation
                </th>
                <th className="px-6 py-4 text-left text-[#c5a059] font-semibold">
                  Statut
                </th>
                <th className="px-6 py-4 text-right text-[#c5a059] font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {promoCodes.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-400">
                    Aucun code promo. Creez-en un !
                  </td>
                </tr>
              ) : (
                promoCodes.map((promo) => (
                  <tr
                    key={promo.id}
                    className="hover:bg-[#c5a059]/5 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="font-mono text-lg font-bold text-white bg-[#c5a059]/20 px-3 py-1 rounded">
                        {promo.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#c5a059] font-semibold text-lg">
                        {promo.discountPercent
                          ? `-${promo.discountPercent}%`
                          : `-${promo.discountAmount?.toFixed(2)}€`}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300 text-sm">
                      {promo.minPurchase && (
                        <div>Min: {promo.minPurchase}€</div>
                      )}
                      {promo.validUntil && (
                        <div>
                          Expire: {new Date(promo.validUntil).toLocaleDateString("fr-FR")}
                        </div>
                      )}
                      {!promo.minPurchase && !promo.validUntil && (
                        <span className="text-gray-500">Aucune</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white">
                        {promo.usedCount}
                        {promo.maxUses && (
                          <span className="text-gray-400"> / {promo.maxUses}</span>
                        )}
                      </div>
                      {promo.maxUses && (
                        <div className="w-24 h-1.5 bg-gray-800 rounded-full mt-2">
                          <div
                            className="h-full bg-[#c5a059] rounded-full"
                            style={{
                              width: `${Math.min(
                                (promo.usedCount / promo.maxUses) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {isExpired(promo.validUntil) ? (
                        <span className="px-3 py-1 rounded text-sm font-medium bg-gray-500/20 text-gray-400">
                          Expire
                        </span>
                      ) : isMaxedOut(promo) ? (
                        <span className="px-3 py-1 rounded text-sm font-medium bg-orange-500/20 text-orange-400">
                          Limite atteinte
                        </span>
                      ) : promo.isActive ? (
                        <span className="px-3 py-1 rounded text-sm font-medium bg-green-500/20 text-green-400">
                          Actif
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded text-sm font-medium bg-red-500/20 text-red-400">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(promo)}
                          className={`p-2 rounded-lg transition-colors ${
                            promo.isActive
                              ? "text-red-400 hover:bg-red-500/10"
                              : "text-green-400 hover:bg-green-500/10"
                          }`}
                          title={promo.isActive ? "Desactiver" : "Activer"}
                        >
                          {promo.isActive ? "⏸️" : "▶️"}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleEdit(promo)}
                          className="p-2 text-[#c5a059] hover:bg-[#c5a059]/10 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          ✏️
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteConfirm(promo.id)}
                          className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-[#c5a059]/30 rounded-lg p-6 w-full max-w-lg"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-2xl font-bold text-[#c5a059] font-serif mb-6">
                {editingId ? "Modifier le code promo" : "Nouveau code promo"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Code */}
                <div>
                  <label className="block text-sm text-gray-300 mb-2">
                    Code promo *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value.toUpperCase() })
                    }
                    placeholder="Ex: LUXE20"
                    className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white font-mono uppercase
                               placeholder-gray-500 focus:border-[#c5a059] focus:outline-none"
                    required
                  />
                </div>

                {/* Discount type + value */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Type de reduction *
                    </label>
                    <select
                      value={formData.discountType}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          discountType: e.target.value as "percent" | "fixed",
                        })
                      }
                      className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white
                                 focus:border-[#c5a059] focus:outline-none"
                    >
                      <option value="percent">Pourcentage (%)</option>
                      <option value="fixed">Montant fixe (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Valeur *
                    </label>
                    <input
                      type="number"
                      min="0"
                      step={formData.discountType === "percent" ? "1" : "0.01"}
                      max={formData.discountType === "percent" ? "100" : undefined}
                      value={formData.discountValue}
                      onChange={(e) =>
                        setFormData({ ...formData, discountValue: e.target.value })
                      }
                      placeholder={formData.discountType === "percent" ? "20" : "15.00"}
                      className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white
                                 placeholder-gray-500 focus:border-[#c5a059] focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Min purchase + Max uses */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Montant min. (€)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.minPurchase}
                      onChange={(e) =>
                        setFormData({ ...formData, minPurchase: e.target.value })
                      }
                      placeholder="Optionnel"
                      className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white
                                 placeholder-gray-500 focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Utilisations max.
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.maxUses}
                      onChange={(e) =>
                        setFormData({ ...formData, maxUses: e.target.value })
                      }
                      placeholder="Illimite"
                      className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white
                                 placeholder-gray-500 focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Validity dates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Date de debut *
                    </label>
                    <input
                      type="date"
                      value={formData.validFrom}
                      onChange={(e) =>
                        setFormData({ ...formData, validFrom: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white
                                 focus:border-[#c5a059] focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-300 mb-2">
                      Date de fin
                    </label>
                    <input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) =>
                        setFormData({ ...formData, validUntil: e.target.value })
                      }
                      className="w-full px-4 py-3 bg-black border border-[#c5a059]/20 rounded-lg text-white
                                 focus:border-[#c5a059] focus:outline-none"
                    />
                  </div>
                </div>

                {/* Active toggle */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                    className="w-5 h-5 rounded border-[#c5a059]/30 bg-black text-[#c5a059]
                               focus:ring-[#c5a059] focus:ring-offset-0"
                  />
                  <label htmlFor="isActive" className="text-gray-300">
                    Code actif
                  </label>
                </div>

                {/* Error */}
                {formError && (
                  <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
                    {formError}
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 py-3 border border-[#c5a059]/30 text-gray-300 rounded-lg
                               hover:border-[#c5a059]/50 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 py-3 bg-[#c5a059] text-black font-semibold rounded-lg
                               hover:bg-[#d4b068] transition-colors disabled:opacity-50"
                  >
                    {submitting ? "Enregistrement..." : editingId ? "Modifier" : "Creer"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
            onClick={() => setDeleteConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#0a0a0a] border border-red-500/30 rounded-lg p-6 w-full max-w-md"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-xl font-bold text-red-400 mb-4">
                Confirmer la suppression
              </h2>
              <p className="text-gray-300 mb-6">
                Etes-vous sur de vouloir supprimer ce code promo ? Cette action est
                irreversible.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-3 border border-gray-600 text-gray-300 rounded-lg
                             hover:border-gray-500 hover:text-white transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-3 bg-red-500 text-white font-semibold rounded-lg
                             hover:bg-red-600 transition-colors"
                >
                  Supprimer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
