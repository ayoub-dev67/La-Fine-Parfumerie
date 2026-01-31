/**
 * NOUVEAU PRODUIT
 * Page de création d'un nouveau produit
 */

import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/admin/products"
          className="text-[#c5a059] hover:underline text-sm mb-2 inline-block"
        >
          ← Retour aux produits
        </Link>
        <h1 className="text-3xl font-bold text-[#c5a059] font-serif">
          Nouveau produit
        </h1>
        <p className="text-gray-400 mt-1">
          Ajoutez un nouveau produit à votre catalogue
        </p>
      </div>

      {/* Formulaire */}
      <ProductForm mode="create" />
    </div>
  );
}
