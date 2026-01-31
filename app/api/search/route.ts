import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCached } from "@/lib/redis";
import { Prisma } from "@prisma/client";

/**
 * API de recherche avancée avec filtres
 * GET /api/search?q=query&category=&minPrice=&maxPrice=&inStock=&sortBy=&limit=
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q")?.trim() || "";
  const category = searchParams.get("category");
  const brand = searchParams.get("brand");
  const minPrice = parseFloat(searchParams.get("minPrice") || "0");
  const maxPrice = parseFloat(searchParams.get("maxPrice") || "10000");
  const inStock = searchParams.get("inStock") === "true";
  const sortBy = searchParams.get("sortBy") || "relevance";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 100);

  // Si pas de query ni filtres, retourner vide
  if (!query && !category && !brand) {
    return NextResponse.json({ suggestions: [], products: [], total: 0 });
  }

  // Cache key basé sur tous les paramètres
  const cacheKey = `search:${query}:${category}:${brand}:${minPrice}:${maxPrice}:${inStock}:${sortBy}:${limit}`;

  try {
    const result = await getCached(
      cacheKey,
      async () => {
        // Construire les conditions WHERE
        const where: Prisma.ProductWhereInput = {
          AND: [],
        };

        // Filtre par texte
        if (query && query.length >= 2) {
          (where.AND as Array<unknown>).push({
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { brand: { contains: query, mode: "insensitive" } },
              { description: { contains: query, mode: "insensitive" } },
              { notesTop: { contains: query, mode: "insensitive" } },
              { notesHeart: { contains: query, mode: "insensitive" } },
              { notesBase: { contains: query, mode: "insensitive" } },
            ],
          });
        }

        // Filtre par catégorie
        if (category) {
          (where.AND as Array<unknown>).push({ category });
        }

        // Filtre par marque
        if (brand) {
          (where.AND as Array<unknown>).push({ brand });
        }

        // Filtre par prix
        (where.AND as Array<unknown>).push({
          price: { gte: minPrice, lte: maxPrice },
        });

        // Filtre en stock
        if (inStock) {
          (where.AND as Array<unknown>).push({ stock: { gt: 0 } });
        }

        // Ordre de tri
        let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[];
        switch (sortBy) {
          case "price_asc":
            orderBy = { price: "asc" };
            break;
          case "price_desc":
            orderBy = { price: "desc" };
            break;
          case "newest":
            orderBy = { createdAt: "desc" };
            break;
          case "bestseller":
            orderBy = [{ isBestSeller: "desc" }, { name: "asc" }];
            break;
          case "name_asc":
            orderBy = { name: "asc" };
            break;
          case "name_desc":
            orderBy = { name: "desc" };
            break;
          default: // relevance
            orderBy = [
              { isBestSeller: "desc" },
              { isFeatured: "desc" },
              { name: "asc" },
            ];
        }

        // Exécuter la recherche
        const products = await prisma.product.findMany({
          where,
          orderBy,
          take: limit,
          select: {
            id: true,
            name: true,
            brand: true,
            image: true,
            price: true,
            category: true,
            volume: true,
            stock: true,
            isBestSeller: true,
            isFeatured: true,
            isNew: true,
          },
        });

        // Suggestions (seulement si query)
        let suggestions: string[] = [];
        if (query && query.length >= 2) {
          const seen = new Set<string>();

          // Marques correspondantes
          const brands = await prisma.product.findMany({
            where: { brand: { contains: query, mode: "insensitive" } },
            select: { brand: true },
            distinct: ["brand"],
            take: 3,
          });

          brands.forEach((b) => {
            if (b.brand && !seen.has(b.brand.toLowerCase())) {
              suggestions.push(b.brand);
              seen.add(b.brand.toLowerCase());
            }
          });

          // Catégories correspondantes
          const categories = await prisma.product.findMany({
            where: { category: { contains: query, mode: "insensitive" } },
            select: { category: true },
            distinct: ["category"],
            take: 2,
          });

          categories.forEach((c) => {
            if (!seen.has(c.category.toLowerCase())) {
              suggestions.push(c.category);
              seen.add(c.category.toLowerCase());
            }
          });
        }

        return {
          suggestions: suggestions.slice(0, 5),
          products: products.map((p) => ({
            id: p.id,
            name: p.name,
            brand: p.brand,
            image: p.image,
            price: Number(p.price),
            category: p.category,
            volume: p.volume,
            stock: p.stock,
            isBestSeller: p.isBestSeller,
            isFeatured: p.isFeatured,
            isNew: p.isNew,
          })),
          total: products.length,
        };
      },
      300 // Cache 5 minutes
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erreur recherche:", error);
    return NextResponse.json(
      { error: "Erreur lors de la recherche" },
      { status: 500 }
    );
  }
}
