/**
 * SCHÉMAS DE VALIDATION ZOD
 * Validation stricte de toutes les entrées utilisateur
 *
 * @security Ce fichier est CRITIQUE pour la sécurité de l'application
 */

import { z } from "zod";

// ============================================
// CONSTANTES DE VALIDATION
// ============================================

export const VALIDATION_LIMITS = {
  QUANTITY_MIN: 1,
  QUANTITY_MAX: 100,
  PRICE_MIN: 0.01,
  PRICE_MAX: 100000,
  NAME_MAX_LENGTH: 200,
  DESCRIPTION_MAX_LENGTH: 5000,
  IMAGE_URL_MAX_LENGTH: 500,
} as const;

// ============================================
// SCHÉMA ARTICLE PANIER
// ============================================

export const CartItemSchema = z.object({
  id: z
    .number()
    .int("L'ID doit être un entier")
    .positive("L'ID doit être positif"),

  name: z
    .string()
    .min(1, "Le nom est requis")
    .max(VALIDATION_LIMITS.NAME_MAX_LENGTH, "Nom trop long"),

  brand: z
    .string()
    .max(VALIDATION_LIMITS.NAME_MAX_LENGTH)
    .nullable(),

  description: z
    .string()
    .max(VALIDATION_LIMITS.DESCRIPTION_MAX_LENGTH, "Description trop longue"),

  price: z
    .number()
    .min(VALIDATION_LIMITS.PRICE_MIN, "Prix invalide")
    .max(VALIDATION_LIMITS.PRICE_MAX, "Prix trop élevé"),

  volume: z
    .string()
    .max(50)
    .nullable(),

  image: z
    .string()
    .min(1, "Image requise")
    .max(VALIDATION_LIMITS.IMAGE_URL_MAX_LENGTH, "URL image trop longue"),

  category: z
    .string()
    .min(1, "Catégorie requise"),

  subcategory: z
    .string()
    .nullable(),

  stock: z
    .number()
    .int()
    .min(0, "Stock invalide"),

  notesTop: z.string().nullable(),
  notesHeart: z.string().nullable(),
  notesBase: z.string().nullable(),

  isFeatured: z.boolean(),
  isNew: z.boolean(),
  isBestSeller: z.boolean(),

  quantity: z
    .number()
    .int("La quantité doit être un entier")
    .min(VALIDATION_LIMITS.QUANTITY_MIN, "Quantité minimum: 1")
    .max(VALIDATION_LIMITS.QUANTITY_MAX, "Quantité maximum: 100"),
});

export type ValidatedCartItem = z.infer<typeof CartItemSchema>;

// ============================================
// SCHÉMA PANIER COMPLET
// ============================================

export const CartSchema = z.object({
  cartItems: z
    .array(CartItemSchema)
    .min(1, "Le panier ne peut pas être vide")
    .max(50, "Trop d'articles dans le panier"),
});

export type ValidatedCart = z.infer<typeof CartSchema>;

// ============================================
// SCHÉMA CHECKOUT REQUEST
// ============================================

export const CheckoutRequestSchema = z.object({
  cartItems: z
    .array(CartItemSchema)
    .min(1, "Le panier ne peut pas être vide")
    .max(50, "Trop d'articles dans le panier")
    .refine(
      (items) => {
        // Vérifier qu'il n'y a pas de doublons d'ID
        const ids = items.map((item) => item.id);
        return new Set(ids).size === ids.length;
      },
      { message: "Articles en double détectés" }
    ),
  // Code promo optionnel
  promoCode: z.string().max(50).nullable().optional(),
  discountAmount: z.number().min(0).max(100000).nullable().optional(),
});

export type ValidatedCheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

// ============================================
// SCHÉMA ORDER ITEM (pour création commande)
// ============================================

export const OrderItemSchema = z.object({
  productId: z
    .number()
    .int()
    .positive("ID produit invalide"),

  name: z
    .string()
    .min(1)
    .max(VALIDATION_LIMITS.NAME_MAX_LENGTH),

  price: z
    .number()
    .min(VALIDATION_LIMITS.PRICE_MIN)
    .max(VALIDATION_LIMITS.PRICE_MAX),

  quantity: z
    .number()
    .int()
    .min(VALIDATION_LIMITS.QUANTITY_MIN)
    .max(VALIDATION_LIMITS.QUANTITY_MAX),
});

export type ValidatedOrderItem = z.infer<typeof OrderItemSchema>;

// ============================================
// SCHÉMA CRÉATION COMMANDE
// ============================================

export const CreateOrderSchema = z.object({
  stripeSessionId: z
    .string()
    .min(1, "Session ID requis")
    .regex(/^cs_/, "Format session ID invalide"),

  items: z
    .array(OrderItemSchema)
    .min(1, "La commande doit contenir au moins un article"),

  totalAmount: z
    .number()
    .min(VALIDATION_LIMITS.PRICE_MIN)
    .max(VALIDATION_LIMITS.PRICE_MAX * 100), // Total peut être plus élevé
});

export type ValidatedCreateOrder = z.infer<typeof CreateOrderSchema>;

// ============================================
// SCHÉMA WEBHOOK STRIPE
// ============================================

export const StripeWebhookHeadersSchema = z.object({
  "stripe-signature": z.string().min(1, "Signature Stripe manquante"),
});

// ============================================
// SCHÉMA UPDATE ORDER STATUS
// ============================================

