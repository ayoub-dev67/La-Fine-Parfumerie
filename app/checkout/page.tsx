"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface PromoValidation {
  valid: boolean;
  code: string;
  discountType: "percent" | "fixed";
  discountPercent?: number;
  discountFixed?: number;
  discountAmount: number;
  newTotal: number;
  message: string;
}

/**
 * Page de checkout luxe avec système de code promo
 * Design noir/or La Fine Parfumerie
 */
export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getTotalPrice } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // État code promo
  const [promoCode, setPromoCode] = useState("");
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [appliedPromo, setAppliedPromo] = useState<PromoValidation | null>(null);

  const cartTotal = getTotalPrice();
  const finalTotal = appliedPromo ? appliedPromo.newTotal : cartTotal;

  // Redirection si panier vide
  if (cart.length === 0 && !isLoading) {
    return (
      <div className="min-h-screen bg-noir py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-noir-50 border border-or/20 flex items-center justify-center">
            <svg className="w-12 h-12 text-or/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <h1 className="font-serif text-3xl text-creme mb-4">Panier vide</h1>
          <p className="text-creme/60 mb-8">
            Votre panier est vide. Ajoutez des produits avant de passer commande.
          </p>
          <button
            onClick={() => router.push("/products")}
            className="btn-luxury px-8 py-3"
          >
            Decouvrir la collection
          </button>
        </div>
      </div>
    );
  }

  /**
   * Validation du code promo en temps réel
   */
  const handleValidatePromo = async () => {
    if (!promoCode.trim()) {
      setPromoError("Veuillez entrer un code promo");
      return;
    }

    setPromoLoading(true);
    setPromoError(null);

    try {
      const response = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCode.trim().toUpperCase(),
          cartTotal,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.valid) {
        setPromoError(data.error || "Code promo invalide");
        setAppliedPromo(null);
      } else {
        setAppliedPromo(data);
        setPromoError(null);
      }
    } catch {
      setPromoError("Erreur lors de la validation");
    } finally {
      setPromoLoading(false);
    }
  };

  /**
   * Supprimer le code promo appliqué
   */
  const handleRemovePromo = () => {
    setAppliedPromo(null);
    setPromoCode("");
    setPromoError(null);
  };

  /**
   * Lance le processus de paiement Stripe
   */
  const handleCheckout = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartItems: cart,
          promoCode: appliedPromo?.code || null,
          discountAmount: appliedPromo?.discountAmount || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la création de la session");
      }

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("URL de paiement non reçue");
      }
    } catch (err) {
      console.error("Erreur checkout:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer."
      );
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl text-creme mb-4">
            Finaliser la commande
          </h1>
          <div className="w-24 h-px bg-or/50 mx-auto" />
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Récapitulatif du panier */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <div className="bg-noir-50 border border-or/10 p-6">
              <h2 className="font-serif text-xl text-creme mb-6 flex items-center gap-3">
                <svg className="w-5 h-5 text-or" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Votre panier
              </h2>

              <div className="space-y-4">
                {cart.map((item, index) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.05 }}
                    className="flex gap-4 pb-4 border-b border-or/10 last:border-0"
                  >
                    <div className="relative h-24 w-20 flex-shrink-0 bg-noir overflow-hidden">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                        sizes="80px"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      {item.brand && (
                        <span className="text-or text-[10px] tracking-[0.2em] uppercase">
                          {item.brand}
                        </span>
                      )}
                      <h3 className="font-serif text-creme truncate">{item.name}</h3>
                      {item.volume && (
                        <p className="text-creme/50 text-xs">{item.volume}</p>
                      )}
                      <p className="text-creme/60 text-sm mt-1">
                        Quantite: {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="font-serif text-lg text-or">
                        {(item.price * item.quantity).toFixed(2)} €
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Section Code Promo */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-noir-50 border border-or/10 p-6 mt-6"
            >
              <h2 className="font-serif text-xl text-creme mb-4 flex items-center gap-3">
                <svg className="w-5 h-5 text-or" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                Code promo
              </h2>

              <AnimatePresence mode="wait">
                {appliedPromo ? (
                  <motion.div
                    key="applied"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center justify-between p-4 bg-green-900/20 border border-green-500/30 rounded"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-green-400 font-semibold">{appliedPromo.code}</p>
                        <p className="text-green-400/70 text-sm">{appliedPromo.message}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleRemovePromo}
                      className="text-creme/50 hover:text-red-400 transition-colors p-2"
                      aria-label="Supprimer le code promo"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="input"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-3"
                  >
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={promoCode}
                        onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                        onKeyDown={(e) => e.key === "Enter" && handleValidatePromo()}
                        placeholder="Entrez votre code"
                        className="flex-1 px-4 py-3 bg-noir border border-or/20 text-creme placeholder-creme/30
                                   focus:border-or/50 focus:outline-none transition-colors
                                   font-mono tracking-wider uppercase"
                      />
                      <button
                        onClick={handleValidatePromo}
                        disabled={promoLoading || !promoCode.trim()}
                        className="px-6 py-3 bg-or text-noir font-sans font-semibold text-sm tracking-wider uppercase
                                   hover:bg-or-light transition-colors disabled:bg-noir-100 disabled:text-creme/30"
                      >
                        {promoLoading ? (
                          <div className="w-5 h-5 border-2 border-noir/30 border-t-noir rounded-full animate-spin" />
                        ) : (
                          "Appliquer"
                        )}
                      </button>
                    </div>

                    <AnimatePresence>
                      {promoError && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          className="text-red-400 text-sm flex items-center gap-2"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {promoError}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Informations de test */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-noir-50 border border-or/10 p-6 mt-6"
            >
              <h3 className="font-semibold text-or mb-3 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Mode Test - Carte de demonstration
              </h3>
              <div className="grid grid-cols-2 gap-4 text-sm text-creme/70">
                <div>
                  <span className="text-creme/40">Numero:</span>
                  <span className="ml-2 font-mono">4242 4242 4242 4242</span>
                </div>
                <div>
                  <span className="text-creme/40">Expiration:</span>
                  <span className="ml-2 font-mono">12/34</span>
                </div>
                <div>
                  <span className="text-creme/40">CVC:</span>
                  <span className="ml-2 font-mono">123</span>
                </div>
                <div>
                  <span className="text-creme/40">Code postal:</span>
                  <span className="ml-2 font-mono">75001</span>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Sidebar - Total et paiement */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-1"
          >
            <div className="bg-noir-50 border border-or/20 p-6 sticky top-24">
              <h2 className="font-serif text-xl text-creme mb-6">Recapitulatif</h2>

              <div className="space-y-3 pb-4 border-b border-or/10">
                <div className="flex justify-between text-creme/70">
                  <span>Sous-total</span>
                  <span>{cartTotal.toFixed(2)} €</span>
                </div>

                <AnimatePresence>
                  {appliedPromo && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex justify-between text-green-400"
                    >
                      <span>Reduction ({appliedPromo.code})</span>
                      <span>-{appliedPromo.discountAmount.toFixed(2)} €</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="flex justify-between text-creme/70">
                  <span>Livraison</span>
                  <span className="text-green-400">Offerte</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-4 border-b border-or/10">
                <span className="font-serif text-lg text-creme">Total</span>
                <motion.span
                  key={finalTotal}
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  className="font-serif text-2xl text-or"
                >
                  {finalTotal.toFixed(2)} €
                </motion.span>
              </div>

              {/* Erreur */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded"
                  >
                    <p className="text-red-400 text-sm">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Boutons */}
              <div className="mt-6 space-y-3">
                <motion.button
                  onClick={handleCheckout}
                  disabled={isLoading || cart.length === 0}
                  className="w-full py-4 bg-or text-noir font-sans font-semibold text-sm tracking-wider uppercase
                             hover:bg-or-light transition-all disabled:bg-noir-100 disabled:text-creme/30 disabled:cursor-not-allowed"
                  whileTap={{ scale: 0.98 }}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-noir/30 border-t-noir rounded-full animate-spin" />
                      Redirection...
                    </span>
                  ) : (
                    "Proceder au paiement"
                  )}
                </motion.button>

                <button
                  onClick={() => router.push("/products")}
                  disabled={isLoading}
                  className="w-full py-3 border border-or/30 text-creme/70 font-sans text-sm tracking-wider uppercase
                             hover:border-or/50 hover:text-creme transition-colors disabled:opacity-50"
                >
                  Continuer mes achats
                </button>
              </div>

              {/* Garanties */}
              <div className="mt-6 pt-6 border-t border-or/10 space-y-3">
                {[
                  { icon: "🔒", text: "Paiement securise" },
                  { icon: "📦", text: "Livraison gratuite" },
                  { icon: "↩️", text: "Retour sous 14 jours" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-creme/50 text-xs">
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
