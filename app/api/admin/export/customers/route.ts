/**
 * API Export Clients CSV
 * GET /api/admin/export/customers
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

    const users = await prisma.user.findMany({
      include: {
        orders: {
          where: { status: { notIn: ['CANCELLED', 'FAILED'] } },
          select: { totalAmount: true, createdAt: true },
        },
        loyalty: { select: { points: true, tier: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = users.map((u) => {
      const totalSpent = u.orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
      const orderCount = u.orders.length;
      const avgOrder = orderCount > 0 ? totalSpent / orderCount : 0;
      const lastOrder = u.orders.length > 0
        ? u.orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0].createdAt
        : null;

      return {
        id: u.id,
        name: u.name || '',
        email: u.email,
        role: u.role,
        totalSpent: totalSpent.toFixed(2),
        orderCount,
        avgOrder: avgOrder.toFixed(2),
        lastOrderDate: lastOrder?.toISOString().split('T')[0] || '',
        loyaltyPoints: u.loyalty?.points || 0,
        loyaltyTier: u.loyalty?.tier || 'BRONZE',
        createdAt: u.createdAt.toISOString(),
      };
    });

    const csv = Papa.unparse(data, {
      header: true,
      delimiter: ';',
    });

    const date = new Date().toISOString().split('T')[0];

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="clients_${date}.csv"`,
      },
    });
  } catch (error) {
    console.error('[EXPORT API] Erreur clients:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
