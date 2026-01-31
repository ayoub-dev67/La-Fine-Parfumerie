/**
 * API ADMIN - PRODUITS (LISTE + CRÉATION)
 * GET: Liste tous les produits (avec cache Redis)
 * POST: Crée un nouveau produit
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCached, productsListCache } from '@/lib/redis';
import { z } from 'zod';

// Cache TTL: 10 minutes pour la liste admin
const ADMIN_PRODUCTS_TTL = 600;

// Schéma de validation pour un produit
const productSchema = z.object({
  name: z.string().min(1, 'Le nom est requis'),
  brand: z.string().min(1, 'La marque est requise'),
  description: z.string().min(1, 'La description est requise'),
  price: z.number().positive('Le prix doit être positif'),
  category: z.enum(['Signature', 'Niche', 'Femme', 'Homme', 'Coffret']),
  volume: z.string().min(1, 'Le volume est requis'),
  stock: z.number().int().min(0, 'Le stock doit être positif ou nul'),
  image: z.string().url('URL d\'image invalide'),
});

// GET - Liste tous les produits (avec cache)
export async function GET() {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const products = await getCached(
      'admin:products:list',
      async () => {
        return await prisma.product.findMany({
          orderBy: { createdAt: 'desc' },
        });
      },
      ADMIN_PRODUCTS_TTL
    );

    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('[ADMIN API] Erreur GET products:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// POST - Crée un nouveau produit
export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Données invalides',
          details: parsed.error.issues,
        },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: parsed.data,
    });

    // Invalider le cache après création
    await productsListCache.invalidateAll();

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('[ADMIN API] Erreur POST product:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
