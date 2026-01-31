/**
 * API ADMIN - PRODUIT INDIVIDUEL
 * GET: Récupère un produit
 * PUT: Met à jour un produit
 * DELETE: Supprime un produit
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productCache, productsListCache } from '@/lib/redis';
import { z } from 'zod';

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

// GET - Récupère un produit
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    const product = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('[ADMIN API] Erreur GET product:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// PUT - Met à jour un produit
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    const product = await prisma.product.update({
      where: { id: parseInt(params.id) },
      data: parsed.data,
    });

    // Invalider le cache après mise à jour
    await Promise.all([
      productCache.invalidate(params.id),
      productsListCache.invalidateAll(),
    ]);

    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('[ADMIN API] Erreur PUT product:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

// DELETE - Supprime un produit
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { success: false, error: 'Non autorisé' },
        { status: 401 }
      );
    }

    // Vérifier que le produit existe
    const existingProduct = await prisma.product.findUnique({
      where: { id: parseInt(params.id) },
    });

    if (!existingProduct) {
      return NextResponse.json(
        { success: false, error: 'Produit non trouvé' },
        { status: 404 }
      );
    }

    // Vérifier qu'il n'y a pas de commandes liées
    const ordersCount = await prisma.orderItem.count({
      where: { productId: parseInt(params.id) },
    });

    if (ordersCount > 0) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Impossible de supprimer ce produit car il est lié à des commandes',
        },
        { status: 400 }
      );
    }

    await prisma.product.delete({
      where: { id: parseInt(params.id) },
    });

    // Invalider le cache après suppression
    await Promise.all([
      productCache.invalidate(params.id),
      productsListCache.invalidateAll(),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Produit supprimé avec succès',
    });
  } catch (error) {
    console.error('[ADMIN API] Erreur DELETE product:', error);
    return NextResponse.json(
      { success: false, error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
