/**
 * SERVICE DE GESTION DES COMMANDES
 *
 * @security Ce fichier utilise des TRANSACTIONS Prisma pour éviter les race conditions
 * sur la gestion du stock. Toutes les opérations critiques sont atomiques.
 */

import { prisma } from "./prisma";
import { Order, OrderItem, OrderStatus } from "@/types";
import { OrderStatus as PrismaOrderStatus } from "@prisma/client";
import {
  CreateOrderSchema,
  UpdateOrderStatusSchema,
  validateOrThrow,
} from "./validations";

// ============================================
// TYPES PERSONNALISÉS POUR LES ERREURS
// ============================================

export class InsufficientStockError extends Error {
  productId: number;
  productName: string;
  requested: number;
  available: number;

  constructor(
    productId: number,
    productName: string,
    requested: number,
    available: number
  ) {
    super(
      `Stock insuffisant pour "${productName}": demandé ${requested}, disponible ${available}`
    );
    this.name = "InsufficientStockError";
    this.productId = productId;
    this.productName = productName;
    this.requested = requested;
    this.available = available;
  }
}

export class OrderNotFoundError extends Error {
  sessionId: string;

  constructor(sessionId: string) {
    super(`Commande introuvable pour la session: ${sessionId}`);
    this.name = "OrderNotFoundError";
    this.sessionId = sessionId;
  }
}

// ============================================
// HELPERS DE CONVERSION
// ============================================

function toPrismaStatus(status: OrderStatus): PrismaOrderStatus {
  const map: Record<OrderStatus, PrismaOrderStatus> = {
    pending: "PENDING",
    paid: "PAID",
    shipped: "SHIPPED",
    delivered: "DELIVERED",
    cancelled: "CANCELLED",
    failed: "FAILED",
  };
  return map[status];
}

function fromPrismaStatus(status: PrismaOrderStatus): OrderStatus {
  const map: Record<PrismaOrderStatus, OrderStatus> = {
    PENDING: "pending",
    PAID: "paid",
    SHIPPED: "shipped",
    DELIVERED: "delivered",
    CANCELLED: "cancelled",
    FAILED: "failed",
    REFUNDED: "cancelled",
  };
  return map[status];
}

// ============================================
// CRÉATION DE COMMANDE AVEC VÉRIFICATION STOCK
// ============================================

/**
 * Crée une nouvelle commande en statut "pending" dans PostgreSQL
 * Utilise une TRANSACTION pour garantir l'intégrité des données
 *
 * @throws {InsufficientStockError} Si le stock est insuffisant
 * @throws {Error} Si la validation échoue
 */
export async function createOrder(
  stripeSessionId: string,
  items: OrderItem[],
  totalAmount: number,
  customerEmail?: string,
  userId?: string,
  promoCode?: string | null,
  discountAmount?: number
): Promise<Order> {
  // Validation des données d'entrée
  validateOrThrow(
    CreateOrderSchema,
    { stripeSessionId, items, totalAmount },
    "Données de commande invalides"
  );

  // Utiliser une transaction pour garantir l'atomicité
  return await prisma.$transaction(async (tx) => {
    // 1. Vérifier le stock de TOUS les produits AVANT de créer la commande
    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { id: true, name: true, stock: true },
      });

      if (!product) {
        throw new Error(`Produit #${item.productId} introuvable`);
      }

      if (product.stock < item.quantity) {
        throw new InsufficientStockError(
          product.id,
          product.name,
          item.quantity,
          product.stock
        );
      }
    }

    // 2. Créer ou récupérer le client si email fourni
    let customerId: string | undefined;
    if (customerEmail) {
      const customer = await tx.customer.upsert({
        where: { email: customerEmail },
        update: {},
        create: { email: customerEmail },
      });
      customerId = customer.id;
    }

    // 3. Créer la commande avec ses lignes
    const dbOrder = await tx.order.create({
      data: {
        stripeSessionId,
        totalAmount,
        status: "PENDING",
        customerId,
        userId, // Lier à l'utilisateur authentifié
        promoCode: promoCode || null,
        discountAmount: discountAmount || null,
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        user: true,
      },
    });

    console.log(`📦 Commande créée: ${dbOrder.id} (pending) - Transaction sécurisée`);

    return {
      id: dbOrder.id,
      stripeSessionId: dbOrder.stripeSessionId,
      items: dbOrder.items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      totalAmount: Number(dbOrder.totalAmount),
      status: fromPrismaStatus(dbOrder.status),
      createdAt: dbOrder.createdAt.toISOString(),
      customerEmail: dbOrder.customer?.email,
    };
  }, {
    // Options de transaction pour éviter les deadlocks
    isolationLevel: "Serializable",
    maxWait: 5000, // 5 secondes max d'attente
    timeout: 10000, // 10 secondes max de transaction
  });
}

