/**
 * API Stock Management
 * GET /api/admin/stock - Statistiques et alertes stock
 * PATCH /api/admin/stock - Ajuster le stock d'un produit
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getStockStats,
  getLowStockProducts,
  getRecentStockMovements,
  adjustStock,
  recordRestock,
  STOCK_CONFIG,
} from '@/lib/stock-management';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const threshold = parseInt(
      searchParams.get('threshold') || String(STOCK_CONFIG.LOW_STOCK_THRESHOLD)
    );

    const [stats, lowStockProducts, recentMovements] = await Promise.all([
      getStockStats(),
      getLowStockProducts(threshold),
      getRecentStockMovements(30),
    ]);

    // Séparer rupture et stock faible
    const outOfStock = lowStockProducts.filter((p) => p.stock === 0);
    const lowStock = lowStockProducts.filter((p) => p.stock > 0);

    return NextResponse.json({
      alerts: {
        outOfStock,
        lowStock,
      },
      movements: recentMovements.map((m) => ({
        id: m.id,
        date: m.createdAt,
        productId: m.productId,
        productName: m.product.name,
        productBrand: m.product.brand,
        productImage: m.product.image,
        quantity: m.quantity,
        type: m.type,
        reason: m.reason,
        stockBefore: m.stockBefore,
        stockAfter: m.stockAfter,
        orderId: m.orderId,
      })),
      stats: {
        totalProducts: stats.totalProducts,
        totalUnits: stats.totalStock,
        stockValue: stats.totalValue,
        outOfStockCount: stats.outOfStock,
        criticalCount: stats.criticalStock,
        lowStockCount: stats.lowStock,
        healthyCount: stats.healthyStock,
      },
      thresholds: STOCK_CONFIG,
    });
  } catch (error) {
    console.error('[STOCK API] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

const adjustSchema = z.object({
  productId: z.number(),
  action: z.enum(['set', 'add', 'adjust']),
  quantity: z.number(),
  reason: z.string().optional(),
});

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();

    // Support ancien format (adjustment) et nouveau format (action + quantity)
    let validated;
    if ('adjustment' in body && !('action' in body)) {
      // Ancien format
      validated = {
        productId: body.productId,
        action: 'adjust' as const,
        quantity: body.adjustment,
        reason: body.reason,
      };
    } else {
      validated = adjustSchema.parse(body);
    }

    // Vérifier que le produit existe
    const product = await prisma.product.findUnique({
      where: { id: validated.productId },
      select: { id: true, name: true, stock: true },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produit non trouvé' }, { status: 404 });
    }

    let result;
    const reason = validated.reason || 'Ajustement manuel';

    if (validated.action === 'set') {
      // Définir à une valeur exacte
      if (validated.quantity < 0) {
        return NextResponse.json(
          { error: 'Le stock ne peut pas être négatif' },
          { status: 400 }
        );
      }
      result = await adjustStock({
        productId: validated.productId,
        newStock: validated.quantity,
        reason,
        userId: session.user.id,
      });
    } else if (validated.action === 'add') {
      // Ajouter du stock (réapprovisionnement)
      if (validated.quantity <= 0) {
        return NextResponse.json(
          { error: 'La quantité doit être positive' },
          { status: 400 }
        );
      }
      result = await recordRestock({
        productId: validated.productId,
        quantity: validated.quantity,
        reason,
        userId: session.user.id,
      });
    } else {
      // Ajuster (+ ou -)
      const newStock = product.stock + validated.quantity;
      if (newStock < 0) {
        return NextResponse.json(
          { error: 'Le stock ne peut pas être négatif' },
          { status: 400 }
        );
      }
      result = await adjustStock({
        productId: validated.productId,
        newStock,
        reason,
        userId: session.user.id,
      });
    }

    return NextResponse.json({
      success: true,
      product: {
        id: result.product.id,
        name: product.name,
        previousStock: result.history.stockBefore,
        newStock: result.product.stock,
        change: result.history.quantity,
      },
      history: result.history,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Données invalides', details: error.issues },
        { status: 400 }
      );
    }

    console.error('[STOCK PATCH API] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
