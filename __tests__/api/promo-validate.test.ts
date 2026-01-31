/**
 * Tests pour l'API /api/promo/validate
 */

import { NextRequest } from "next/server";

// Mock Prisma
jest.mock("@/lib/prisma", () => ({
  prisma: {
    promoCode: {
      findUnique: jest.fn(),
    },
  },
}));

import { POST } from "@/app/api/promo/validate/route";
import { prisma } from "@/lib/prisma";

describe("POST /api/promo/validate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const createRequest = (body: object) => {
    return new NextRequest("http://localhost:3000/api/promo/validate", {
      method: "POST",
      body: JSON.stringify(body),
    });
  };

  describe("Validation des donnees", () => {
    it("rejette les requetes sans code promo", async () => {
      const request = createRequest({ cartTotal: 100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Données invalides");
    });

    it("rejette les requetes sans cartTotal", async () => {
      const request = createRequest({ code: "PROMO" });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Données invalides");
    });

    it("rejette les cartTotal negatifs", async () => {
      const request = createRequest({ code: "PROMO", cartTotal: -100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });
  });

  describe("Code promo inexistant", () => {
    it("retourne 404 pour un code inexistant", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue(null);

      const request = createRequest({ code: "INEXISTANT", cartTotal: 100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe("Code promo invalide");
      expect(data.valid).toBe(false);
    });
  });

  describe("Code promo desactive", () => {
    it("rejette un code desactive", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "INACTIF",
        isActive: false,
        validFrom: new Date("2020-01-01"),
        validUntil: null,
        maxUses: null,
        usedCount: 0,
        minPurchase: null,
        discountPercent: 10,
        discountAmount: null,
      });

      const request = createRequest({ code: "INACTIF", cartTotal: 100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Ce code promo n'est plus actif");
      expect(data.valid).toBe(false);
    });
  });

  describe("Periode de validite", () => {
    it("rejette un code pas encore valide", async () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);

      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "FUTUR",
        isActive: true,
        validFrom: futureDate,
        validUntil: null,
        maxUses: null,
        usedCount: 0,
        minPurchase: null,
        discountPercent: 10,
        discountAmount: null,
      });

      const request = createRequest({ code: "FUTUR", cartTotal: 100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Ce code promo n'est pas encore valide");
    });

    it("rejette un code expire", async () => {
      const pastDate = new Date();
      pastDate.setFullYear(pastDate.getFullYear() - 1);

      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "EXPIRE",
        isActive: true,
        validFrom: new Date("2020-01-01"),
        validUntil: pastDate,
        maxUses: null,
        usedCount: 0,
        minPurchase: null,
        discountPercent: 10,
        discountAmount: null,
      });

      const request = createRequest({ code: "EXPIRE", cartTotal: 100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Ce code promo a expiré");
    });
  });

  describe("Limite d'utilisation", () => {
    it("rejette un code qui a atteint sa limite", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "LIMITE",
        isActive: true,
        validFrom: new Date("2020-01-01"),
        validUntil: null,
        maxUses: 100,
        usedCount: 100,
        minPurchase: null,
        discountPercent: 10,
        discountAmount: null,
      });

      const request = createRequest({ code: "LIMITE", cartTotal: 100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe("Ce code promo a atteint sa limite d'utilisation");
    });
  });

  describe("Montant minimum", () => {
    it("rejette si le panier est en dessous du minimum", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "MIN100",
        isActive: true,
        validFrom: new Date("2020-01-01"),
        validUntil: null,
        maxUses: null,
        usedCount: 0,
        minPurchase: 100,
        discountPercent: 10,
        discountAmount: null,
      });

      const request = createRequest({ code: "MIN100", cartTotal: 50 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toContain("Montant minimum requis");
      expect(data.minPurchase).toBe(100);
    });
  });

  describe("Calcul de la reduction", () => {
    it("calcule correctement une reduction en pourcentage", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "PROMO10",
        isActive: true,
        validFrom: new Date("2020-01-01"),
        validUntil: null,
        maxUses: null,
        usedCount: 0,
        minPurchase: null,
        discountPercent: 10,
        discountAmount: null,
      });

      const request = createRequest({ code: "PROMO10", cartTotal: 100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(true);
      expect(data.discountType).toBe("percent");
      expect(data.discountAmount).toBe(10);
      expect(data.newTotal).toBe(90);
    });

    it("calcule correctement une reduction fixe", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "MOINS20",
        isActive: true,
        validFrom: new Date("2020-01-01"),
        validUntil: null,
        maxUses: null,
        usedCount: 0,
        minPurchase: null,
        discountPercent: null,
        discountAmount: 20,
      });

      const request = createRequest({ code: "MOINS20", cartTotal: 100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(true);
      expect(data.discountType).toBe("fixed");
      expect(data.discountAmount).toBe(20);
      expect(data.newTotal).toBe(80);
    });

    it("ne depasse pas le total du panier", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "GROS",
        isActive: true,
        validFrom: new Date("2020-01-01"),
        validUntil: null,
        maxUses: null,
        usedCount: 0,
        minPurchase: null,
        discountPercent: null,
        discountAmount: 200, // Plus que le panier
      });

      const request = createRequest({ code: "GROS", cartTotal: 100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.discountAmount).toBe(100); // Plafonne au total
      expect(data.newTotal).toBe(0);
    });
  });

  describe("Format de la reponse", () => {
    it("retourne tous les champs attendus pour un code valide", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "TEST",
        isActive: true,
        validFrom: new Date("2020-01-01"),
        validUntil: null,
        maxUses: null,
        usedCount: 0,
        minPurchase: null,
        discountPercent: 15,
        discountAmount: null,
      });

      const request = createRequest({ code: "test", cartTotal: 200 });
      const response = await POST(request);
      const data = await response.json();

      expect(data).toHaveProperty("valid", true);
      expect(data).toHaveProperty("code", "TEST");
      expect(data).toHaveProperty("discountType", "percent");
      expect(data).toHaveProperty("discountPercent", 15);
      expect(data).toHaveProperty("discountAmount", 30);
      expect(data).toHaveProperty("newTotal", 170);
      expect(data).toHaveProperty("message");
    });
  });

  describe("Insensibilite a la casse", () => {
    it("accepte le code en minuscules", async () => {
      (prisma.promoCode.findUnique as jest.Mock).mockResolvedValue({
        code: "PROMO",
        isActive: true,
        validFrom: new Date("2020-01-01"),
        validUntil: null,
        maxUses: null,
        usedCount: 0,
        minPurchase: null,
        discountPercent: 10,
        discountAmount: null,
      });

      const request = createRequest({ code: "promo", cartTotal: 100 });
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.valid).toBe(true);

      // Verifie que Prisma a ete appele avec le code en majuscules
      expect(prisma.promoCode.findUnique).toHaveBeenCalledWith({
        where: { code: "PROMO" },
      });
    });
  });
});
