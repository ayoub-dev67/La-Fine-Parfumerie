"use client";

import { motion } from "framer-motion";

interface ReviewStarsProps {
  rating: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
}

/**
 * Composant d'affichage des étoiles
 * Peut être interactif (pour formulaire) ou statique (pour affichage)
 */
export default function ReviewStars({
  rating,
  size = "md",
  interactive = false,
  onChange,
  showValue = false,
}: ReviewStarsProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (star: number) => {
    if (interactive && onChange) {
      onChange(star);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, star: number) => {
    if (interactive && onChange && (e.key === "Enter" || e.key === " ")) {
      e.preventDefault();
      onChange(star);
    }
  };

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= rating;
        const isHalf = star - 0.5 === rating;

        return (
          <motion.button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onKeyDown={(e) => handleKeyDown(e, star)}
            disabled={!interactive}
            className={`${
              interactive
                ? "cursor-pointer hover:scale-110 focus:outline-none focus:ring-2 focus:ring-or/50 rounded"
                : "cursor-default"
            } transition-transform disabled:cursor-default`}
            whileHover={interactive ? { scale: 1.1 } : {}}
            whileTap={interactive ? { scale: 0.95 } : {}}
            aria-label={interactive ? `Donner ${star} étoile${star > 1 ? "s" : ""}` : undefined}
          >
            <svg
              className={`${sizes[size]} ${
                isFilled ? "text-or" : "text-creme/20"
              } transition-colors`}
              fill={isFilled ? "currentColor" : "none"}
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
              />
            </svg>
          </motion.button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-creme/60 text-sm font-sans">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
}
