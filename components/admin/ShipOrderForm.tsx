'use client';

/**
 * FORMULAIRE D'EXPÉDITION
 * Permet de marquer une commande comme expédiée avec tracking
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ShipOrderFormProps {
  orderId: string;
}

export default function ShipOrderForm({ orderId }: ShipOrderFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      trackingNumber: formData.get('trackingNumber') as string,
      carrier: formData.get('carrier') as string,
    };

    try {
      const res = await fetch(`/api/admin/orders/${orderId}/ship`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Erreur lors de l\'expédition');
        return;
      }

      // Rafraîchir la page pour voir les changements
      router.refresh();
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
      <h2 className="text-xl font-bold text-[#c5a059] mb-4">
        📦 Marquer comme expédiée
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Transporteur
          </label>
          <select
            name="carrier"
            required
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
          >
            <option value="">Sélectionner...</option>
            <option value="Colissimo">Colissimo</option>
            <option value="Chronopost">Chronopost</option>
            <option value="DHL">DHL</option>
            <option value="UPS">UPS</option>
            <option value="FedEx">FedEx</option>
            <option value="Mondial Relay">Mondial Relay</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Numéro de suivi
          </label>
          <input
            type="text"
            name="trackingNumber"
            required
            placeholder="Ex: 1234567890"
            className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#c5a059]/20"
        >
          {loading ? 'Envoi en cours...' : '✅ Confirmer l\'expédition'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          Un email de confirmation sera envoyé au client
        </p>
      </form>
    </div>
  );
}
