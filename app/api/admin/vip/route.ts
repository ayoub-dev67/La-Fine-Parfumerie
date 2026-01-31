/**
 * API VIP Customers
 * GET /api/admin/vip - Liste des clients VIP avec stats
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import {
  getVIPCustomers,
  getVIPStats,
  getAtRiskCustomers,
  getTopVIPCustomers,
  VIPSegment,
  ActivityStatus,
} from '@/lib/vip-detection';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'all';
    const segment = searchParams.get('segment') as VIPSegment | null;
    const activity = searchParams.get('activity') as ActivityStatus | null;
    const sortBy = (searchParams.get('sortBy') || 'score') as 'score' | 'spent' | 'orders' | 'recency';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined;

    let customers;
    let stats;

    switch (view) {
      case 'top':
        customers = await getTopVIPCustomers(limit || 10);
        break;
      case 'at-risk':
        customers = await getAtRiskCustomers();
        break;
      case 'all':
      default:
        customers = await getVIPCustomers({
          minSegment: segment || undefined,
          activityFilter: activity || undefined,
          sortBy,
          limit,
        });
    }

    stats = await getVIPStats();

    return NextResponse.json({
      customers: customers.map((c) => ({
        ...c,
        lastOrderDate: c.lastOrderDate?.toISOString() || null,
        createdAt: c.createdAt.toISOString(),
      })),
      stats,
    });
  } catch (error) {
    console.error('[VIP API] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