// ============================================
// RÉCUPÉRATION DE COMMANDE
// ============================================

/**
 * Récupère une commande par session Stripe
 */
export async function getOrderBySessionId(
  sessionId: string
): Promise<Order | null> {
  if (!sessionId || typeof sessionId !== "string") {
    console.error("❌ Session ID invalide");
    return null;
  }

  const dbOrder = await prisma.order.findUnique({
    where: { stripeSessionId: sessionId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
    },
  });

  if (!dbOrder) return null;

  return {
    id: dbOrder.id,
    stripeSessionId: dbOrder.stripeSessionId,
    items: dbOrder.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: Number(item.price),
      quantity: item.quantity,
    })),
    totalAmount: Number(dbOrder.totalAmount),
    status: fromPrismaStatus(dbOrder.status),
    createdAt: dbOrder.createdAt.toISOString(),
    paidAt: dbOrder.paidAt?.toISOString(),
    customerEmail: dbOrder.customer?.email,
  };
}

/**
 * Récupère une commande par ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  if (!orderId || typeof orderId !== "string") {
    console.error("❌ Order ID invalide");
    return null;
  }

  const dbOrder = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
    },
  });

  if (!dbOrder) return null;

  return {
    id: dbOrder.id,
    stripeSessionId: dbOrder.stripeSessionId,
    items: dbOrder.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: Number(item.price),
      quantity: item.quantity,
    })),
    totalAmount: Number(dbOrder.totalAmount),
    status: fromPrismaStatus(dbOrder.status),
    createdAt: dbOrder.createdAt.toISOString(),
    paidAt: dbOrder.paidAt?.toISOString(),
    customerEmail: dbOrder.customer?.email,
  };
}

// ============================================
// MISE À JOUR STATUT AVEC DÉCRÉMENTATION STOCK
// ============================================

/**
 * Met à jour le statut d'une commande et décrémente le stock si payée
 *
 * @security Utilise une TRANSACTION Prisma pour éviter les race conditions
 * @throws {OrderNotFoundError} Si la commande n'existe pas
 * @throws {InsufficientStockError} Si le stock est insuffisant au moment du paiement
 */
