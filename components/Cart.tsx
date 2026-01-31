"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/lib/CartContext";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface CartProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Cart({ isOpen, onClose }: CartProps) {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getTotalPrice, clearCart } =
    useCart();

  const handleCheckout = () => {
    onClose();
    router.push("/checkout");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-noir/80 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Cart panel */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-noir border-l border-or/20 z-50 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-or/10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="font-serif text-2xl text-creme">Votre Panier</h2>
                  <p className="text-creme/40 text-xs mt-1">
                    {cart.length} article{cart.length !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={onClose}
                  aria-label="Fermer le panier"
                  className="w-10 h-10 border border-or/30 flex items-center justify-center text-creme hover:text-or hover:border-or transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Cart content */}
            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <div className="w-20 h-20 border border-or/20 flex items-center justify-center mb-6">
                    <svg
                      className="w-10 h-10 text-or/30"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  </div>
                  <p className="text-creme/50 font-serif text-lg mb-2">
                    Votre panier est vide
                  </p>
                  <p className="text-creme/30 text-sm mb-8">
                    Découvrez notre collection de parfums d&apos;exception
                  </p>
                  <button
                    onClick={onClose}
                    className="btn-luxury-outline text-sm"
                  >
                    Continuer mes achats
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-4 pb-6 border-b border-or/10"
                    >
                      {/* Image */}
                      <div className="relative h-24 w-20 flex-shrink-0 bg-noir-50 overflow-hidden">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        {item.brand && (
                          <span className="text-or text-[10px] font-sans tracking-[0.15em] uppercase">
                            {item.brand}
                          </span>
                        )}
                        <h3 className="font-serif text-creme text-sm truncate">
                          {item.name}
                        </h3>
                        {item.volume && (
                          <p className="text-creme/40 text-xs mt-0.5">
                            {item.volume}
                          </p>
                        )}

                        {/* Quantity controls */}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center border border-or/20">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1)
                              }
                              aria-label="Diminuer la quantité"
                              className="w-8 h-8 flex items-center justify-center text-creme hover:text-or hover:bg-or/10 transition-colors"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-10 text-center text-creme text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1)
                              }
                              disabled={item.quantity >= item.stock}
                              aria-label="Augmenter la quantité"
                              className="w-8 h-8 flex items-center justify-center text-creme hover:text-or hover:bg-or/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>

                          <button
                            onClick={() => removeFromCart(item.id)}
                            aria-label="Supprimer l'article"
                            className="text-creme/40 hover:text-red-400 transition-colors ml-auto"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {/* Price */}
                      <div className="text-right">
                        <p className="font-serif text-creme">
                          {(Number(item.price) * item.quantity).toFixed(2)} €
                        </p>
                        {item.quantity > 1 && (
                          <p className="text-creme/40 text-xs mt-1">
                            {Number(item.price).toFixed(2)} € / unité
                          </p>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-or/10 bg-noir-50">
                {/* Subtotal */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-creme/60 text-sm">Sous-total</span>
                  <span className="text-creme font-serif">
                    {getTotalPrice().toFixed(2)} €
                  </span>
                </div>

                {/* Shipping info */}
                <div className="flex justify-between items-center mb-6">
                  <span className="text-creme/60 text-sm">Livraison</span>
                  <span className="text-creme/60 text-sm">
                    {getTotalPrice() >= 100 ? (
                      <span className="text-green-500">Offerte</span>
                    ) : (
                      "Calculée au checkout"
                    )}
                  </span>
                </div>

                {/* Total */}
                <div className="flex justify-between items-center mb-6 pt-4 border-t border-or/10">
                  <span className="font-serif text-lg text-creme">Total</span>
                  <span className="font-serif text-2xl text-or">
                    {getTotalPrice().toFixed(2)} €
                  </span>
                </div>

                {/* Actions */}
                <button
                  onClick={handleCheckout}
                  className="w-full btn-luxury mb-3"
                >
                  Passer commande
                </button>

                <button
                  onClick={clearCart}
                  className="w-full text-creme/40 text-xs hover:text-creme/60 transition-colors py-2"
                >
                  Vider le panier
                </button>

                {/* Free shipping reminder */}
                {getTotalPrice() < 100 && (
                  <p className="text-center text-creme/40 text-xs mt-4">
                    Plus que {(100 - getTotalPrice()).toFixed(2)} € pour la livraison gratuite
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
