/**
 * API Recommandations
 * GET /api/recommendations - Recommandations personnalisées
 * GET /api/recommendations?productId=123 - Produits similaires/achetés ensemble
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getRecommendations,
  getFrequentlyBoughtTogether,
  getSimilarProducts,
} from '@/lib/recommendations';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const productId = searchParams.get('productId');
    const type = searchParams.get('type') || 'personal'; // personal, similar, fbt
    const limit = Math.min(parseInt(searchParams.get('limit') || '6'), 12);

    // Si productId fourni, retourner recommandations liées au produit
    if (productId) {
      const id = parseInt(productId);

      if (isNaN(id)) {
        return NextResponse.json(
          { error: 'productId invalide' },
          { status: 400 }
        );
      }

      let products;
      if (type === 'fbt') {
        products = await getFrequentlyBoughtTogether(id, limit);
      } else {
        products = await getSimilarProducts(id, limit);
      }

      return NextResponse.json({
        type,
        productId: id,
        products,
        total: products.length,
      });
    }

    // Sinon, recommandations personnalisées
    const session = await auth();
    const products = await getRecommendations(session?.user?.id, limit);

    return NextResponse.json({
      type: 'personal',
      personalized: !!session?.user,
      products,
      total: products.length,
    });
  } catch (error) {
    console.error('[RECOMMENDATIONS API] Erreur:', error);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
