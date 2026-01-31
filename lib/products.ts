/**
 * Service centralisé pour la gestion des produits
 * Utilise Prisma pour récupérer les données depuis PostgreSQL
 */

import { prisma } from "./prisma";
import { Product } from "@/types";
import { Product as PrismaProduct } from "@prisma/client";

// Convertir un produit Prisma en Product type
function convertPrismaProduct(product: PrismaProduct): Product {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    description: product.description,
    price: Number(product.price),
    volume: product.volume,
    image: product.image,
    category: product.category,
    subcategory: product.subcategory,
    stock: product.stock,
    notesTop: product.notesTop,
    notesHeart: product.notesHeart,
    notesBase: product.notesBase,
    isFeatured: product.isFeatured,
    isNew: product.isNew,
    isBestSeller: product.isBestSeller,
  };
}

/**
 * Récupère tous les produits disponibles
 */
export async function getAllProducts(): Promise<Product[]> {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });
  return products.map(convertPrismaProduct);
}

/**
 * Récupère un produit par son ID
 */
export async function getProductById(id: number): Promise<Product | null> {
  const product = await prisma.product.findUnique({
    where: { id },
  });
  return product ? convertPrismaProduct(product) : null;
}

/**
 * Récupère les produits par catégorie
 */
export async function getProductsByCategory(category: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { category },
    orderBy: { createdAt: "desc" },
  });
  return products.map(convertPrismaProduct);
}

/**
 * Récupère les produits en vedette (isFeatured = true)
 */
export async function getFeaturedProducts(limit: number = 4): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isFeatured: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(convertPrismaProduct);
}

/**
 * Récupère les nouveaux produits (isNew = true)
 */
export async function getNewProducts(limit: number = 4): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isNew: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(convertPrismaProduct);
}

/**
 * Récupère les best-sellers
 */
export async function getBestSellers(limit: number = 4): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { isBestSeller: true },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(convertPrismaProduct);
}

/**
 * Récupère les produits de la collection Signature Royale
 */
export async function getSignatureProducts(limit: number = 4): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { category: "Signature" },
    take: limit,
    orderBy: { createdAt: "desc" },
  });
  return products.map(convertPrismaProduct);
}

/**
 * Récupère les produits par marque
 */
export async function getProductsByBrand(brand: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: { brand },
    orderBy: { createdAt: "desc" },
  });
  return products.map(convertPrismaProduct);
}

/**
 * Récupère toutes les catégories uniques disponibles
 */
export async function getCategories(): Promise<string[]> {
  const products = await prisma.product.findMany({
    select: { category: true },
    distinct: ["category"],
  });
  return ["Tous", ...products.map((p) => p.category)];
}

/**
 * Récupère toutes les marques uniques disponibles
 */
export async function getBrands(): Promise<string[]> {
  const products = await prisma.product.findMany({
    select: { brand: true },
    distinct: ["brand"],
    where: { brand: { not: null } },
  });
  return products.map((p) => p.brand!).filter(Boolean);
}

/**
 * Recherche de produits
 */
export async function searchProducts(query: string): Promise<Product[]> {
  const products = await prisma.product.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });
  return products.map(convertPrismaProduct);
}

/**
 * Vérifie si un produit est en stock
 */
export async function isProductInStock(id: number): Promise<boolean> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { stock: true },
  });
  return product ? product.stock > 0 : false;
}

/**
 * Récupère les produits avec pagination et filtres
 */
export async function getProducts(options: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
  sortBy?: "price" | "newest" | "bestseller";
}): Promise<{
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
  hasMore: boolean;
}> {
  const page = options.page || 1;
  const limit = options.limit || 20;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (options.category && options.category !== "Tous") {
    where.category = options.category;
  }

  if (options.search) {
    where.OR = [
      { name: { contains: options.search, mode: "insensitive" } },
      { brand: { contains: options.search, mode: "insensitive" } },
      { description: { contains: options.search, mode: "insensitive" } },
    ];
  }

  let orderBy: any = { createdAt: "desc" };
  if (options.sortBy === "price") orderBy = { price: "asc" };
  else if (options.sortBy === "newest") orderBy = { createdAt: "desc" };
  else if (options.sortBy === "bestseller")
    orderBy = [{ isBestSeller: "desc" }, { createdAt: "desc" }];

  const [dbProducts, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  const products = dbProducts.map(convertPrismaProduct);

  return {
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    hasMore: page * limit < total,
  };
}
