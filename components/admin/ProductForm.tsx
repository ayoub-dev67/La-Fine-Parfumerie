'use client';

/**
 * FORMULAIRE PRODUIT
 * Composant réutilisable pour créer/éditer un produit
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProductFormProps {
  product?: {
    id: string;
    name: string;
    brand: string;
    description: string;
    price: number;
    category: string;
    volume: string;
    stock: number;
    image: string;
  };
  mode: 'create' | 'edit';
}

export default function ProductForm({ product, mode }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name') as string,
      brand: formData.get('brand') as string,
      description: formData.get('description') as string,
      price: parseFloat(formData.get('price') as string),
      category: formData.get('category') as string,
      volume: formData.get('volume') as string,
      stock: parseInt(formData.get('stock') as string),
      image: formData.get('image') as string,
    };

    try {
      const url =
        mode === 'create'
          ? '/api/admin/products'
          : `/api/admin/products/${product?.id}`;
      const method = mode === 'create' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!result.success) {
        setError(result.error || 'Erreur lors de la sauvegarde');
        return;
      }

      // Rediriger vers la liste des produits
      router.push('/admin/products');
      router.refresh();
    } catch (err) {
      setError('Erreur de connexion au serveur');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Informations de base */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c5a059] mb-4">
          Informations de base
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nom du produit *
            </label>
            <input
              type="text"
              name="name"
              required
              defaultValue={product?.name}
              placeholder="Ex: Aventus"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Marque *
            </label>
            <input
              type="text"
              name="brand"
              required
              defaultValue={product?.brand}
              placeholder="Ex: Creed"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c5a059] mb-4">Description</h2>
        <textarea
          name="description"
          required
          rows={5}
          defaultValue={product?.description}
          placeholder="Décrivez le parfum, ses notes, son caractère..."
          className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors resize-none"
        />
      </div>

      {/* Prix et catégorie */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c5a059] mb-4">
          Prix et catégorie
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Prix (€) *
            </label>
            <input
              type="number"
              step="0.01"
              name="price"
              required
              defaultValue={product?.price}
              placeholder="0.00"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Catégorie *
            </label>
            <select
              name="category"
              required
              defaultValue={product?.category}
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            >
              <option value="">Sélectionner...</option>
              <option value="Signature">Signature</option>
              <option value="Niche">Niche</option>
              <option value="Femme">Femme</option>
              <option value="Homme">Homme</option>
              <option value="Coffret">Coffret</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Volume *
            </label>
            <input
              type="text"
              name="volume"
              required
              defaultValue={product?.volume}
              placeholder="Ex: 50ml"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Stock et image */}
      <div className="bg-black border border-[#c5a059]/20 rounded-lg p-6">
        <h2 className="text-xl font-bold text-[#c5a059] mb-4">
          Stock et image
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Stock *
            </label>
            <input
              type="number"
              name="stock"
              required
              defaultValue={product?.stock}
              placeholder="0"
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              URL de l'image *
            </label>
            <input
              type="url"
              name="image"
              required
              defaultValue={product?.image}
              placeholder="https://..."
              className="w-full px-4 py-3 bg-[#0a0a0a] border border-gray-800 rounded-lg text-white placeholder-gray-600 focus:border-[#c5a059] focus:outline-none focus:ring-1 focus:ring-[#c5a059] transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Erreur */}
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-8 py-3 bg-[#c5a059] text-black font-semibold rounded-lg hover:bg-[#d4b068] transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-[#c5a059]/20"
        >
          {loading
            ? 'Sauvegarde...'
            : mode === 'create'
            ? '✅ Créer le produit'
            : '💾 Sauvegarder'}
        </button>
      </div>
    </form>
  );
}
