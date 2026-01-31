"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWishlist } from "@/lib/WishlistContext";

interface WishlistButtonProps {
  productId: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  showTooltip?: boolean;
}

export default function WishlistButton({
  productId,
  size = "md",
  className = "",
  showTooltip = true,
}: WishlistButtonProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isAnimating, setIsAnimating] = useState(false);
  const [showMessage, setShowMessage] = useState(false);

  const isFavorite = isInWishlist(productId);

  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isAnimating) return;

    setIsAnimating(true);
    const success = await toggleWishlist(productId);

    if (success && showTooltip) {
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 2000);
    }

    setTimeout(() => setIsAnimating(false), 300);
  };

  return (
    <div className="relative">
      <motion.button
        onClick={handleClick}
        className={`
          ${sizeClasses[size]}
          flex items-center justify-center
          rounded-full
          bg-noir/80 backdrop-blur-sm
          border border-or/20
          transition-all duration-300
          hover:border-or/50 hover:bg-noir
          group
          ${className}
        `}
        whileTap={{ scale: 0.9 }}
        aria-label={isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
      >
        <motion.svg
          className={`${iconSizes[size]} transition-colors duration-300 ${
            isFavorite ? "text-red-500" : "text-creme/70 group-hover:text-or"
          }`}
          fill={isFavorite ? "currentColor" : "none"}
          stroke="currentColor"
          viewBox="0 0 24 24"
          animate={isAnimating ? { scale: [1, 1.3, 1] } : {}}
          transition={{ duration: 0.3 }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={isFavorite ? 0 : 1.5}
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          />
        </motion.svg>

        {/* Particules d'animation */}
        <AnimatePresence>
          {isAnimating && isFavorite && (
            <>
              {[...Array(6)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-1 h-1 bg-red-500 rounded-full"
                  initial={{ scale: 0, x: 0, y: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    x: Math.cos((i * 60 * Math.PI) / 180) * 20,
                    y: Math.sin((i * 60 * Math.PI) / 180) * 20,
                  }}
                  exit={{ scale: 0 }}
                  transition={{ duration: 0.4 }}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </motion.button>

      {/* Tooltip message */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -5, scale: 0.9 }}
            className="absolute -bottom-10 left-1/2 -translate-x-1/2 whitespace-nowrap
                       px-3 py-1.5 bg-noir border border-or/30 rounded
                       text-xs text-creme shadow-lg z-50"
          >
            {isFavorite ? "Ajoute aux favoris" : "Retire des favoris"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
