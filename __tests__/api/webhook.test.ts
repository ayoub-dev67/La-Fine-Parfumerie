/**
 * Tests pour l'API /api/webhook (Stripe webhooks)
 */

import { NextRequest } from "next/server";
import Stripe from "stripe";

// Mock des modules
jest.mock("@/lib/stripe", () => ({
  stripe: {
    webhooks: {
      constructEvent: jest.fn(),
    },
  },
}));

jest.mock("@/lib/prisma", () => ({
  prisma: {
    promoCode: {
      update: jest.fn(),
    },
    order: {
      findUnique: jest.fn(),
    },
  },
}));

jest.mock("@/lib/orders", () => ({
  updateOrderStatus: jest.fn(),
  InsufficientStockError: class InsufficientStockError extends Error {
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
      super("Stock insuffisant");
      this.productId = productId;
      this.productName = productName;
      this.requested = requested;
      this.available = available;
    }
  },
  OrderNotFoundError: class OrderNotFoundError extends Error {
    sessionId: string;
    constructor(sessionId: string) {
      super("Commande non trouvée");
      this.sessionId = sessionId;
    }
  },
}));

jest.mock("@/lib/email", () => ({
  sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
}));

import { POST } from "@/app/api/webhook/route";
import { stripe } from "@/lib/stripe";
import { updateOrderStatus, InsufficientStockError, OrderNotFoundError } from "@/lib/orders";
import { prisma } from "@/lib/prisma";
import { sendOrderConfirmation } from "@/lib/email";

describe("POST /api/webhook", () => {
  const mockWebhookSecret = "whsec_test_secret";

  beforeEach(() => {
    jest.clearAllMocks();
    process.env.STRIPE_WEBHOOK_SECRET = mockWebhookSecret;
  });

  afterEach(() => {
    delete process.env.STRIPE_WEBHOOK_SECRET;
  });

  const createRequest = (body: string, signature?: string) => {
    const headers = new Headers();
    if (signature) {
      headers.set("stripe-signature", signature);
    }
    return new NextRequest("http://localhost:3000/api/webhook", {
      method: "POST",
      body,
      headers,
    });
  };

  describe("Validation de la signature", () => {
    it("rejette les requetes sans signature", async () => {
      const request = createRequest("{}");
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Signature manquante");
    });

    it("rejette les signatures invalides", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockImplementation(() => {
        throw new Error("Signature invalide");
      });

      const request = createRequest("{}", "sig_invalid");
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Signature invalide");
    });

    it("rejette si STRIPE_WEBHOOK_SECRET n'est pas configure", async () => {
      delete process.env.STRIPE_WEBHOOK_SECRET;

      const request = createRequest("{}", "sig_test");
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe("Configuration webhook manquante");
    });
  });

  describe("checkout.session.completed", () => {
    const mockSession: Partial<Stripe.Checkout.Session> = {
      id: "cs_test_123",
      metadata: {
        userId: "user_123",
        promoCode: "",
      },
    };

    beforeEach(() => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: "checkout.session.completed",
        data: { object: mockSession },
      });

      (updateOrderStatus as jest.Mock).mockResolvedValue({
        id: "order_123",
        totalAmount: 150,
        items: [{ id: 1, quantity: 2 }],
      });

      (prisma.order.findUnique as jest.Mock).mockResolvedValue({
        id: "order_123",
        totalAmount: 150,
        createdAt: new Date(),
        user: { email: "test@example.com", name: "Test" },
        items: [
          {
            id: 1,
            quantity: 2,
            product: { name: "Parfum", brand: "Brand", volume: "100ml", price: 75 },
          },
        ],
      });
    });

    it("met a jour le statut de la commande en 'paid'", async () => {
      const request = createRequest("{}", "sig_valid");
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(updateOrderStatus).toHaveBeenCalledWith("cs_test_123", "paid");
    });

    it("envoie un email de confirmation", async () => {
      const request = createRequest("{}", "sig_valid");
      await POST(request);

      expect(sendOrderConfirmation).toHaveBeenCalled();
    });

    it("incremente le compteur du code promo utilise", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: "checkout.session.completed",
        data: {
          object: {
            ...mockSession,
            metadata: { userId: "user_123", promoCode: "PROMO10" },
          },
        },
      });

      const request = createRequest("{}", "sig_valid");
      await POST(request);

      expect(prisma.promoCode.update).toHaveBeenCalledWith({
        where: { code: "PROMO10" },
        data: { usedCount: { increment: 1 } },
      });
    });

    it("gere le cas ou la commande n'existe pas", async () => {
      (updateOrderStatus as jest.Mock).mockResolvedValue(null);

      const request = createRequest("{}", "sig_valid");
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });

  describe("checkout.session.expired", () => {
    beforeEach(() => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: "checkout.session.expired",
        data: { object: { id: "cs_expired_123" } },
      });
    });

    it("met a jour le statut en 'cancelled'", async () => {
      const request = createRequest("{}", "sig_valid");
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(updateOrderStatus).toHaveBeenCalledWith("cs_expired_123", "cancelled");
    });
  });

  describe("Gestion des erreurs", () => {
    beforeEach(() => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: "checkout.session.completed",
        data: { object: { id: "cs_test_123", metadata: {} } },
      });
    });

    it("gere l'erreur InsufficientStockError", async () => {
      (updateOrderStatus as jest.Mock).mockRejectedValue(
        new (InsufficientStockError as any)(1, "Parfum Test", 5, 2)
      );

      const request = createRequest("{}", "sig_valid");
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200); // 200 pour eviter retry Stripe
      expect(data.received).toBe(true);
      expect(data.warning).toContain("Stock insuffisant");
    });

    it("gere l'erreur OrderNotFoundError", async () => {
      (updateOrderStatus as jest.Mock).mockRejectedValue(
        new (OrderNotFoundError as any)("cs_not_found")
      );

      const request = createRequest("{}", "sig_valid");
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.warning).toContain("Commande non trouvée");
    });

    it("gere les erreurs generiques", async () => {
      (updateOrderStatus as jest.Mock).mockRejectedValue(
        new Error("Erreur base de données")
      );

      const request = createRequest("{}", "sig_valid");
      const response = await POST(request);

      expect(response.status).toBe(500);
    });
  });

  describe("Evenements non geres", () => {
    it("retourne 200 pour les evenements non geres", async () => {
      (stripe.webhooks.constructEvent as jest.Mock).mockReturnValue({
        type: "customer.created",
        data: { object: {} },
      });

      const request = createRequest("{}", "sig_valid");
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.received).toBe(true);
    });
  });
});
