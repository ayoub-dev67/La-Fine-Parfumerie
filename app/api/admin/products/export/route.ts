import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/admin/products/export
 * Export tous les produits en CSV
 */
export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    const products = await prisma.product.findMany({
      orderBy: { name: "asc" },
    });

    const csvHeader = "ID,Nom,Marque,Description,Prix,Volume,Image,Catégorie,Sous-catégorie,Stock,Notes de tête,Notes de coeur,Notes de fond,Featured,Nouveau,Best-seller\n";

    const csvData = products
      .map((p) =>
        `${p.id},"${(p.name || "").replace(/"/g, '""')}","${(p.brand || "").replace(/"/g, '""')}","${(p.description || "").replace(/"/g, '""').substring(0, 200)}",${Number(p.price).toFixed(2)},"${p.volume || ""}","${p.image}","${p.category}","${p.subcategory || ""}",${p.stock},"${(p.notesTop || "").replace(/"/g, '""')}","${(p.notesHeart || "").replace(/"/g, '""')}","${(p.notesBase || "").replace(/"/g, '""')}",${p.isFeatured ? "Oui" : "Non"},${p.isNew ? "Oui" : "Non"},${p.isBestSeller ? "Oui" : "Non"}`
      )
      .join("\n");

    return new NextResponse(csvHeader + csvData, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="produits-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Erreur export produits:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
