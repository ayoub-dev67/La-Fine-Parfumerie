import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/orders
 * Récupère la liste des commandes avec filtres et pagination
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const status = searchParams.get("status");
  const search = searchParams.get("search") || "";
  const dateFrom = searchParams.get("dateFrom");
  const dateTo = searchParams.get("dateTo");
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortOrder = searchParams.get("sortOrder") || "desc";
  const exportCsv = searchParams.get("export") === "true";

  try {
    // Construire les filtres
    const whereClause: Record<string, unknown> = {};

    if (status && status !== "all") {
      whereClause.status = status;
    }

    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: "insensitive" } },
        { user: { name: { contains: search, mode: "insensitive" } } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ];
    }

    if (dateFrom || dateTo) {
      whereClause.createdAt = {};
      if (dateFrom) {
        (whereClause.createdAt as Record<string, Date>).gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        (whereClause.createdAt as Record<string, Date>).lte = endDate;
      }
    }

    // Déterminer le tri
    const orderBy: Record<string, string> = {};
    orderBy[sortBy] = sortOrder;

    // Compter le total
    const totalItems = await prisma.order.count({ where: whereClause });

    // Récupérer les commandes
    const orders = await prisma.order.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        items: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                image: true,
                price: true,
                volume: true,
              },
            },
          },
        },
      },
      orderBy,
      skip: exportCsv ? 0 : (page - 1) * limit,
      take: exportCsv ? undefined : limit,
    });

    // Export CSV
    if (exportCsv) {
      const csvHeader = "ID,Client,Email,Total,Statut,Nb articles,Date\n";
      const csvData = orders
        .map((order) => {
          return `"${order.id}","${order.user?.name || "Anonyme"}","${order.user?.email || ""}",${Number(order.totalAmount).toFixed(2)},"${order.status}",${order.items.reduce((sum, i) => sum + i.quantity, 0)},"${new Date(order.createdAt).toLocaleDateString("fr-FR")}"`;
        })
        .join("\n");

      return new NextResponse(csvHeader + csvData, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="commandes-${new Date().toISOString().split("T")[0]}.csv"`,
        },
      });
    }

    // Formatter les données
    const formattedOrders = orders.map((order) => ({
      id: order.id,
      customer: {
        id: order.user?.id,
        name: order.user?.name || "Client anonyme",
        email: order.user?.email,
        image: order.user?.image,
      },
      items: order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        name: item.product.name,
        brand: item.product.brand,
        image: item.product.image,
        price: Number(item.product.price),
        volume: item.product.volume,
        quantity: item.quantity,
      })),
      totalAmount: Number(order.totalAmount),
      status: order.status,
      trackingNumber: order.trackingNumber,
      carrier: order.carrier,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
    }));

    // Stats par statut
    const statusCounts = await prisma.order.groupBy({
      by: ["status"],
      _count: { id: true },
    });

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        page,
        limit,
        totalPages: Math.ceil(totalItems / limit),
        totalItems,
      },
      statusCounts: statusCounts.reduce(
        (acc, s) => ({ ...acc, [s.status]: s._count.id }),
        {} as Record<string, number>
      ),
    });
  } catch (error) {
    console.error("Erreur récupération commandes:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/orders
 * Bulk update des commandes (marquer plusieurs comme expédié, etc.)
 */
export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { orderIds, action, data } = body;

    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json(
        { error: "Liste de commandes requise" },
        { status: 400 }
      );
    }

    let updatedCount = 0;

    switch (action) {
      case "markAsShipped":
        const { trackingNumber, carrier } = data || {};
        await prisma.order.updateMany({
          where: {
            id: { in: orderIds },
            status: "PAID",
          },
          data: {
            status: "SHIPPED",
            trackingNumber: trackingNumber || null,
            carrier: carrier || null,
          },
        });
        updatedCount = orderIds.length;
        break;

      case "markAsDelivered":
        await prisma.order.updateMany({
          where: {
            id: { in: orderIds },
            status: "SHIPPED",
          },
          data: {
            status: "DELIVERED",
          },
        });
        updatedCount = orderIds.length;
        break;

      case "cancel":
        await prisma.order.updateMany({
          where: {
            id: { in: orderIds },
            status: { in: ["PENDING", "PAID"] },
          },
          data: {
            status: "CANCELLED",
          },
        });
        updatedCount = orderIds.length;
        break;

      default:
        return NextResponse.json(
          { error: "Action non reconnue" },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${updatedCount} commande(s) mise(s) à jour`,
      updatedCount,
    });
  } catch (error) {
    console.error("Erreur bulk update commandes:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
