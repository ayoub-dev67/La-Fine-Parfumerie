/**
 * Tests pour le module rate-limit
 */

// Creer un mock complet avant l'import
const mockCache = new Map<string, { count: number; resetTime: number }>();

jest.mock("lru-cache", () => ({
  LRUCache: jest.fn().mockImplementation(() => ({
    get: (key: string) => mockCache.get(key),
    set: (key: string, value: { count: number; resetTime: number }) =>
      mockCache.set(key, value),
    delete: (key: string) => mockCache.delete(key),
    clear: () => mockCache.clear(),
  })),
}));

import { checkRateLimit, getClientIP, RATE_LIMIT_CONFIGS } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

describe("Rate Limit Module", () => {
  beforeEach(() => {
    mockCache.clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("getClientIP", () => {
    it("extrait l'IP du header x-forwarded-for", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.1, 10.0.0.1");

      const request = new NextRequest("http://localhost/api/test", { headers });
      const ip = getClientIP(request);

      expect(ip).toBe("192.168.1.1");
    });

    it("extrait l'IP du header x-real-ip", () => {
      const headers = new Headers();
      headers.set("x-real-ip", "192.168.1.2");

      const request = new NextRequest("http://localhost/api/test", { headers });
      const ip = getClientIP(request);

      expect(ip).toBe("192.168.1.2");
    });

    it("retourne une IP par defaut si aucun header", () => {
      const request = new NextRequest("http://localhost/api/test");
      const ip = getClientIP(request);

      expect(ip).toBe("unknown");
    });

    it("prefere x-forwarded-for sur x-real-ip", () => {
      const headers = new Headers();
      headers.set("x-forwarded-for", "192.168.1.1");
      headers.set("x-real-ip", "192.168.1.2");

      const request = new NextRequest("http://localhost/api/test", { headers });
      const ip = getClientIP(request);

      expect(ip).toBe("192.168.1.1");
    });
  });

  describe("checkRateLimit", () => {
    const testConfig = {
      windowMs: 60000, // 1 minute
      maxRequests: 5,
      keyPrefix: "test",
    };

    it("autorise les premieres requetes", () => {
      const result = checkRateLimit("192.168.1.1", testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("decremente le compteur restant", () => {
      checkRateLimit("192.168.1.1", testConfig);
      checkRateLimit("192.168.1.1", testConfig);
      const result = checkRateLimit("192.168.1.1", testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(2);
    });

    it("bloque apres avoir atteint la limite", () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit("192.168.1.1", testConfig);
      }

      const result = checkRateLimit("192.168.1.1", testConfig);

      expect(result.allowed).toBe(false);
      expect(result.remaining).toBe(0);
    });

    it("isole les IPs differentes", () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit("192.168.1.1", testConfig);
      }

      const result1 = checkRateLimit("192.168.1.1", testConfig);
      const result2 = checkRateLimit("192.168.1.2", testConfig);

      expect(result1.allowed).toBe(false);
      expect(result2.allowed).toBe(true);
    });

    it("reset apres la fenetre de temps", () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit("192.168.1.1", testConfig);
      }

      // Avancer le temps au-dela de la fenetre
      jest.advanceTimersByTime(61000);

      const result = checkRateLimit("192.168.1.1", testConfig);

      expect(result.allowed).toBe(true);
      expect(result.remaining).toBe(4);
    });

    it("retourne le temps de retry correct", () => {
      for (let i = 0; i < 5; i++) {
        checkRateLimit("192.168.1.1", testConfig);
      }

      const result = checkRateLimit("192.168.1.1", testConfig);

      expect(result.retryAfter).toBeDefined();
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.retryAfter).toBeLessThanOrEqual(60);
    });

    it("retourne le resetTime", () => {
      const result = checkRateLimit("192.168.1.1", testConfig);

      expect(result.resetTime).toBeDefined();
      expect(result.resetTime).toBeGreaterThan(Date.now());
    });
  });

  describe("RATE_LIMIT_CONFIGS", () => {
    it("a une config pour l'API generale", () => {
      expect(RATE_LIMIT_CONFIGS.api).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.api.maxRequests).toBeGreaterThan(0);
    });

    it("a une config stricte pour l'auth", () => {
      expect(RATE_LIMIT_CONFIGS.auth).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.auth.maxRequests).toBeLessThan(
        RATE_LIMIT_CONFIGS.api.maxRequests
      );
    });

    it("a une config pour le checkout", () => {
      expect(RATE_LIMIT_CONFIGS.checkout).toBeDefined();
    });

    it("a une config pour la recherche", () => {
      expect(RATE_LIMIT_CONFIGS.search).toBeDefined();
    });

    it("a une config plus permissive pour l'admin", () => {
      expect(RATE_LIMIT_CONFIGS.admin).toBeDefined();
      expect(RATE_LIMIT_CONFIGS.admin.maxRequests).toBeGreaterThanOrEqual(
        RATE_LIMIT_CONFIGS.api.maxRequests
      );
    });
  });
});
