/**
 * Tests pour l'API /api/checkout
 *
 * Note: Ces tests mockent les dependances externes (Stripe, Prisma, Auth)
 * pour tester la logique metier de maniere isolee.
 */

import { NextRequest } from "next/server";

// Mock des modules avant l'import de la route
jest.mock("@/lib/stripe", () => ({
  stripe: {
    checkout: {
      sessions: {
        create: jest.fn().mockResolvedValue({
          id: "cs_test_123",
          url: "https://checkout.stripe.com/pay/cs_test_123",
        }),
      },
    },
    coupons: {
      create: jest.fn().mockResolvedValue({
        id: "coupon_test_123",
      }),
    },
  },
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    promoCode: {
      findUnique: jest.fn(),
    },
    product: {
      findMany: jest.fn(),
    },
  },
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
}));

jest.mock("@/lib/orders", () => ({
  createOrder: jest.fn().mockResolvedValue({
    id: "order_test_123",
  }),
  checkStockAvailability: jest.fn().mockResolvedValue({
    available: true,
    insufficientItems: [],
  }),
}));

jest.mock("@/lib/rate-limit", () => ({
  checkRateLimit: jest.fn().mockReturnValue({
    allowed: true,
    remaining: 10,
    resetTime: Date.now() + 60000,
  }),
  getClientIP: jest.fn().mockReturnValue("127.0.0.1"),
  RATE_LIMIT_CONFIGS: {
    checkout: { windowMs: 60000, maxRequests: 5, keyPrefix: "checkout" },
  },
}));

// Import apres les mocks
import { POST } from "@/app/api/checkout/route";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { checkStockAvailability, createOrder } from "@/lib/orders";
import { checkRateLimit } from "@/lib/rate-limit";

describe("POST /api/checkout", () => {
  // Cart items complets selon CartItemSchema
  const validCartItems = [
    {
      id: 1,
      name: "Parfum Test",
      brand: "Brand Test",
      description: "Un parfum de luxe",
      price: 150,
      volume: "100ml",
      image: "https://example.com/image.jpg",
      category: "Niche",
      subcategory: null,
      stock: 10,
      notesTop: "Bergamote",
      notesHeart: "Rose",
      notesBase: "Musc",
      isFeatured: false,
      isNew: false,
      isBestSeller: false,
      quantity: 2,
    },
  ];

  const mockSession = {
    user: {
      id: "user_123",
      email: "test@example.com",
      name: "Test User",
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (auth as jest.Mock).mockResolvedValue(mockSession);
    (checkRateLimit as jest.Mock).mockReturnValue({
      allowed: true,
      remaining: 10,
      resetTime: Date.now() + 60000,
    });
    (checkStockAvailability as jest.Mock).mockResolvedValue({
      available: true,
      insufficientItems: [],
    });
  });

  describe("Authentification", () => {
    it("rejette les requetes non authentifiees avec 401", async () => {
      (auth as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartItems: validCartItems }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe("Authentification requise pour passer commande");
    });
  });

  describe("Rate Limiting", () => {
    it("rejette les requetes quand le rate limit est atteint", async () => {
      (checkRateLimit as jest.Mock).mockReturnValue({
        allowed: false,
        remaining: 0,
        retryAfter: 60,
        resetTime: Date.now() + 60000,
      });

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartItems: validCartItems }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(429);
      expect(data.error).toContain("Trop de requêtes");
      expect(response.headers.get("Retry-After")).toBe("60");
    });
  });

  describe("Validation des donnees", () => {
    it("rejette les requetes avec JSON invalide", async () => {
      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: "invalid json",
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("invalide");
    });

    it("rejette les requetes sans cartItems", async () => {
      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("invalides");
    });

    it("rejette les requetes avec un panier vide", async () => {
      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartItems: [] }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it("rejette les articles avec prix negatif", async () => {
      const invalidItems = [
        {
          id: 1,
          name: "Test",
          description: "Test",
          price: -100,
          quantity: 1,
          image: "https://example.com/image.jpg",
        },
      ];

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartItems: invalidItems }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it("rejette les articles avec quantite nulle", async () => {
      const invalidItems = [
        {
          id: 1,
          name: "Test",
          description: "Test",
          price: 100,
          quantity: 0,
          image: "https://example.com/image.jpg",
        },
      ];

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartItems: invalidItems }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe("Verification du stock", () => {
    it("rejette si le stock est insuffisant", async () => {
      (checkStockAvailability as jest.Mock).mockResolvedValue({
        available: false,
        insufficientItems: [
          { productId: 1, productName: "Parfum Test", requested: 2, available: 0 },
        ],
      });

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartItems: validCartItems }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(409);
      expect(data.error).toContain("Stock insuffisant");
      expect(data.insufficientItems).toHaveLength(1);
    });
  });

  describe("Codes promo", () => {
    it("applique un code promo valide en pourcentage", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "PROMO10",
        isActive: true,
        validFrom: new Date("2020-01-01"),
        validUntil: new Date("2099-12-31"),
        maxUses: 100,
        usedCount: 0,
        minPurchase: null,
        discountPercent: 10,
        discountAmount: null,
      });

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          cartItems: validCartItems,
          promoCode: "PROMO10",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBeDefined();
      expect(stripe.coupons.create).toHaveBeenCalled();
    });

    it("ignore un code promo invalide", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue(null);

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          cartItems: validCartItems,
          promoCode: "INVALID",
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(stripe.coupons.create).not.toHaveBeenCalled();
    });

    it("ignore un code promo expire", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "EXPIRED",
        isActive: true,
        validFrom: new Date("2020-01-01"),
        validUntil: new Date("2020-12-31"), // Expire
        maxUses: 100,
        usedCount: 0,
        minPurchase: null,
        discountPercent: 10,
        discountAmount: null,
      });

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({
          cartItems: validCartItems,
          promoCode: "EXPIRED",
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(stripe.coupons.create).not.toHaveBeenCalled();
    });
  });

  describe("Creation de session Stripe", () => {
    it("cree une session Stripe avec les bons parametres", async () => {
      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartItems: validCartItems }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.url).toBe("https://checkout.stripe.com/pay/cs_test_123");
      expect(data.orderId).toBe("order_test_123");

      expect(stripe.checkout.sessions.create).toHaveBeenCalledWith(
        expect.objectContaining({
          payment_method_types: ["card"],
          mode: "payment",
          customer_email: "test@example.com",
        })
      );
    });

    it("cree une commande avec les bonnes informations", async () => {
      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartItems: validCartItems }),
      });

      await POST(request);

      expect(createOrder).toHaveBeenCalledWith(
        "cs_test_123",
        expect.arrayContaining([
          expect.objectContaining({
            productId: 1,
            name: "Parfum Test",
            price: 150,
            quantity: 2,
          }),
        ]),
        300, // 150 * 2
        "test@example.com",
        "user_123",
        null, // pas de code promo
        0 // pas de remise
      );
    });
  });

  describe("Gestion des erreurs", () => {
    it("gere les erreurs Stripe", async () => {
      (stripe.checkout.sessions.create as jest.Mock).mockRejectedValue(
        new Error("Stripe error")
      );

      const request = new NextRequest("http://localhost:3000/api/checkout", {
        method: "POST",
        body: JSON.stringify({ cartItems: validCartItems }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toContain("Erreur");
    });
  });
});
