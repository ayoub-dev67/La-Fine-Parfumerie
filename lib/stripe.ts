/**
 * Configuration Stripe côté serveur
 * ⚠️ Ce fichier ne doit JAMAIS être importé côté client
 */

import Stripe from "stripe";

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error(
    "La variable d'environnement STRIPE_SECRET_KEY est manquante. " +
    "Créez un fichier .env.local avec vos clés Stripe de test."
  );
}

/**
 * Instance Stripe configurée avec la clé secrète
 * Utilisée uniquement côté serveur (API routes)
 */
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-12-15.clover",
  typescript: true,
});
