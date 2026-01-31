"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Product } from "@/types";
import { useCart } from "@/lib/CartContext";
import { useQuickView } from "@/lib/QuickViewContext";
import { useCompare } from "@/lib/CompareContext";
import WishlistButton from "@/components/WishlistButton";

interface ProductCardProps {
  product: Product;
  index?: number;
}

/**
 * Carte produit luxe La Fine Parfumerie
 * Design noir/or avec animations Framer Motion
 */
export default function ProductCard({ product, index = 0 }: ProductCardProps) {
  const { addToCart } = useCart();
  const { openQuickView } = useQuickView();
  const { addToCompare, isInCompare, canAddMore } = useCompare();

  // Animation variants pour l'entrée
  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        delay: index * 0.1,
        ease: [0.25, 0.46, 0.45, 0.94] as const,
      },
    },
  };

  // Déterminer les badges à afficher
  const badges = [];
  if (product.isNew) badges.push({ label: "Nouveau", type: "new" });
  if (product.isBestSeller) badges.push({ label: "Best-seller", type: "best" });
  if (product.isFeatured) badges.push({ label: "Coup de coeur", type: "featured" });

  return (
    <motion.article
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="group relative bg-noir-50 overflow-hidden"
      aria-label={`${product.name}${product.brand ? ` par ${product.brand}` : ''}`}
    >
      {/* Badges */}
      {badges.length > 0 && (
        <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
          {badges.map((badge) => (
            <span
              key={badge.type}
              className={`
                px-3 py-1 text-[10px] font-sans font-semibold tracking-wider uppercase
                ${badge.type === "new" ? "bg-or text-noir" : ""}
                ${badge.type === "best" ? "bg-creme text-noir" : ""}
                ${badge.type === "featured" ? "bg-noir border border-or text-or" : ""}
              `}
            >
              {badge.label}
            </span>
          ))}
        </div>
      )}

      {/* Boutons d'action en haut à droite */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <WishlistButton productId={product.id} size="sm" />

        {/* Quick View button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            openQuickView(product);
          }}
          className="w-8 h-8 bg-noir/80 backdrop-blur-sm border border-or/30 rounded-full flex items-center justify-center text-creme hover:bg-or hover:text-noir transition-colors"
          aria-label="Aperçu rapide"
          title="Aperçu rapide"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </button>

        {/* Compare button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (!isInCompare(product.id) && canAddMore) {
              addToCompare(product);
            }
          }}
          disabled={isInCompare(product.id) || !canAddMore}
          className={`w-8 h-8 backdrop-blur-sm border rounded-full flex items-center justify-center transition-colors ${
            isInCompare(product.id)
              ? 'bg-or text-noir border-or'
              : canAddMore
                ? 'bg-noir/80 border-or/30 text-creme hover:bg-or hover:text-noir'
                : 'bg-noir/50 border-gray-600 text-gray-500 cursor-not-allowed'
          }`}
          aria-label={isInCompare(product.id) ? 'Déjà dans la comparaison' : 'Comparer'}
          title={isInCompare(product.id) ? 'Déjà dans la comparaison' : canAddMore ? 'Comparer' : 'Maximum atteint'}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </button>
      </div>

      {/* Image container avec overlay au hover */}
      <Link
        href={`/products/${product.id}`}
        className="relative block aspect-perfume overflow-hidden"
      >
        <Image
          src={product.image}
          alt={`${product.name}${product.brand ? ` - ${product.brand}` : ''}${product.volume ? ` ${product.volume}` : ''}`}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          loading="lazy"
        />

        {/* Overlay gradient permanent */}
        <div className="absolute inset-0 bg-gradient-to-t from-noir via-transparent to-transparent opacity-60" />

        {/* Overlay au hover */}
        <div className="absolute inset-0 bg-noir/40 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

        {/* Bouton quick add au hover */}
        <motion.button
          onClick={(e) => {
            e.preventDefault();
            if (product.stock > 0) addToCart(product);
          }}
          disabled={product.stock === 0}
          aria-label={product.stock > 0 ? `Ajouter ${product.name} au panier` : `${product.name} en rupture de stock`}
          className="absolute bottom-4 left-4 right-4 py-3 bg-or text-noir text-xs font-sans font-semibold tracking-wider uppercase
                     opacity-0 translate-y-4 group-hover:opacity-100 group-hover:translate-y-0
                     transition-all duration-300 ease-out
                     hover:bg-or-light
                     disabled:bg-noir-100 disabled:text-creme/50 disabled:cursor-not-allowed"
          whileTap={{ scale: 0.98 }}
        >
          {product.stock > 0 ? "Ajouter au panier" : "Rupture de stock"}
        </motion.button>
      </Link>

      {/* Infos produit */}
      <div className="p-5 space-y-3">
        {/* Marque */}
        {product.brand && (
          <span className="text-or text-[11px] font-sans font-medium tracking-[0.2em] uppercase">
            {product.brand}
          </span>
        )}

        {/* Nom du produit */}
        <Link href={`/products/${product.id}`}>
          <h3 className="font-serif text-lg text-creme leading-tight group-hover:text-or transition-colors duration-300">
            {product.name}
          </h3>
        </Link>

        {/* Volume si disponible */}
        {product.volume && (
          <span className="text-creme/50 text-xs font-sans">
            {product.volume}
          </span>
        )}

        {/* Notes olfactives - aperçu */}
        {product.notesTop && (
          <p className="text-creme/40 text-xs font-sans line-clamp-1">
            {product.notesTop}
          </p>
        )}

        {/* Prix et stock */}
        <div className="flex items-end justify-between pt-2 border-t border-noir-100">
          <div>
            <span className="text-2xl font-serif text-creme">
              {typeof product.price === 'number'
                ? product.price.toFixed(2)
                : Number(product.price).toFixed(2)} €
            </span>
          </div>

          {/* Indicateur de stock discret */}
          <div className="flex items-center gap-1.5">
            <span
              className={`w-1.5 h-1.5 rounded-full ${
                product.stock > 5 ? "bg-green-500" :
                product.stock > 0 ? "bg-or" : "bg-red-500"
              }`}
            />
            <span className="text-[10px] text-creme/40 font-sans">
              {product.stock > 5 ? "En stock" :
               product.stock > 0 ? `${product.stock} restant${product.stock > 1 ? 's' : ''}` :
               "Épuisé"}
            </span>
          </div>
        </div>
      </div>

      {/* Bordure dorée subtile au hover */}
      <div className="absolute inset-0 border border-or/0 group-hover:border-or/30 transition-colors duration-500 pointer-events-none" />
    </motion.article>
  );
}
