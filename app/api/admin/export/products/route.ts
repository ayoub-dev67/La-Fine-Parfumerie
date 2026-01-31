/**
 * API Export Produits CSV
 * GET /api/admin/export/products
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Papa from 'papaparse';

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const data = products.map((p) => ({
      id: p.id,
      name: p.name,
      brand: p.brand || '',
      description: p.description,
      price: p.price,
      volume: p.volume || '',
      category: p.category,
      subcategory: p.subcategory || '',
      stock: p.stock,
      notesTop: p.notesTop || '',
      notesHeart: p.notesHeart || '',
      notesBase: p.notesBase || '',
      isFeatured: p.isFeatured ? 'Oui' : 'Non',
      isNew: p.isNew ? 'Oui' : 'Non',
      isBestSeller: p.isBestSeller ? 'Oui' : 'Non',
      image: p.image,
      createdAt: p.createdAt.toISOString(),
    }));

    const csv = Papa.unparse(data, {
      header: true,
      delimiter: ';',
    });

    const date = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="produits_${date}.csv"`,
      },
    });
  } catch (error) {
    console.error('[EXPORT API] Erreur produits:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
