/**
 * ÉDITER PRODUIT
 * Page d'édition d'un produit existant
 */

import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductForm from '@/components/admin/ProductForm';

export default async function EditProductPage({
  params,
}: {
  params: { id: string };
}) {
  const product = await prisma.product.findUnique({
    where: { id: parseInt(params.id) },
  });

  if (!product) {
    notFound();
  }

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
          Éditer le produit
        </h1>
        <p className="text-gray-400 mt-1">{product.name}</p>
      </div>

      {/* Formulaire */}
      <ProductForm
        mode="edit"
        product={{
          id: String(product.id),
          name: product.name,
          brand: product.brand || "",
          description: product.description,
          price: Number(product.price),
          category: product.category,
          volume: product.volume || "",
          stock: product.stock,
          image: product.image,
        }}
      />
    </div>
  );
}
