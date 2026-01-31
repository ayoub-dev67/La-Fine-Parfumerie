/**
 * HEALTH CHECK ENDPOINT
 * Pour monitoring et load balancers
 *
 * GET /api/health - Statut basique
 * GET /api/health?detailed=true - Statut détaillé avec checks DB/Stripe
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

interface ServiceCheck {
  status: "ok" | "error" | "warning";
  latency?: number;
  message?: string;
}

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  environment: string;
  uptime: number;
  checks?: {
    database: ServiceCheck;
    stripe?: ServiceCheck;
    memory: {
      used: number;
      total: number;
      percentage: number;
      unit: string;
    };
  };
}

// Temps de démarrage pour calculer l'uptime
const startTime = Date.now();

// Stripe client (lazy init)
let stripeClient: Stripe | null = null;

function getStripeClient(): Stripe | null {
  if (!process.env.STRIPE_SECRET_KEY) return null;
  if (!stripeClient) {
    stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2025-12-15.clover",
    });
  }
  return stripeClient;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const detailed = searchParams.get("detailed") === "true";

  const response: HealthStatus = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || "1.0.0",
    environment: process.env.NODE_ENV || "development",
    uptime: Math.floor((Date.now() - startTime) / 1000),
  };

  // Check détaillé si demandé
  if (detailed) {
    response.checks = {
      database: { status: "ok" },
      memory: {
        used: 0,
        total: 0,
        percentage: 0,
        unit: "MB",
      },
    };

    // Check base de données avec latence
    try {
      const dbStart = Date.now();
      await prisma.$queryRaw`SELECT 1`;
      response.checks.database = {
        status: "ok",
        latency: Date.now() - dbStart,
      };
    } catch (error) {
      response.checks.database = {
        status: "error",
        message: error instanceof Error ? error.message : "Database connection failed",
      };
      response.status = "degraded";
    }

    // Check Stripe (optionnel)
    const stripe = getStripeClient();
    if (stripe) {
      try {
        const stripeStart = Date.now();
        await stripe.balance.retrieve();
        response.checks.stripe = {
          status: "ok",
          latency: Date.now() - stripeStart,
        };
      } catch (error) {
        response.checks.stripe = {
          status: "warning",
          message: "Stripe API unreachable",
        };
        // Stripe down n'est pas critique pour le health check général
      }
    }

    // Check mémoire (Node.js)
    const memUsage = process.memoryUsage();
    const memPercentage = Math.round((memUsage.heapUsed / memUsage.heapTotal) * 100);
    response.checks.memory = {
      used: Math.round(memUsage.heapUsed / 1024 / 1024),
      total: Math.round(memUsage.heapTotal / 1024 / 1024),
      percentage: memPercentage,
      unit: "MB",
    };

    // Alerter si mémoire > 85%
    if (memPercentage > 85) {
      response.status = response.status === "healthy" ? "degraded" : response.status;
    }
  }

  // Status code basé sur la santé
  const statusCode = response.status === "healthy" ? 200 :
                     response.status === "degraded" ? 200 : 503;

  return NextResponse.json(response, {
    status: statusCode,
    headers: {
      "Cache-Control": "no-store, max-age=0",
      "X-Health-Status": response.status,
    },
  });
}

// HEAD pour les checks simples de load balancer
export async function HEAD() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return new NextResponse(null, {
      status: 200,
      headers: {
        "X-Health-Status": "healthy",
      },
    });
  } catch {
    return new NextResponse(null, {
      status: 503,
      headers: {
        "X-Health-Status": "unhealthy",
      },
    });
  }
}
