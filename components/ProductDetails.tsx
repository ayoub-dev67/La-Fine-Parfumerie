"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { useCart } from "@/lib/CartContext";
import { useWishlist } from "@/lib/WishlistContext";
import { ReviewSection } from "@/components/reviews";
import WishlistButton from "@/components/WishlistButton";

interface ProductDetailsProps {
  product: Product;
}

export default function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2500);
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-noir py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <motion.nav
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <ol className="flex items-center gap-2 text-sm">
            <li>
              <Link href="/" className="text-creme/50 hover:text-or transition-colors">
                Accueil
              </Link>
            </li>
            <li className="text-creme/30">/</li>
            <li>
              <Link href="/products" className="text-creme/50 hover:text-or transition-colors">
                Collection
              </Link>
            </li>
            <li className="text-creme/30">/</li>
            <li className="text-or">{product.name}</li>
          </ol>
        </motion.nav>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Image section */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative aspect-[3/4] bg-noir-50 overflow-hidden">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />

              {/* Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-2">
                {product.isNew && (
                  <span className="px-3 py-1 text-[10px] font-sans font-semibold tracking-wider uppercase bg-or text-noir">
                    Nouveau
                  </span>
                )}
                {product.isBestSeller && (
                  <span className="px-3 py-1 text-[10px] font-sans font-semibold tracking-wider uppercase bg-creme text-noir">
                    Best-seller
                  </span>
                )}
              </div>
            </div>

            {/* Decorative corners */}
            <div className="absolute -top-3 -left-3 w-16 h-16 border-t border-l border-or/30" />
            <div className="absolute -bottom-3 -right-3 w-16 h-16 border-b border-r border-or/30" />
          </motion.div>

          {/* Product info section */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col"
          >
            {/* Brand & Category */}
            <div className="mb-4">
              {product.brand && (
                <span className="text-or text-xs font-sans tracking-[0.2em] uppercase">
                  {product.brand}
                </span>
              )}
              <span className="text-creme/30 text-xs mx-3">|</span>
              <span className="text-creme/50 text-xs font-sans tracking-wider uppercase">
                {product.category}
              </span>
            </div>

            {/* Name */}
            <h1 className="font-serif text-4xl md:text-5xl text-creme mb-2">
              {product.name}
            </h1>

            {/* Volume */}
            {product.volume && (
              <p className="text-creme/50 text-sm mb-6">{product.volume}</p>
            )}

            {/* Price */}
            <div className="mb-8">
              <span className="font-serif text-4xl text-or">
                {Number(product.price).toFixed(2)} €
              </span>
            </div>

            {/* Divider */}
            <div className="w-16 h-px bg-or/30 mb-8" />

            {/* Description */}
            <div className="mb-8">
              <p className="text-creme/70 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Olfactory notes */}
            {(product.notesTop || product.notesHeart || product.notesBase) && (
              <div className="mb-8 p-6 bg-noir-50 border border-or/10">
                <h3 className="font-serif text-lg text-creme mb-4">
                  Pyramide Olfactive
                </h3>
                <div className="space-y-4">
                  {product.notesTop && (
                    <div>
                      <span className="text-or text-xs font-sans tracking-wider uppercase">
                        Notes de tête
                      </span>
                      <p className="text-creme/60 text-sm mt-1">
                        {product.notesTop}
                      </p>
                    </div>
                  )}
                  {product.notesHeart && (
                    <div>
                      <span className="text-or text-xs font-sans tracking-wider uppercase">
                        Notes de coeur
                      </span>
                      <p className="text-creme/60 text-sm mt-1">
                        {product.notesHeart}
                      </p>
                    </div>
                  )}
                  {product.notesBase && (
                    <div>
                      <span className="text-or text-xs font-sans tracking-wider uppercase">
                        Notes de fond
                      </span>
                      <p className="text-creme/60 text-sm mt-1">
                        {product.notesBase}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stock status */}
            <div className="mb-6">
              {product.stock > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-green-500 text-sm">
                    En stock ({product.stock} disponible{product.stock > 1 ? "s" : ""})
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span className="text-red-400 text-sm">Rupture de stock</span>
                </div>
              )}
            </div>

            {/* Quantity selector */}
            {product.stock > 0 && (
              <div className="mb-6">
                <label className="text-creme/60 text-xs tracking-wider uppercase mb-3 block">
                  Quantité
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-or/30">
                    <button
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                      aria-label="Diminuer la quantité"
                      className="w-12 h-12 flex items-center justify-center text-creme hover:text-or hover:bg-or/10 transition-colors disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                      </svg>
                    </button>
                    <span className="w-16 text-center text-creme font-serif text-xl">
                      {quantity}
                    </span>
                    <button
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                      aria-label="Augmenter la quantité"
                      className="w-12 h-12 flex items-center justify-center text-creme hover:text-or hover:bg-or/10 transition-colors disabled:opacity-30"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Add to cart + Wishlist buttons */}
            <div className="flex gap-4 mb-8">
              <motion.button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex-1 py-4 text-sm font-sans font-semibold tracking-wider uppercase transition-all duration-300 ${
                  addedToCart
                    ? "bg-green-600 text-white"
                    : product.stock === 0
                    ? "bg-noir-100 text-creme/30 cursor-not-allowed"
                    : "btn-luxury"
                }`}
                whileTap={{ scale: 0.98 }}
              >
                {addedToCart ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Ajoute au panier
                  </span>
                ) : product.stock === 0 ? (
                  "Indisponible"
                ) : (
                  "Ajouter au panier"
                )}
              </motion.button>

              {/* Bouton favoris */}
              <WishlistButton productId={product.id} size="lg" showTooltip={false} />
            </div>

            {/* Services */}
            <div className="border-t border-or/10 pt-8 space-y-4">
              {[
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  ),
                  title: "Livraison gratuite dès 100€",
                  subtitle: "Expédition sous 24h",
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  ),
                  title: "Authenticité garantie",
                  subtitle: "100% produits originaux",
                },
                {
                  icon: (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                    </svg>
                  ),
                  title: "Retour sous 14 jours",
                  subtitle: "Produit non ouvert",
                },
              ].map((service, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="w-10 h-10 border border-or/20 flex items-center justify-center text-or">
                    {service.icon}
                  </div>
                  <div>
                    <p className="text-creme text-sm">{service.title}</p>
                    <p className="text-creme/40 text-xs">{service.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Section Avis Clients */}
      <ReviewSection productId={product.id} />
    </div>
  );
}
