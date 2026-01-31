"use client";

import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/lib/WishlistContext";
import { useCart } from "@/lib/CartContext";
import { useSession } from "next-auth/react";
import WishlistButton from "@/components/WishlistButton";

export default function WishlistPage() {
  const { data: session } = useSession();
  const { items, count, isLoading } = useWishlist();
  const { addToCart } = useCart();

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: -100 },
  };

  return (
    <div className="min-h-screen bg-noir py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="font-serif text-4xl md:text-5xl text-creme mb-4">
            Mes Favoris
          </h1>
          <p className="text-creme/60 max-w-xl mx-auto">
            {count > 0
              ? `${count} parfum${count > 1 ? "s" : ""} dans votre liste de souhaits`
              : "Votre liste de souhaits est vide"}
          </p>

          {/* Message si non connecte */}
          {!session?.user && count > 0 && (
            <div className="mt-6 p-4 bg-or/10 border border-or/30 rounded max-w-md mx-auto">
              <p className="text-creme/80 text-sm">
                <Link href="/auth/signin" className="text-or hover:underline">
                  Connectez-vous
                </Link>{" "}
                pour sauvegarder vos favoris de maniere permanente.
              </p>
            </div>
          )}
        </motion.div>

        {/* Loading state */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-or/30 border-t-or rounded-full animate-spin" />
          </div>
        )}

        {/* Empty state */}
        {!isLoading && count === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-20"
          >
            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-noir-50 border border-or/20 flex items-center justify-center">
              <svg
                className="w-12 h-12 text-or/50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </div>
            <h2 className="font-serif text-2xl text-creme mb-4">
              Aucun favori pour le moment
            </h2>
            <p className="text-creme/60 mb-8 max-w-md mx-auto">
              Parcourez notre collection et ajoutez vos parfums preferes a votre
              liste de souhaits en cliquant sur le coeur.
            </p>
            <Link
              href="/products"
              className="inline-block px-8 py-3 bg-or text-noir font-sans font-semibold text-sm tracking-wider uppercase hover:bg-or-light transition-colors"
            >
              Decouvrir la collection
            </Link>
          </motion.div>
        )}

        {/* Wishlist items */}
        {!isLoading && count > 0 && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  exit="exit"
                  layout
                  className="group bg-noir-50 border border-or/10 overflow-hidden hover:border-or/30 transition-colors"
                >
                  {/* Image */}
                  <Link
                    href={`/products/${item.product.id}`}
                    className="relative block aspect-[3/4] overflow-hidden"
                  >
                    <Image
                      src={item.product.image}
                      alt={item.product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-noir/80 via-transparent to-transparent" />

                    {/* Badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-2">
                      {item.product.isNew && (
                        <span className="px-2 py-1 text-[10px] font-sans font-semibold tracking-wider uppercase bg-or text-noir">
                          Nouveau
                        </span>
                      )}
                      {item.product.isBestSeller && (
                        <span className="px-2 py-1 text-[10px] font-sans font-semibold tracking-wider uppercase bg-creme text-noir">
                          Best-seller
                        </span>
                      )}
                    </div>

                    {/* Remove button */}
                    <div className="absolute top-3 right-3">
                      <WishlistButton productId={item.product.id} size="sm" />
                    </div>
                  </Link>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    {item.product.brand && (
                      <span className="text-or text-[10px] font-sans tracking-[0.2em] uppercase">
                        {item.product.brand}
                      </span>
                    )}

                    <Link href={`/products/${item.product.id}`}>
                      <h3 className="font-serif text-lg text-creme group-hover:text-or transition-colors">
                        {item.product.name}
                      </h3>
                    </Link>

                    {item.product.volume && (
                      <p className="text-creme/50 text-xs">{item.product.volume}</p>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-or/10">
                      <span className="font-serif text-xl text-creme">
                        {item.product.price.toFixed(2)} €
                      </span>

                      {/* Stock indicator */}
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            item.product.stock > 0 ? "bg-green-500" : "bg-red-500"
                          }`}
                        />
                        <span className="text-[10px] text-creme/40">
                          {item.product.stock > 0 ? "En stock" : "Epuise"}
                        </span>
                      </div>
                    </div>

                    {/* Add to cart button */}
                    <motion.button
                      onClick={() => {
                        if (item.product.stock > 0) {
                          addToCart({
                            id: item.product.id,
                            name: item.product.name,
                            brand: item.product.brand || null,
                            price: item.product.price,
                            image: item.product.image,
                            volume: item.product.volume || null,
                            category: item.product.category,
                            stock: item.product.stock,
                            description: "",
                            subcategory: null,
                            notesTop: null,
                            notesHeart: null,
                            notesBase: null,
                            isFeatured: false,
                            isNew: false,
                            isBestSeller: false,
                          });
                        }
                      }}
                      disabled={item.product.stock === 0}
                      className="w-full mt-3 py-2.5 text-xs font-sans font-semibold tracking-wider uppercase
                                 bg-or text-noir hover:bg-or-light transition-colors
                                 disabled:bg-noir-100 disabled:text-creme/30 disabled:cursor-not-allowed"
                      whileTap={{ scale: 0.98 }}
                    >
                      {item.product.stock > 0 ? "Ajouter au panier" : "Indisponible"}
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Continue shopping */}
        {!isLoading && count > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center mt-12"
          >
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-or hover:text-or-light transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Continuer mes achats
            </Link>
          </motion.div>
        )}
      </div>
    </div>
  );
}