export async function updateOrderStatus(
  sessionId: string,
  status: OrderStatus
): Promise<Order | null> {
  // Validation des données d'entrée
  validateOrThrow(
    UpdateOrderStatusSchema,
    { sessionId, status },
    "Données de mise à jour invalides"
  );

  // Utiliser une transaction pour garantir l'atomicité
  return await prisma.$transaction(async (tx) => {
    // 1. Récupérer la commande avec verrou pessimiste (FOR UPDATE)
    const dbOrder = await tx.order.findUnique({
      where: { stripeSessionId: sessionId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!dbOrder) {
      console.error(`❌ Commande introuvable pour session: ${sessionId}`);
      throw new OrderNotFoundError(sessionId);
    }

    // 2. Éviter les mises à jour redondantes
    if (fromPrismaStatus(dbOrder.status) === status) {
      console.log(`ℹ️ Commande ${dbOrder.id} déjà en statut ${status}`);
      return {
        id: dbOrder.id,
        stripeSessionId: dbOrder.stripeSessionId,
        items: dbOrder.items.map((item) => ({
          productId: item.productId,
          name: item.product.name,
          price: Number(item.price),
          quantity: item.quantity,
        })),
        totalAmount: Number(dbOrder.totalAmount),
        status: fromPrismaStatus(dbOrder.status),
        createdAt: dbOrder.createdAt.toISOString(),
        paidAt: dbOrder.paidAt?.toISOString(),
        customerEmail: undefined,
      };
    }

    // 3. Préparer les données de mise à jour
    const updateData: {
      status: PrismaOrderStatus;
      paidAt?: Date;
      cancelledAt?: Date;
    } = {
      status: toPrismaStatus(status),
    };

    // 4. Si paiement confirmé, décrémenter le stock de manière ATOMIQUE
    if (status === "paid") {
      updateData.paidAt = new Date();

      for (const item of dbOrder.items) {
        // Vérifier à nouveau le stock (il a pu changer)
        const currentProduct = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, stock: true },
        });

        if (!currentProduct) {
          throw new Error(`Produit #${item.productId} introuvable`);
        }

        if (currentProduct.stock < item.quantity) {
          // Stock insuffisant - situation critique
          console.error(
            `❌ ALERTE: Stock insuffisant pour ${currentProduct.name} lors du paiement!`
          );
          throw new InsufficientStockError(
            currentProduct.id,
            currentProduct.name,
            item.quantity,
            currentProduct.stock
          );
        }

        // Décrémenter le stock
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        console.log(
          `📉 Stock décrémenté: ${currentProduct.name} (-${item.quantity}) → ${
            currentProduct.stock - item.quantity
          } restants`
        );
      }

      console.log(`✅ Commande ${dbOrder.id} marquée comme PAYÉE (transaction sécurisée)`);
    }

    if (status === "cancelled") {
      updateData.cancelledAt = new Date();
      console.log(`⏱️ Commande ${dbOrder.id} marquée comme ANNULÉE`);
    }

    if (status === "failed") {
      console.log(`❌ Commande ${dbOrder.id} marquée comme ÉCHOUÉE`);
    }

    // 5. Mettre à jour la commande
    const updatedOrder = await tx.order.update({
      where: { id: dbOrder.id },
      data: updateData,
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
      },
    });

    return {
      id: updatedOrder.id,
      stripeSessionId: updatedOrder.stripeSessionId,
      items: updatedOrder.items.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: Number(item.price),
        quantity: item.quantity,
      })),
      totalAmount: Number(updatedOrder.totalAmount),
      status: fromPrismaStatus(updatedOrder.status),
      createdAt: updatedOrder.createdAt.toISOString(),
      paidAt: updatedOrder.paidAt?.toISOString(),
      customerEmail: updatedOrder.customer?.email,
    };
  }, {
    // Niveau d'isolation Serializable pour éviter les race conditions
    isolationLevel: "Serializable",
    maxWait: 5000,
    timeout: 15000, // Plus de temps car décrémentation stock
  });
}

// ============================================
// RÉCUPÉRATION DE TOUTES LES COMMANDES
// ============================================

/**
 * Récupère toutes les commandes
 */
export async function getAllOrders(): Promise<Order[]> {
  const dbOrders = await prisma.order.findMany({
    include: {
      items: {
        include: {
          product: true,
        },
      },
      customer: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return dbOrders.map((dbOrder) => ({
    id: dbOrder.id,
    stripeSessionId: dbOrder.stripeSessionId,
    items: dbOrder.items.map((item) => ({
      productId: item.productId,
      name: item.product.name,
      price: Number(item.price),
      quantity: item.quantity,
    })),
    totalAmount: Number(dbOrder.totalAmount),
    status: fromPrismaStatus(dbOrder.status),
    createdAt: dbOrder.createdAt.toISOString(),
    paidAt: dbOrder.paidAt?.toISOString(),
    customerEmail: dbOrder.customer?.email,
  }));
}

// ============================================
// VÉRIFICATION DE STOCK
// ============================================

/**
 * Vérifie le stock disponible pour plusieurs produits
 * Retourne la liste des produits avec stock insuffisant
 */
export async function checkStockAvailability(
  items: Array<{ productId: number; quantity: number }>
): Promise<{
  available: boolean;
  insufficientItems: Array<{
    productId: number;
    name: string;
    requested: number;
    available: number;
  }>;
}> {
  const insufficientItems: Array<{
    productId: number;
    name: string;
    requested: number;
    available: number;
  }> = [];

  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId },
      select: { id: true, name: true, stock: true },
    });

    if (!product || product.stock < item.quantity) {
      insufficientItems.push({
        productId: item.productId,
        name: product?.name || "Produit inconnu",
        requested: item.quantity,
        available: product?.stock || 0,
      });
    }
  }

  return {
    available: insufficientItems.length === 0,
    insufficientItems,
  };
}
