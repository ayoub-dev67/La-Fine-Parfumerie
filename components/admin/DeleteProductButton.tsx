'use client';

/**
 * BOUTON SUPPRESSION PRODUIT
 * Bouton avec confirmation pour supprimer un produit
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface DeleteProductButtonProps {
  productId: string;
  productName: string;
}

export default function DeleteProductButton({
  productId,
  productName,
}: DeleteProductButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setLoading(true);

    try {
      const res = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE',
      });

      const result = await res.json();

      if (!result.success) {
        alert(result.error || 'Erreur lors de la suppression');
        return;
      }

      // Rafraîchir la liste
      router.refresh();
      setShowConfirm(false);
    } catch (err) {
      alert('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex items-center gap-2">
        <button
          onClick={handleDelete}
          disabled={loading}
          className="text-red-400 hover:text-red-500 font-medium transition-colors disabled:opacity-50"
        >
          {loading ? '⏳' : '✅ Confirmer'}
        </button>
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="text-gray-400 hover:text-white font-medium transition-colors"
        >
          ❌ Annuler
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-red-400 hover:text-red-500 font-medium transition-colors"
    >
      🗑️ Supprimer
    </button>
  );
}
