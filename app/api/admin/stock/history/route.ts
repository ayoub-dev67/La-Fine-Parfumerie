/**
 * API Historique Stock
 * GET /api/admin/stock/history?productId=X
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getStockHistory } from '@/lib/stock-management';
import { StockMovement } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const limit = searchParams.get('limit');
    const type = searchParams.get('type') as StockMovement | null;

    if (!productId) {
      return NextResponse.json({ error: 'productId requis' }, { status: 400 });
    }

    const history = await getStockHistory(parseInt(productId), {
      limit: limit ? parseInt(limit) : 50,
      type: type || undefined,
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('[STOCK HISTORY API] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
