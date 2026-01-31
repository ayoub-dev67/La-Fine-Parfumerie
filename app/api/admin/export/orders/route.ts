/**
 * API Export Commandes CSV
 * GET /api/admin/export/orders
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

    const orders = await prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true } },
        customer: { select: { name: true, email: true } },
        items: {
          include: { product: { select: { name: true, brand: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const data = orders.map((o) => ({
      id: o.id,
      stripeSessionId: o.stripeSessionId,
      status: o.status,
      totalAmount: o.totalAmount,
      promoCode: o.promoCode || '',
      discountAmount: o.discountAmount || 0,
      customerName: o.user?.name || o.customer?.name || '',
      customerEmail: o.user?.email || o.customer?.email || '',
      itemsCount: o.items.reduce((sum, i) => sum + i.quantity, 0),
      items: o.items.map((i) => `${i.product.name} x${i.quantity}`).join(' | '),
      trackingNumber: o.trackingNumber || '',
      carrier: o.carrier || '',
      createdAt: o.createdAt.toISOString(),
      paidAt: o.paidAt?.toISOString() || '',
      shippedAt: o.shippedAt?.toISOString() || '',
      deliveredAt: o.deliveredAt?.toISOString() || '',
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
        'Content-Disposition': `attachment; filename="commandes_${date}.csv"`,
      },
    });
  } catch (error) {
    console.error('[EXPORT API] Erreur commandes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