export const UpdateOrderStatusSchema = z.object({
  sessionId: z
    .string()
    .min(1)
    .regex(/^cs_/, "Format session ID invalide"),

  status: z.enum(["pending", "paid", "shipped", "delivered", "cancelled", "failed"], {
    message: "Statut invalide",
  }),
});

export type ValidatedUpdateOrderStatus = z.infer<typeof UpdateOrderStatusSchema>;

// ============================================
// FONCTION DE VALIDATION HELPER
// ============================================

/**
 * Valide des données avec un schéma Zod et retourne un résultat typé
 */
export function validateData<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  // Formater les erreurs de manière lisible
  const errors = result.error.issues
    .map((err) => `${err.path.join(".")}: ${err.message}`)
    .join(", ");

  return { success: false, error: errors };
}

/**
 * Valide et lance une erreur si invalide
 */
export function validateOrThrow<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  errorPrefix: string = "Validation error"
): T {
  const result = validateData(schema, data);

  if (!result.success) {
    throw new Error(`${errorPrefix}: ${result.error}`);
  }

  return result.data;
}

// ============================================
// SANITIZATION HELPERS
// ============================================

/**
 * Nettoie une chaîne de caractères potentiellement dangereuse
 */
export function sanitizeString(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Supprime les caractères HTML basiques
    .slice(0, 10000); // Limite la longueur
}

/**
 * Vérifie si un prix est valide après recalcul
 */
export function validatePriceIntegrity(
  items: ValidatedCartItem[],
  declaredTotal: number,
  tolerance: number = 0.01
): boolean {
  const calculatedTotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return Math.abs(calculatedTotal - declaredTotal) <= tolerance;
}

// ============================================
// SCHÉMAS AUTH
// ============================================

export const emailSchema = z
  .string()
  .email("Email invalide")
  .max(255, "Email trop long")
  .transform((v) => v.toLowerCase().trim());

export const passwordSchema = z
  .string()
  .min(8, "Minimum 8 caractères")
  .max(128, "Maximum 128 caractères")
  .regex(/[A-Z]/, "Au moins une majuscule requise")
  .regex(/[a-z]/, "Au moins une minuscule requise")
  .regex(/[0-9]/, "Au moins un chiffre requis");

export const RegisterSchema = z
  .object({
    name: z
      .string()
      .min(2, "Minimum 2 caractères")
      .max(100, "Maximum 100 caractères")
      .transform(sanitizeString),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export const LoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Mot de passe requis"),
});

export const ResetPasswordSchema = z
  .object({
    token: z.string().min(1, "Token requis"),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

// ============================================
// SCHÉMAS PRODUIT ADMIN
// ============================================

export const ProductSchema = z.object({
  name: z
    .string()
    .min(2, "Nom trop court")
    .max(200, "Nom trop long")
    .transform(sanitizeString),
  brand: z
    .string()
    .max(100, "Marque trop longue")
    .transform(sanitizeString)
    .nullable()
    .optional(),
  description: z
    .string()
    .min(10, "Description trop courte")
    .max(5000, "Description trop longue"),
  price: z
    .number()
    .positive("Le prix doit être positif")
    .max(99999.99, "Prix trop élevé"),
  stock: z.number().int().min(0, "Stock négatif non autorisé"),
  category: z.enum(["Signature", "Niche", "Femme", "Homme", "Coffret"]),
  volume: z.string().max(50).nullable().optional(),
  image: z.string().url("URL image invalide").optional(),
  notesTop: z.string().max(500).transform(sanitizeString).nullable().optional(),
  notesHeart: z.string().max(500).transform(sanitizeString).nullable().optional(),
  notesBase: z.string().max(500).transform(sanitizeString).nullable().optional(),
  isNew: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
});

// ============================================
// SCHÉMA RECHERCHE
// ============================================

export const SearchSchema = z.object({
  q: z
    .string()
    .min(1, "Recherche vide")
    .max(200, "Recherche trop longue")
    .transform(sanitizeString),
  category: z.string().optional(),
  minPrice: z.coerce.number().positive().optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(["price_asc", "price_desc", "name", "newest"]).optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

// ============================================
// SCHÉMA AVIS PRODUIT
// ============================================

export const ReviewSchema = z.object({
  productId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  title: z
    .string()
    .min(3, "Titre trop court")
    .max(100, "Titre trop long")
    .transform(sanitizeString),
  comment: z
    .string()
    .min(10, "Commentaire trop court")
    .max(2000, "Commentaire trop long")
    .transform(sanitizeString),
});

// ============================================
// SCHÉMA CONTACT
// ============================================

export const ContactSchema = z.object({
  name: z
    .string()
    .min(2, "Nom trop court")
    .max(100, "Nom trop long")
    .transform(sanitizeString),
  email: emailSchema,
  subject: z
    .string()
    .min(5, "Sujet trop court")
    .max(200, "Sujet trop long")
    .transform(sanitizeString),
  message: z
    .string()
    .min(20, "Message trop court")
    .max(5000, "Message trop long")
    .transform(sanitizeString),
});

// ============================================
// RESPONSE HELPERS
// ============================================

export type ValidationError = {
  field: string;
  message: string;
};

/**
 * Créé une réponse d'erreur de validation
 */
export function validationErrorResponse(error: string): Response {
  return new Response(
    JSON.stringify({
      error: "Validation Error",
      message: error,
    }),
    {
      status: 400,
      headers: { "Content-Type": "application/json" },
    }
  );
}
