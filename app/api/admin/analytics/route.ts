/**
 * API Admin Analytics
 * GET /api/admin/analytics - Retourne les données pour les graphiques
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getCached } from '@/lib/redis';
import { subDays, subWeeks, subMonths, format, startOfDay, startOfWeek, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get('period') || 'month'; // day, week, month

    const cacheKey = `analytics:${period}`;

    const data = await getCached(
      cacheKey,
      async () => {
        const now = new Date();
        let startDate: Date;
        let groupBy: 'day' | 'week' | 'month';

        switch (period) {
          case 'day':
            startDate = subDays(now, 30);
            groupBy = 'day';
            break;
          case 'week':
            startDate = subWeeks(now, 12);
            groupBy = 'week';
            break;
          case 'month':
          default:
            startDate = subMonths(now, 12);
            groupBy = 'month';
            break;
        }

        // 1. Données de ventes par période
        const orders = await prisma.order.findMany({
          where: {
            createdAt: { gte: startDate },
            status: { notIn: ['CANCELLED', 'FAILED'] },
          },
          select: {
            createdAt: true,
            totalAmount: true,
            status: true,
          },
          orderBy: { createdAt: 'asc' },
        });

        const salesData = groupOrdersByPeriod(orders, groupBy);

        // 2. Commandes par statut
        const ordersByStatus = await prisma.order.groupBy({
          by: ['status'],
          _count: { id: true },
          where: {
            createdAt: { gte: startDate },
          },
        });

        const statusData = ordersByStatus.map((s) => ({
          status: getStatusLabel(s.status),
          count: s._count.id,
          fill: getStatusColor(s.status),
        }));

        // 3. Top 10 produits par revenu
        const topProducts = await prisma.orderItem.groupBy({
          by: ['productId'],
          _sum: { quantity: true },
          where: {
            order: {
              createdAt: { gte: startDate },
              status: { notIn: ['CANCELLED', 'FAILED'] },
            },
          },
          orderBy: { _sum: { quantity: 'desc' } },
          take: 10,
        });

        const productIds = topProducts.map((p) => p.productId);
        const products = await prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { id: true, name: true, brand: true, price: true },
        });

        const topProductsData = topProducts.map((p) => {
          const product = products.find((prod) => prod.id === p.productId);
          return {
            name: product?.name || 'Inconnu',
            brand: product?.brand || '',
            quantity: p._sum.quantity || 0,
            revenue: (p._sum.quantity || 0) * Number(product?.price || 0),
          };
        }).sort((a, b) => b.revenue - a.revenue);

        // 4. Répartition clients nouveaux vs récurrents
        const newCustomers = await prisma.user.count({
          where: {
            createdAt: { gte: startDate },
            orders: { some: {} },
          },
        });

        const returningCustomers = await prisma.user.count({
          where: {
            createdAt: { lt: startDate },
            orders: {
              some: {
                createdAt: { gte: startDate },
              },
            },
          },
        });

        const customersData = [
          { name: 'Nouveaux', value: newCustomers, fill: '#c5a059' },
          { name: 'Récurrents', value: returningCustomers, fill: '#22c55e' },
        ];

        // 5. Statistiques globales
        const totalRevenue = orders.reduce((sum, o) => sum + Number(o.totalAmount), 0);
        const totalOrders = orders.length;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        return {
          salesData,
          statusData,
          topProductsData,
          customersData,
          summary: {
            totalRevenue,
            totalOrders,
            avgOrderValue,
            newCustomers,
            returningCustomers,
          },
        };
      },
      300 // Cache 5 minutes
    );

    return NextResponse.json(data);
  } catch (error) {
    console.error('[ANALYTICS API] Erreur:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

function groupOrdersByPeriod(
  orders: Array<{ createdAt: Date; totalAmount: number }>,
  groupBy: 'day' | 'week' | 'month'
) {
  const grouped: Record<string, { revenue: number; orders: number }> = {};

  orders.forEach((order) => {
    let key: string;
    switch (groupBy) {
      case 'day':
        key = format(order.createdAt, 'dd/MM', { locale: fr });
        break;
      case 'week':
        key = format(startOfWeek(order.createdAt, { weekStartsOn: 1 }), 'dd/MM', { locale: fr });
        break;
      case 'month':
        key = format(order.createdAt, 'MMM yy', { locale: fr });
        break;
    }

    if (!grouped[key]) {
      grouped[key] = { revenue: 0, orders: 0 };
    }
    grouped[key].revenue += Number(order.totalAmount);
    grouped[key].orders += 1;
  });

  return Object.entries(grouped).map(([date, data]) => ({
    date,
    revenue: Math.round(data.revenue),
    orders: data.orders,
  }));
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    PENDING: 'En attente',
    PAID: 'Payée',
    SHIPPED: 'Expédiée',
    DELIVERED: 'Livrée',
    CANCELLED: 'Annulée',
    FAILED: 'Échouée',
    REFUNDED: 'Remboursée',
  };
  return labels[status] || status;
}

function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    PENDING: '#f59e0b',
    PAID: '#3b82f6',
    SHIPPED: '#8b5cf6',
    DELIVERED: '#22c55e',
    CANCELLED: '#ef4444',
    FAILED: '#dc2626',
    REFUNDED: '#6b7280',
  };
  return colors[status] || '#6b7280';
}
