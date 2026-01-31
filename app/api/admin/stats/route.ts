import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { getCached } from "@/lib/redis";
import { startOfDay, subDays, startOfWeek, startOfMonth, format, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, subMonths } from "date-fns";
import { fr } from "date-fns/locale";

// Cache TTL: 5 minutes pour les stats
const STATS_CACHE_TTL = 300;

/**
 * GET /api/admin/stats
 * Récupère toutes les statistiques pour le dashboard admin
 * Cache Redis: 5 minutes par période
 */
export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") || "month"; // day, week, month
  const cacheKey = `admin:stats:${period}`;

  try {
    const stats = await getCached(cacheKey, () => fetchStats(period), STATS_CACHE_TTL);
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erreur stats admin:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * Fetch les statistiques depuis la base de données
 */
async function fetchStats(period: string) {
  try {
    const now = new Date();
    let startDate: Date;
    let previousStartDate: Date;
    let previousEndDate: Date;

    // Définir les périodes
    switch (period) {
      case "day":
        startDate = subDays(now, 30);
        previousStartDate = subDays(startDate, 30);
        previousEndDate = startDate;
        break;
      case "week":
        startDate = subDays(now, 12 * 7); // 12 semaines
        previousStartDate = subDays(startDate, 12 * 7);
        previousEndDate = startDate;
        break;
      case "month":
      default:
        startDate = subMonths(now, 12);
        previousStartDate = subMonths(startDate, 12);
        previousEndDate = startDate;
        break;
    }

    // 1. Statistiques globales
    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      previousOrders,
      previousRevenue,
      previousCustomers,
    ] = await Promise.all([
      // Commandes période actuelle
      prisma.order.count({
        where: {
          createdAt: { gte: startDate },
          status: { not: "CANCELLED" },
        },
      }),
      // CA période actuelle
      prisma.order.aggregate({
        where: {
          createdAt: { gte: startDate },
          status: { not: "CANCELLED" },
        },
        _sum: { totalAmount: true },
      }),
      // Nouveaux clients période actuelle
      prisma.user.count({
        where: {
          createdAt: { gte: startDate },
        },
      }),
      // Total produits
      prisma.product.count(),
      // Commandes période précédente
      prisma.order.count({
        where: {
          createdAt: { gte: previousStartDate, lt: previousEndDate },
          status: { not: "CANCELLED" },
        },
      }),
      // CA période précédente
      prisma.order.aggregate({
        where: {
          createdAt: { gte: previousStartDate, lt: previousEndDate },
          status: { not: "CANCELLED" },
        },
        _sum: { totalAmount: true },
      }),
      // Nouveaux clients période précédente
      prisma.user.count({
        where: {
          createdAt: { gte: previousStartDate, lt: previousEndDate },
        },
      }),
    ]);

    // Calcul des variations
    const currentRevenue = Number(totalRevenue._sum.totalAmount || 0);
    const prevRevenue = Number(previousRevenue._sum.totalAmount || 0);
    const revenueChange = prevRevenue > 0
      ? ((currentRevenue - prevRevenue) / prevRevenue * 100).toFixed(1)
      : "0";

    const ordersChange = previousOrders > 0
      ? ((totalOrders - previousOrders) / previousOrders * 100).toFixed(1)
      : "0";

    const customersChange = previousCustomers > 0
      ? ((totalCustomers - previousCustomers) / previousCustomers * 100).toFixed(1)
      : "0";

    // 2. Panier moyen
    const averageCart = totalOrders > 0 ? currentRevenue / totalOrders : 0;

    // 3. CA par période pour le graphique
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: "CANCELLED" },
      },
      select: {
        createdAt: true,
        totalAmount: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Générer les données du graphique
    let chartData: { date: string; revenue: number; orders: number }[] = [];

    if (period === "day") {
      const days = eachDayOfInterval({ start: startDate, end: now });
      chartData = days.map((day) => {
        const dayStart = startOfDay(day);
        const dayEnd = new Date(dayStart);
        dayEnd.setDate(dayEnd.getDate() + 1);

        const dayOrders = orders.filter(
          (o) => o.createdAt >= dayStart && o.createdAt < dayEnd
        );

        return {
          date: format(day, "dd MMM", { locale: fr }),
          revenue: dayOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
          orders: dayOrders.length,
        };
      });
    } else if (period === "week") {
      const weeks = eachWeekOfInterval({ start: startDate, end: now }, { weekStartsOn: 1 });
      chartData = weeks.map((weekStart) => {
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 7);

        const weekOrders = orders.filter(
          (o) => o.createdAt >= weekStart && o.createdAt < weekEnd
        );

        return {
          date: format(weekStart, "dd MMM", { locale: fr }),
          revenue: weekOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
          orders: weekOrders.length,
        };
      });
    } else {
      const months = eachMonthOfInterval({ start: startDate, end: now });
      chartData = months.map((monthStart) => {
        const monthEnd = new Date(monthStart);
        monthEnd.setMonth(monthEnd.getMonth() + 1);

        const monthOrders = orders.filter(
          (o) => o.createdAt >= monthStart && o.createdAt < monthEnd
        );

        return {
          date: format(monthStart, "MMM yyyy", { locale: fr }),
          revenue: monthOrders.reduce((sum, o) => sum + Number(o.totalAmount), 0),
          orders: monthOrders.length,
        };
      });
    }

    // 4. Top 10 produits vendus
    const topProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      _count: { id: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
    });

    const topProductsWithDetails = await Promise.all(
      topProducts.map(async (item) => {
        const product = await prisma.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, brand: true, image: true, price: true },
        });
        return {
          ...product,
          totalSold: item._sum.quantity || 0,
          orderCount: item._count.id,
          revenue: (item._sum.quantity || 0) * Number(product?.price || 0),
        };
      })
    );

    // 5. Alertes stock bas (< 5 unités)
    const lowStockProducts = await prisma.product.findMany({
      where: { stock: { lt: 5 } },
      select: {
        id: true,
        name: true,
        brand: true,
        stock: true,
        image: true,
      },
      orderBy: { stock: "asc" },
      take: 10,
    });

    // 6. Commandes récentes
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { name: true, email: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    // 7. Statistiques par statut de commande
    const ordersByStatus = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    // 8. Clients récurrents vs nouveaux
    const customersWithMultipleOrders = await prisma.user.count({
      where: {
        orders: { some: {} },
        AND: {
          orders: {
            some: {
              createdAt: { gte: startDate },
            },
          },
        },
      },
    });

    const newCustomersWithOrders = await prisma.user.count({
      where: {
        createdAt: { gte: startDate },
        orders: { some: {} },
      },
    });

    // 9. Taux de conversion (approximation basée sur les sessions checkout créées)
    // En l'absence de tracking des visites, on estime basé sur les commandes complétées vs en attente
    const completedOrders = await prisma.order.count({
      where: {
        createdAt: { gte: startDate },
        status: { in: ["PAID", "SHIPPED", "DELIVERED"] },
      },
    });
    const pendingOrders = await prisma.order.count({
      where: {
        createdAt: { gte: startDate },
        status: "PENDING",
      },
    });
    const conversionRate = completedOrders + pendingOrders > 0
      ? ((completedOrders / (completedOrders + pendingOrders)) * 100).toFixed(1)
      : "0";

    // 10. Revenus par catégorie
    const revenueByCategory = await prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: "CANCELLED" },
        },
      },
      include: {
        product: { select: { category: true, price: true } },
      },
    });

    const categoryStats = revenueByCategory.reduce((acc, item) => {
      const category = item.product.category;
      if (!acc[category]) {
        acc[category] = { revenue: 0, count: 0 };
      }
      acc[category].revenue += Number(item.product.price) * item.quantity;
      acc[category].count += item.quantity;
      return acc;
    }, {} as Record<string, { revenue: number; count: number }>);

    return {
      summary: {
        totalRevenue: currentRevenue,
        revenueChange: Number(revenueChange),
        totalOrders,
        ordersChange: Number(ordersChange),
        totalCustomers,
        customersChange: Number(customersChange),
        totalProducts,
        averageCart,
        conversionRate: Number(conversionRate),
        newCustomers: newCustomersWithOrders,
        returningCustomers: customersWithMultipleOrders - newCustomersWithOrders,
      },
      chartData,
      topProducts: topProductsWithDetails,
      lowStockProducts,
      recentOrders: recentOrders.map((order) => ({
        id: order.id,
        customer: order.user?.name || order.user?.email || "Client anonyme",
        total: Number(order.totalAmount),
        status: order.status,
        itemCount: order.items.reduce((sum, i) => sum + i.quantity, 0),
        createdAt: order.createdAt,
      })),
      ordersByStatus: ordersByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      categoryStats: Object.entries(categoryStats).map(([category, stats]) => ({
        category,
        revenue: stats.revenue,
        count: stats.count,
      })),
    };
  } catch (error) {
    console.error("Erreur fetch stats:", error);
    throw error;
  }
}

