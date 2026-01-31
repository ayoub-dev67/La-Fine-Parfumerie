import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createOrder, checkStockAvailability } from "@/lib/orders";
import { CheckoutRequestSchema, validateData } from "@/lib/validations";
import {
  checkRateLimit,
  getClientIP,
  RATE_LIMIT_CONFIGS,
} from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * API Route pour créer une session Stripe Checkout
 * POST /api/checkout
 *
 * @security
 * - Authentification requise (NextAuth)
 * - Validation stricte avec Zod (schémas centralisés)
 * - Recalcul du montant total (jamais faire confiance au client)
 * - Vérification du stock AVANT création de session
 * - Transactions Prisma pour éviter les race conditions
 */
export async function POST(request: NextRequest) {
  // 0a. Vérification de l'authentification
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json(
      { error: "Authentification requise pour passer commande" },
      { status: 401 }
    );
  }

  const userId = session.user.id;
  const userEmail = session.user.email;

  // 0b. Rate Limiting - Protection contre les abus
  const clientIP = getClientIP(request);
  const rateLimitResult = checkRateLimit(clientIP, RATE_LIMIT_CONFIGS.checkout);

  if (!rateLimitResult.allowed) {
    console.warn(`⚠️ Rate limit atteint pour IP: ${clientIP}`);
    return NextResponse.json(
      {
        error: "Trop de requêtes. Veuillez réessayer dans quelques instants.",
        retryAfter: rateLimitResult.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimitResult.retryAfter),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(rateLimitResult.resetTime),
        },
      }
    );
  }

  try {
    // 1. Récupération du body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Corps de requête invalide (JSON malformé)" },
        { status: 400 }
      );
    }

    // 2. Validation stricte avec Zod
    const validation = validateData(CheckoutRequestSchema, body);
    if (!validation.success) {
      console.warn(`⚠️ Validation checkout échouée: ${validation.error}`);
      return NextResponse.json(
        { error: "Données du panier invalides", details: validation.error },
        { status: 400 }
      );
    }

    const { cartItems, promoCode, discountAmount: clientDiscountAmount } = validation.data;

    // 3. Vérification du stock AVANT de créer la session Stripe
    const stockCheck = await checkStockAvailability(
      cartItems.map((item) => ({ productId: item.id, quantity: item.quantity }))
    );

    if (!stockCheck.available) {
      console.warn(`⚠️ Stock insuffisant pour checkout:`, stockCheck.insufficientItems);
      return NextResponse.json(
        {
          error: "Stock insuffisant pour certains articles",
          insufficientItems: stockCheck.insufficientItems,
        },
        { status: 409 } // Conflict
      );
    }

    // Calcul du montant total côté serveur
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    // 4. Validation du code promo côté serveur (si fourni)
    let validatedPromoCode: string | null = null;
    let validatedDiscount = 0;

    if (promoCode) {
      const promoCodeRecord = await prisma.promoCode.findUnique({
        where: { code: promoCode.toUpperCase() },
      });

      if (promoCodeRecord && promoCodeRecord.isActive) {
        const now = new Date();
        const isValidPeriod =
          promoCodeRecord.validFrom <= now &&
          (!promoCodeRecord.validUntil || promoCodeRecord.validUntil >= now);
        const hasUsesLeft =
          promoCodeRecord.maxUses === null ||
          promoCodeRecord.usedCount < promoCodeRecord.maxUses;
        const meetsMinPurchase =
          promoCodeRecord.minPurchase === null ||
          subtotal >= promoCodeRecord.minPurchase;

        if (isValidPeriod && hasUsesLeft && meetsMinPurchase) {
          validatedPromoCode = promoCodeRecord.code;

          if (promoCodeRecord.discountPercent) {
            validatedDiscount = (subtotal * promoCodeRecord.discountPercent) / 100;
          } else if (promoCodeRecord.discountAmount) {
            validatedDiscount = promoCodeRecord.discountAmount;
          }

          // La réduction ne peut pas dépasser le sous-total
          validatedDiscount = Math.min(validatedDiscount, subtotal);
          validatedDiscount = Math.round(validatedDiscount * 100) / 100;

          console.log(`🏷️ Code promo validé: ${validatedPromoCode} (-${validatedDiscount}€)`);
        }
      }
    }

    const totalAmount = subtotal - validatedDiscount;

    // Création des line items pour Stripe
    const lineItems = cartItems.map((item) => ({
      price_data: {
        currency: "eur",
        product_data: {
          name: item.name,
          description: item.description,
          images: [item.image],
        },
        // Prix en centimes (Stripe utilise les plus petites unités)
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Créer un coupon Stripe si code promo valide
    let stripeCouponId: string | undefined;
    if (validatedDiscount > 0 && validatedPromoCode) {
      const coupon = await stripe.coupons.create({
        amount_off: Math.round(validatedDiscount * 100),
        currency: "eur",
        name: `Code promo ${validatedPromoCode}`,
        max_redemptions: 1,
        redeem_by: Math.floor(Date.now() / 1000) + 3600, // Expire dans 1h
      });
      stripeCouponId = coupon.id;
      console.log(`🎟️ Coupon Stripe créé: ${coupon.id} (-${validatedDiscount}€)`);
    }

    // URLs de redirection
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    // Création de la session Stripe Checkout
    const stripeSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${baseUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cancel`,
      // Email pré-rempli pour l'utilisateur connecté
      customer_email: userEmail,
      // Appliquer le coupon si disponible
      ...(stripeCouponId && {
        discounts: [{ coupon: stripeCouponId }],
      }),
      // Métadonnées pour retrouver la commande plus tard
      metadata: {
        orderDate: new Date().toISOString(),
        itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
        userId: userId,
        promoCode: validatedPromoCode || "",
        discountAmount: String(validatedDiscount),
      },
    });

    // Création de la commande en statut "pending"
    const orderItems = cartItems.map((item) => ({
      productId: item.id,
      name: item.name,
      price: item.price,
      quantity: item.quantity,
    }));

    const order = await createOrder(
      stripeSession.id,
      orderItems,
      totalAmount,
      userEmail,
      userId,
      validatedPromoCode,
      validatedDiscount
    );

    console.log(`📦 Commande ${order.id} créée pour session ${stripeSession.id} (user: ${userId})`);

    // Retour de l'URL de checkout + order ID
    return NextResponse.json({
      url: stripeSession.url,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la session Stripe:", error);

    return NextResponse.json(
      {
        error: "Erreur lors de la création de la session de paiement",
        details: error instanceof Error ? error.message : "Erreur inconnue",
      },
      { status: 500 }
    );
  }
}
