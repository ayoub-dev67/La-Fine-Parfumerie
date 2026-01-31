/**
 * API Bulk Actions Produits
 * POST /api/admin/products/bulk
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { productsListCache } from '@/lib/redis';
import { adjustStock } from '@/lib/stock-management';
import { z } from 'zod';

const bulkActionSchema = z.object({
  productIds: z.array(z.number()).min(1, 'Au moins un produit requis'),
  action: z.enum([
    'delete',
    'setFeatured',
    'unsetFeatured',
    'setNew',
    'unsetNew',
    'setBestSeller',
    'unsetBestSeller',
    'adjustStock',
    'setCategory',
    'adjustPrice',
  ]),
  data: z.object({}).passthrough().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const validated = bulkActionSchema.parse(body);
    const { productIds, action, data } = validated;

    let updatedCount = 0;

    switch (action) {
      case 'delete':
        // Vérifier qu'aucun produit n'a de commandes
        const productsWithOrders = await prisma.orderItem.findMany({
          where: { productId: { in: productIds } },
          select: { productId: true },
        });
        const productIdsWithOrders = new Set(productsWithOrders.map((p) => p.productId));
        const deletableIds = productIds.filter((id) => !productIdsWithOrders.has(id));

        if (deletableIds.length > 0) {
          const result = await prisma.product.deleteMany({
            where: { id: { in: deletableIds } },
          });
          updatedCount = result.count;
        }

        if (productIdsWithOrders.size > 0) {
          return NextResponse.json({
            success: true,
            updatedCount,
            warning: `${productIdsWithOrders.size} produit(s) non supprimé(s) car liés à des commandes`,
          });
        }
        break;

      case 'setFeatured':
        const featuredResult = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isFeatured: true },
        });
        updatedCount = featuredResult.count;
        break;

      case 'unsetFeatured':
        const unfeaturedResult = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isFeatured: false },
        });
        updatedCount = unfeaturedResult.count;
        break;

      case 'setNew':
        const newResult = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isNew: true },
        });
        updatedCount = newResult.count;
        break;

      case 'unsetNew':
        const unNewResult = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isNew: false },
        });
        updatedCount = unNewResult.count;
        break;

      case 'setBestSeller':
        const bestSellerResult = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isBestSeller: true },
        });
        updatedCount = bestSellerResult.count;
        break;

      case 'unsetBestSeller':
        const unBestSellerResult = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { isBestSeller: false },
        });
        updatedCount = unBestSellerResult.count;
        break;

      case 'adjustStock':
        const stockAdjustment = (data as { adjustment?: number })?.adjustment;
        if (typeof stockAdjustment !== 'number') {
          return NextResponse.json(
            { error: 'Ajustement de stock requis' },
            { status: 400 }
          );
        }

        for (const productId of productIds) {
          try {
            await adjustStock({
              productId,
              newStock: stockAdjustment,
              reason: 'Ajustement groupé',
              userId: session.user.id,
            });
            updatedCount++;
          } catch {
            // Skip products that fail
          }
        }
        break;

      case 'setCategory':
        const category = (data as { category?: string })?.category;
        if (!category) {
          return NextResponse.json(
            { error: 'Catégorie requise' },
            { status: 400 }
          );
        }

        const categoryResult = await prisma.product.updateMany({
          where: { id: { in: productIds } },
          data: { category },
        });
        updatedCount = categoryResult.count;
        break;

      case 'adjustPrice':
        const priceData = data as { type?: 'percent' | 'fixed'; value?: number };
        if (!priceData?.type || typeof priceData?.value !== 'number') {
          return NextResponse.json(
            { error: 'Type et valeur requis pour ajustement prix' },
            { status: 400 }
          );
        }

        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, price: true },
        });

        for (const product of products) {
          let newPrice: number;
          if (priceData.type === 'percent') {
            newPrice = Number(product.price) * (1 + priceData.value / 100);
          } else {
            newPrice = Number(product.price) + priceData.value;
          }

          if (newPrice < 0) newPrice = 0;

          await prisma.product.update({
            where: { id: product.id },
            data: { price: Math.round(newPrice * 100) / 100 },
          });
          updatedCount++;
        }
        break;

      default:
        return NextResponse.json(
          { error: 'Action non reconnue' },
          { status: 400 }
        );
    }

    // Invalider le cache
    await productsListCache.invalidateAll();

    return NextResponse.json({
      success: true,
      updatedCount,
      message: `${updatedCount} produit(s) mis à jour`,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[PRODUCTS BULK API] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
