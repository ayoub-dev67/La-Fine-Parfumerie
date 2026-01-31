import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/customers
 * Récupère la liste des clients avec leurs statistiques
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const filter = searchParams.get("filter") || "all"; // all, vip, new, inactive
  const sortBy = searchParams.get("sortBy") || "totalSpent"; // totalSpent, orderCount, createdAt
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const exportCsv = searchParams.get("export") === "true";

  try {
    // Construire les filtres
    const whereClause: Record<string, unknown> = {};

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    // Récupérer tous les clients avec leurs stats
    const customers = await prisma.user.findMany({
      where: whereClause,
      include: {
        orders: {
          where: { status: { not: "CANCELLED" } },
          select: {
            id: true,
            totalAmount: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: {
            orders: true,
            reviews: true,
            wishlist: true,
          },
        },
      },
    });

    // Calculer les statistiques pour chaque client
    let customersWithStats = customers.map((customer) => {
      const totalSpent = customer.orders.reduce(
        (sum, order) => sum + Number(order.totalAmount),
        0
      );
      const orderCount = customer.orders.length;
      const lastOrderDate = customer.orders.length > 0
        ? customer.orders.sort(
            (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )[0].createdAt
        : null;

      // Calcul du panier moyen
      const averageCart = orderCount > 0 ? totalSpent / orderCount : 0;

      // Déterminer si VIP (> 500€)
      const isVip = totalSpent >= 500;

      // Déterminer si nouveau (inscrit il y a moins de 30 jours)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const isNew = new Date(customer.createdAt) > thirtyDaysAgo;

      // Déterminer si inactif (pas de commande depuis 90 jours)
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
      const isInactive = !lastOrderDate || new Date(lastOrderDate) < ninetyDaysAgo;

      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        image: customer.image,
        role: customer.role,
        createdAt: customer.createdAt,
        totalSpent,
        orderCount,
        averageCart,
        lastOrderDate,
        reviewCount: customer._count.reviews,
        wishlistCount: customer._count.wishlist,
        isVip,
        isNew,
        isInactive,
      };
    });

    // Appliquer les filtres
    if (filter === "vip") {
      customersWithStats = customersWithStats.filter((c) => c.isVip);
    } else if (filter === "new") {
      customersWithStats = customersWithStats.filter((c) => c.isNew);
    } else if (filter === "inactive") {
      customersWithStats = customersWithStats.filter((c) => c.isInactive);
    }

    // Trier
    customersWithStats.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "totalSpent":
          comparison = a.totalSpent - b.totalSpent;
          break;
        case "orderCount":
          comparison = a.orderCount - b.orderCount;
          break;
        case "createdAt":
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
        case "name":
          comparison = (a.name || "").localeCompare(b.name || "");
          break;
        default:
          comparison = a.totalSpent - b.totalSpent;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    // Stats globales
    const totalCustomers = customersWithStats.length;
    const vipCount = customersWithStats.filter((c) => c.isVip).length;
    const newCount = customersWithStats.filter((c) => c.isNew).length;
    const inactiveCount = customersWithStats.filter((c) => c.isInactive).length;
    const totalRevenue = customersWithStats.reduce((sum, c) => sum + c.totalSpent, 0);
    const averageLifetimeValue = totalCustomers > 0 ? totalRevenue / totalCustomers : 0;

    // Export CSV
    if (exportCsv) {
      const csvHeader = "Nom,Email,Total dépensé,Nb commandes,Panier moyen,VIP,Inscrit le,Dernière commande\n";
      const csvData = customersWithStats
        .map((c) =>
          `"${c.name || ""}","${c.email}",${c.totalSpent.toFixed(2)},${c.orderCount},${c.averageCart.toFixed(2)},${c.isVip ? "Oui" : "Non"},${new Date(c.createdAt).toLocaleDateString("fr-FR")},${c.lastOrderDate ? new Date(c.lastOrderDate).toLocaleDateString("fr-FR") : "Jamais"}`
        )
        .join("\n");

      return new NextResponse(csvHeader + csvData, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="clients-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Pagination
    const totalPages = Math.ceil(customersWithStats.length / limit);
    const paginatedCustomers = customersWithStats.slice(
      (page - 1) * limit,
      page * limit
    );

    return NextResponse.json({
      customers: paginatedCustomers,
      pagination: {
        page,
        limit,
        totalPages,
        totalItems: customersWithStats.length,
      },
      stats: {
        totalCustomers,
        vipCount,
        newCount,
        inactiveCount,
        totalRevenue,
        averageLifetimeValue,
      },
    });
  } catch (error) {
    console.error("Erreur récupération clients:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
